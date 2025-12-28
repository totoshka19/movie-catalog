import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { MediaItem, Genre } from '../../models/movie.model';
import { MoviesService } from '../../services/movies.service';
import { ModalService } from '../../services/modal.service';

import { MovieListComponent } from '../movie-list/movie-list.component';
import { SkeletonListComponent } from '../skeleton-list/skeleton-list.component';
import { MediaType, SortType } from '../../core/models/media-type.enum';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { InfiniteScrollDirective } from '../../directives/infinite-scroll.directive';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-media-list-page',
  standalone: true,
  imports: [
    MovieListComponent,
    SkeletonListComponent,
    SidebarComponent,
    HeaderComponent,
    InfiniteScrollDirective,
  ],
  templateUrl: './media-list-page.component.html',
  styleUrl: './media-list-page.component.scss',
})
export class MediaListPageComponent {
  private readonly moviesService = inject(MoviesService);
  private readonly modalService = inject(ModalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // --- Сигналы, получающие состояние из URL и resolver'а ---
  private readonly routeData = toSignal(this.route.data);
  private readonly queryParams = toSignal(this.route.queryParamMap);

  protected readonly allGenres = computed<Genre[]>(() => this.routeData()?.['genres'] ?? []);
  // Тип контента берем из данных роута
  protected readonly activeType = computed<MediaType>(
    () => this.routeData()?.['mediaType'] ?? MediaType.All
  );
  // Тип сортировки берем из query-параметров, по умолчанию 'newest'
  protected readonly activeSort = computed<SortType>(
    () => (this.queryParams()?.get('sort_by') as SortType) ?? SortType.Newest
  );

  protected readonly selectedGenres = computed<number[]>(() => {
    const genreParam = this.queryParams()?.get('genre');
    if (!genreParam) return [];
    return genreParam.split(',').map(id => Number(id)).filter(id => !isNaN(id));
  });

  protected readonly searchQuery = computed(() => this.queryParams()?.get('q') ?? '');

  protected readonly searchPlaceholder = computed(() => {
    switch (this.activeType()) {
      case MediaType.Movie:
        return 'Поиск фильмов...';
      case MediaType.Tv:
        return 'Поиск сериалов...';
      case MediaType.All:
      default:
        return 'Поиск фильмов и сериалов...';
    }
  });

  // --- Сигналы для управления состоянием UI и данными ---
  private readonly allMedia = signal<MediaItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isLoadingMore = signal(false);
  protected readonly error = signal<string | null>(null);

  private currentPage = 1;
  protected hasMorePages = true;

  // Логика фильтрации
  protected readonly filteredMedia = computed(() => {
    const media = this.allMedia();
    const genres = this.selectedGenres();
    const query = this.searchQuery();

    // ВАЖНО: Если мы используем поиск (query не пустой), то API вернул нам результаты
    // без учета жанров (так работает /search). Поэтому мы должны отфильтровать их
    // на клиенте здесь.
    if (query && genres.length > 0) {
      return media.filter(item => {
        // Оставляем элемент, если хотя бы один из его жанров есть в списке выбранных
        return item.genre_ids && item.genre_ids.some(id => genres.includes(id));
      });
    }

    // Если поиска нет (режим популярных), то фильтрация уже произошла на сервере (/discover),
    // или если фильтры не выбраны - возвращаем всё как есть.
    return media;
  });

  protected readonly emptyListMessage = computed(() => {
    const query = this.searchQuery();
    if (query) return `По запросу "${query}" ничего не найдено.`;

    switch (this.activeType()) {
      case MediaType.Movie:
        return 'Фильмы не найдены.';
      case MediaType.Tv:
        return 'Сериалы не найдены.';
      case MediaType.All:
      default:
        return 'Контент не найден.';
    }
  });

  constructor() {
    effect(() => {
      // Теперь загрузка зависит от 4-х параметров
      const type = this.activeType();
      const sortBy = this.activeSort();
      const genres = this.selectedGenres();
      const query = this.searchQuery();

      untracked(() => {
        this.resetAndLoad(type, sortBy, genres, query);
      });
    });
  }

  onGenreChange(genres: number[]): void {
    const genreParam = genres.length > 0 ? genres.join(',') : null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { genre: genreParam },
      queryParamsHandling: 'merge',
    });
  }

  onSearch(query: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: query || null },
      queryParamsHandling: 'merge',
    });
  }

  onMediaSelect(item: MediaItem): void {
    this.modalService.open(item);
  }

  // --- Методы загрузки данных ---

  private resetAndLoad(
    type: MediaType,
    sortBy: SortType,
    genreIds: number[],
    query: string
  ): void {
    this.currentPage = 1;
    this.hasMorePages = true;
    this.isLoading.set(true);
    this.error.set(null);
    this.allMedia.set([]);

    const request$ = this.getDataObservable(type, sortBy, genreIds, query, this.currentPage);

    request$.subscribe({
      next: media => {
        this.allMedia.set(media);
        this.isLoading.set(false);
        if (media.length === 0) {
          this.hasMorePages = false;
        }
      },
      error: err => {
        this.error.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  public loadNextPage(): void {
    this.isLoadingMore.set(true);
    this.currentPage++;
    const type = this.activeType();
    const sortBy = this.activeSort();
    const genreIds = this.selectedGenres();
    const query = this.searchQuery();

    const request$ = this.getDataObservable(type, sortBy, genreIds, query, this.currentPage);

    request$.subscribe({
      next: media => {
        if (media.length === 0) {
          this.hasMorePages = false;
        } else {
          this.allMedia.update(current => [...current, ...media]);
        }
        this.isLoadingMore.set(false);
      },
      error: err => {
        console.error('Ошибка подгрузки:', err);
        this.isLoadingMore.set(false);
      },
    });
  }

  private getDataObservable(
    type: MediaType,
    sortBy: SortType,
    genreIds: number[],
    query: string,
    page: number
  ): Observable<MediaItem[]> {
    if (query) {
      // При поиске мы игнорируем genreIds в запросе, так как API их не поддерживает.
      // Фильтрация произойдет в computed filteredMedia.
      return this.moviesService.searchMedia(query, type, page);
    } else {
      return this.moviesService.getPopularMedia(type, sortBy, genreIds, page);
    }
  }
}

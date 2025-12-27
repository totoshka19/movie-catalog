import { Component, computed, effect, HostListener, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { MediaItem, Genre } from '../../models/movie.model';
import { MoviesService, MediaType } from '../../services/movies.service';
import { ModalService } from '../../services/modal.service';

import { MovieListComponent } from '../movie-list/movie-list.component';
import { SkeletonListComponent } from '../skeleton-list/skeleton-list.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-media-list-page',
  standalone: true,
  imports: [RouterLink, MovieListComponent, SkeletonListComponent, SearchBarComponent],
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
  protected readonly activeTab = computed<MediaType>(() => this.routeData()?.['mediaType'] ?? 'all');

  protected readonly selectedGenre = computed(() => {
    const genreId = this.queryParams()?.get('genre');
    return genreId ? Number(genreId) : undefined;
  });

  protected readonly searchQuery = computed(() => this.queryParams()?.get('q') ?? '');

  protected readonly searchPlaceholder = computed(() => {
    switch (this.activeTab()) {
      case 'movie': return 'Поиск фильмов...';
      case 'tv': return 'Поиск сериалов...';
      default: return 'Поиск фильмов и сериалов...';
    }
  });

  // --- Сигналы для управления состоянием UI и данными ---
  private readonly allMedia = signal<MediaItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isLoadingMore = signal(false);
  protected readonly error = signal<string | null>(null);

  private currentPage = 1;
  private hasMorePages = true;

  protected readonly filteredMedia = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.allMedia();
    }
    return this.allMedia().filter(item => item.title.toLowerCase().includes(query));
  });

  protected readonly emptyListMessage = computed(() => {
    const query = this.searchQuery();
    if (query) return `По запросу "${query}" ничего не найдено.`;

    switch (this.activeTab()) {
      case 'movie': return 'Фильмы не найдены.';
      case 'tv': return 'Сериалы не найдены.';
      default: return 'Контент не найден.';
    }
  });

  constructor() {
    effect(() => {
      const type = this.activeTab();
      const genre = this.selectedGenre();

      untracked(() => {
        this.resetAndLoad(type, genre);
      });
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.isLoading() || this.isLoadingMore() || !this.hasMorePages || this.searchQuery()) {
      return;
    }

    const { pos, max } = this.getScrollPosition();
    const threshold = 500;

    if (pos >= max - threshold) {
      this.loadNextPage();
    }
  }

  /**
   * Вынесенный метод получения позиции скролла для удобства тестирования
   */
  protected getScrollPosition(): { pos: number; max: number } {
    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight;
    const max = document.documentElement.scrollHeight || document.body.scrollHeight;
    return { pos, max };
  }

  onGenreChange(event: Event): void {
    const selectedId = (event.target as HTMLSelectElement).value;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { genre: selectedId || null },
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

  private resetAndLoad(type: MediaType, genreId?: number): void {
    this.currentPage = 1;
    this.hasMorePages = true;
    this.isLoading.set(true);
    this.error.set(null);
    this.allMedia.set([]);

    this.moviesService.getPopularMedia(type, genreId, this.currentPage).subscribe({
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

  private loadNextPage(): void {
    this.isLoadingMore.set(true);
    this.currentPage++;
    const type = this.activeTab();
    const genreId = this.selectedGenre();

    this.moviesService.getPopularMedia(type, genreId, this.currentPage).subscribe({
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
      }
    });
  }
}

import { Component, computed, effect, HostListener, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Genre } from '../../models/movie.model';
import { ImdbTitle } from '../../models/imdb.model';
import { ModalService } from '../../services/modal.service';
import { MediaListStateService } from '../../services/media-list-state.service';
import { MovieListComponent } from '../movie-list/movie-list.component';
import { SkeletonListComponent } from '../skeleton-list/skeleton-list.component';
import { MediaType, SortType } from '../../core/models/media-type.enum';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { InfiniteScrollDirective } from '../../directives/infinite-scroll.directive';
import { ScrollLockService } from '../../services/scroll-lock.service';

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
  private readonly modalService = inject(ModalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mediaListState = inject(MediaListStateService);
  private readonly scrollLockService = inject(ScrollLockService);
  private readonly routeData = toSignal(this.route.data);
  private readonly queryParams = toSignal(this.route.queryParamMap);
  protected readonly isSidebarOpen = signal(false);
  protected readonly allGenres = computed<Genre[]>(() => this.routeData()?.['genres'] ?? []);
  protected readonly activeType = computed<MediaType>(
    () => this.routeData()?.['mediaType'] ?? MediaType.All
  );
  protected readonly activeSort = computed<SortType>(
    () => (this.queryParams()?.get('sort_by') as SortType) ?? SortType.TopRated
  );

  protected readonly selectedGenres = computed<string[]>(() => {
    const genreParam = this.queryParams()?.get('genre');
    if (!genreParam) return [];
    return genreParam.split(',').filter(id => id.length > 0);
  });

  protected readonly searchQuery = computed(() => this.queryParams()?.get('q') ?? '');
  protected readonly isLoading = this.mediaListState.isLoading;
  protected readonly isLoadingMore = this.mediaListState.isLoadingMore;
  protected readonly error = this.mediaListState.error;
  protected readonly filteredMedia = this.mediaListState.filteredMedia;
  protected get hasMorePages(): boolean {
    return this.mediaListState.canLoadMore();
  }

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

  protected readonly emptyListMessage = computed(() => {
    const query = this.searchQuery();
    if (query) return `По запросу "${query}" ничего не найдено.`;
    return 'Контент не найден.';
  });

  constructor() {
    effect(() => {
      const type = this.activeType();
      const sortBy = this.activeSort();
      const genres = this.selectedGenres();
      const query = this.searchQuery();

      untracked(() => {
        this.mediaListState.resetAndLoad(type, sortBy, genres, query);
      });
    });

    effect(onCleanup => {
      if (this.isSidebarOpen()) {
        this.scrollLockService.lock();
        onCleanup(() => {
          this.scrollLockService.unlock();
        });
      }
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 1023 && this.isSidebarOpen()) {
      this.isSidebarOpen.set(false);
    }
  }

  onGenreChange(genres: string[]): void {
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

  onMediaSelect(item: ImdbTitle): void {
    this.modalService.open(item);
  }

  loadNextPage(): void {
    this.mediaListState.loadNextPage();
  }

  onToggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  onCloseSidebar(): void {
    this.isSidebarOpen.set(false);
  }
}

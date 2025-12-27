import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { MediaItem, Genre } from '../../models/movie.model';
import { MoviesService, MediaType } from '../../services/movies.service';
import { ModalService } from '../../services/modal.service';

import { MovieListComponent } from '../movie-list/movie-list.component';
import { SkeletonListComponent } from '../skeleton-list/skeleton-list.component';

@Component({
  selector: 'app-media-list-page',
  standalone: true,
  imports: [RouterLink, MovieListComponent, SkeletonListComponent],
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

  // ИСПРАВЛЕНО: Получаем жанры из данных, которые предоставил resolver
  protected readonly allGenres = computed<Genre[]>(() => this.routeData()?.['genres'] ?? []);

  protected readonly activeTab = computed<MediaType>(() => this.routeData()?.['mediaType'] ?? 'all');
  protected readonly selectedGenre = computed(() => {
    const genreId = this.queryParams()?.get('genre');
    return genreId ? Number(genreId) : undefined;
  });
  protected readonly searchQuery = computed(() => this.queryParams()?.get('q') ?? '');

  // --- Сигналы для управления состоянием UI и данными ---
  private readonly allMedia = signal<MediaItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly filteredMedia = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.allMedia();
    }
    return this.allMedia().filter(item => item.title.toLowerCase().includes(query));
  });

  constructor() {
    // Реактивный эффект: перезагружает данные при смене таба или жанра
    effect(() => {
      this.loadMedia(this.activeTab(), this.selectedGenre());
    });
  }

  // ngOnInit больше не нужен для загрузки жанров

  // --- Обработчики событий от UI ---

  onGenreChange(event: Event): void {
    const selectedId = (event.target as HTMLSelectElement).value;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { genre: selectedId || null },
      queryParamsHandling: 'merge',
    });
  }

  onMediaSelect(item: MediaItem): void {
    this.modalService.open(item);
  }

  // --- Метод загрузки данных ---

  private loadMedia(type: MediaType, genreId?: number): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.moviesService.getPopularMedia(type, genreId).subscribe({
      next: media => {
        this.allMedia.set(media);
        this.isLoading.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.isLoading.set(false);
      },
    });
  }
}

import { computed, inject, Injectable, signal } from '@angular/core';

import { MoviesService } from './movies.service';
import { MediaType, SortType } from '../core/models/media-type.enum';
import { ImdbTitle } from '../models/imdb.model';

/**
 * Сервис для управления состоянием страницы со списком медиа.
 */
@Injectable({
  providedIn: 'root',
})
export class MediaListStateService {
  private readonly moviesService = inject(MoviesService);
  private readonly allTitles = signal<ImdbTitle[]>([]);
  public readonly isLoading = signal(true);
  public readonly isLoadingMore = signal(false);
  public readonly error = signal<string | null>(null);
  private nextPageToken: string | null = null;
  private hasMoreData = true;
  private currentType: MediaType = MediaType.All;
  private currentSortBy: SortType = SortType.Newest;
  private currentGenres: string[] = []; // ID теперь строки
  private currentQuery: string = '';

  /**
   * Список медиа для отображения.
   */
  public readonly filteredMedia = computed(() => this.allTitles());

  /**
   * Сбрасывает состояние и загружает первую страницу данных.
   */
  public resetAndLoad(
    type: MediaType,
    sortBy: SortType,
    genreIds: string[],
    query: string
  ): void {
    this.currentType = type;
    this.currentSortBy = sortBy;
    this.currentGenres = genreIds;
    this.currentQuery = query;
    this.nextPageToken = null;
    this.hasMoreData = true;
    this.isLoading.set(true);
    this.error.set(null);
    this.allTitles.set([]);

    if (query) {
      this.loadSearch(query);
    } else {
      this.loadTitles(type, sortBy, genreIds, undefined);
    }
  }

  /**
   * Загружает следующую страницу данных.
   */
  public loadNextPage(): void {
    if (this.isLoadingMore() || !this.hasMoreData) {
      return;
    }

    this.isLoadingMore.set(true);

    if (this.currentQuery) {
      // API поиска пока не поддерживает пагинацию в явном виде в этом клиенте,
      // или мы можем добавить поддержку pageToken в searchTitles позже.
      // Для простоты пока оставим без подгрузки поиска, если API не вернет токен.
      this.isLoadingMore.set(false);
    } else {
      this.loadTitles(
        this.currentType,
        this.currentSortBy,
        this.currentGenres,
        this.nextPageToken || undefined
      );
    }
  }

  /**
   * Публичный геттер проверки возможности подгрузки.
   */
  public canLoadMore(): boolean {
    return this.hasMoreData;
  }

  // --- Внутренние методы загрузки ---

  private loadTitles(
    type: MediaType,
    sortBy: SortType,
    genres: string[],
    token?: string
  ): void {
    this.moviesService.getTitles(type, sortBy, genres, token).subscribe({
      next: response => {
        this.nextPageToken = response.nextPageToken;
        this.hasMoreData = !!response.nextPageToken;

        if (token) {
          this.allTitles.update(current => [...current, ...response.titles]);
          this.isLoadingMore.set(false);
        } else {
          this.allTitles.set(response.titles);
          this.isLoading.set(false);
        }
      },
      error: err => {
        this.handleError(err);
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
    });
  }

  private loadSearch(query: string): void {
    this.moviesService.searchTitles(query).subscribe({
      next: response => {
        // Поиск в этом API может не возвращать токен пагинации в том же формате,
        // но если вернет - сохраним.
        this.nextPageToken = response.nextPageToken || null;
        this.hasMoreData = !!this.nextPageToken;

        this.allTitles.set(response.titles);
        this.isLoading.set(false);
      },
      error: err => {
        this.handleError(err);
        this.isLoading.set(false);
      },
    });
  }

  private handleError(err: any): void {
    console.error('API Error:', err);
    this.error.set('Не удалось загрузить данные. Попробуйте позже.');
  }
}

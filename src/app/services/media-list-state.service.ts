import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { MoviesService } from './movies.service';
import { MediaItem } from '../models/movie.model';
import { MediaType, SortType } from '../core/models/media-type.enum';

/**
 * Сервис для управления состоянием страницы со списком медиа.
 * Инкапсулирует логику загрузки, пагинации, фильтрации и состояний UI.
 */
@Injectable({
  providedIn: 'root',
})
export class MediaListStateService {
  private readonly moviesService = inject(MoviesService);

  // --- Приватные сигналы для управления состоянием ---
  private readonly allMedia = signal<MediaItem[]>([]);
  private readonly selectedGenres = signal<number[]>([]);
  private readonly searchQuery = signal<string>('');

  // --- Публичные сигналы состояния для UI ---
  public readonly isLoading = signal(true);
  public readonly isLoadingMore = signal(false);
  public readonly error = signal<string | null>(null);

  // --- Приватные свойства для пагинации ---
  private currentPage = 1;
  private hasMorePages = true;

  // --- Приватные свойства для хранения текущих параметров запроса ---
  private currentType: MediaType = MediaType.All;
  private currentSortBy: SortType = SortType.Newest;

  /**
   * Отфильтрованный список медиа.
   * Если активен поиск по строке (query), то дополнительно фильтрует
   * результаты на клиенте по выбранным жанрам, т.к. API поиска
   * не поддерживает фильтрацию по жанрам в одном запросе.
   */
  public readonly filteredMedia = computed(() => {
    const media = this.allMedia();
    const genres = this.selectedGenres();
    const query = this.searchQuery();

    if (query && genres.length > 0) {
      return media.filter(item => {
        return item.genre_ids && item.genre_ids.some(id => genres.includes(id));
      });
    }
    return media;
  });

  /**
   * Сбрасывает состояние и загружает первую страницу данных
   * на основе предоставленных параметров.
   * @param type - Тип медиа (фильмы, сериалы, все).
   * @param sortBy - Тип сортировки.
   * @param genreIds - Массив ID выбранных жанров.
   * @param query - Поисковый запрос.
   */
  public resetAndLoad(
    type: MediaType,
    sortBy: SortType,
    genreIds: number[],
    query: string
  ): void {
    // Сохраняем текущие параметры для использования в `loadNextPage`
    this.currentType = type;
    this.currentSortBy = sortBy;

    // Обновляем сигналы, от которых зависит `filteredMedia`
    this.selectedGenres.set(genreIds);
    this.searchQuery.set(query);

    // Сбрасываем состояние
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

  /**
   * Загружает следующую страницу данных.
   * Не делает ничего, если идет загрузка или больше нет страниц.
   */
  public loadNextPage(): void {
    if (this.isLoadingMore() || !this.hasMorePages) {
      return;
    }

    this.isLoadingMore.set(true);
    this.currentPage++;

    const request$ = this.getDataObservable(
      this.currentType,
      this.currentSortBy,
      this.selectedGenres(),
      this.searchQuery(),
      this.currentPage
    );

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

  /**
   * Возвращает Observable для получения данных в зависимости от того,
   * используется поиск или просмотр популярных.
   */
  private getDataObservable(
    type: MediaType,
    sortBy: SortType,
    genreIds: number[],
    query: string,
    page: number
  ): Observable<MediaItem[]> {
    if (query) {
      return this.moviesService.searchMedia(query, type, page);
    } else {
      return this.moviesService.getPopularMedia(type, sortBy, genreIds, page);
    }
  }

  /**
   * Публичный геттер, чтобы компонент мог проверить, можно ли еще подгружать данные.
   */
  public canLoadMore(): boolean {
    return this.hasMorePages;
  }
}

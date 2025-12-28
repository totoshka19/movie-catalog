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
   * Отфильтрованный и отсортированный список медиа.
   * Если активен поиск по строке (query), то дополнительно фильтрует
   * и сортирует результаты на клиенте, так как API поиска не
   * поддерживает эти операции в одном запросе.
   */
  public readonly filteredMedia = computed(() => {
    const media = this.allMedia();
    const genres = this.selectedGenres();
    const query = this.searchQuery();
    const sortBy = this.currentSortBy; // Используем сохраненный тип сортировки

    // Шаг 1: Фильтрация по жанрам (только при активном поиске)
    const genreFilteredMedia =
      query && genres.length > 0
        ? media.filter(item => item.genre_ids?.some(id => genres.includes(id)))
        : media;

    // Шаг 2: Сортировка (только при активном поиске)
    if (query) {
      // Создаем копию массива, чтобы не мутировать исходный
      const sortedMedia = [...genreFilteredMedia];
      switch (sortBy) {
        case SortType.TopRated:
          return sortedMedia.sort((a, b) => b.vote_average - a.vote_average);
        case SortType.Newest:
          return sortedMedia.sort((a, b) => {
            // Преобразуем строки в даты для корректного сравнения
            const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
            const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
            return dateB - dateA;
          });
        default:
          return sortedMedia;
      }
    }

    // Если поиска нет, возвращаем как есть (API уже отсортировал)
    return genreFilteredMedia;
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
    // Сохраняем текущие параметры для использования в `loadNextPage` и `filteredMedia`
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
      // При поиске мы игнорируем sortBy и genreIds в запросе к API,
      // так как они будут применены на клиенте.
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

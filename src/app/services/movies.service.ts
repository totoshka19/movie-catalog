import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { MediaType, SortType } from '../core/models/media-type.enum';
import {
  ImdbListInterestCategoriesResponse,
  ImdbListTitleCreditsResponse,
  ImdbListTitlesResponse,
  ImdbListTitleVideosResponse,
  ImdbSortBy,
  ImdbSortOrder,
  ImdbTitle,
  ImdbTitleType,
} from '../models/imdb.model';
import { Genre } from '../models/movie.model';

export interface TitleQueryParams {
  types?: ImdbTitleType[];
  genres?: string[];
  sortBy?: ImdbSortBy;
  sortOrder?: ImdbSortOrder;
  pageToken?: string;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Загружает список жанров (интересов) из API.
   * Адаптирует ответ к интерфейсу Genre[].
   */
  loadGenres(): Observable<Genre[]> {
    return this.http.get<ImdbListInterestCategoriesResponse>(`${this.apiUrl}/interests`).pipe(
      map(response => {
        // Извлекаем интересы из всех категорий и превращаем в плоский список
        const allInterests = response.categories.flatMap(cat => cat.interests);
        // Маппим в формат Genre
        return allInterests.map(interest => ({
          id: interest.id, // строковый ID, например "action"
          name: interest.name,
        }));
      })
    );
  }

  /**
   * Основной метод получения списка тайтлов (Фильмы/Сериалы) с фильтрацией.
   * Заменяет старый getPopularMedia.
   */
  getTitles(
    mediaType: MediaType,
    sortBy: SortType,
    genres: string[] = [], // IDs жанров
    pageToken?: string
  ): Observable<ImdbListTitlesResponse> {
    let params = new HttpParams();

    // 1. Маппинг типов (Movie/Tv -> ImdbTitleType)
    const types = this.mapMediaTypeToImdbType(mediaType);
    if (types.length) {
      types.forEach(t => (params = params.append('types', t)));
    }

    // 2. Маппинг сортировки
    const { sort, order } = this.mapSortType(sortBy);
    params = params.set('sortBy', sort).set('sortOrder', order);

    // 3. Жанры
    if (genres.length) {
      genres.forEach(g => (params = params.append('genres', g)));
    }

    // 4. Пагинация
    if (pageToken) {
      params = params.set('pageToken', pageToken);
    }

    // Доп. фильтры для чистоты выдачи (исключаем без рейтинга и постеров, если нужно)
    // params = params.set('minVoteCount', 100);

    return this.http.get<ImdbListTitlesResponse>(`${this.apiUrl}/titles`, { params });
  }

  /**
   * Поиск по названию.
   * Использует отдельный эндпоинт /search/titles.
   */
  searchTitles(query: string, limit: number = 20): Observable<ImdbListTitlesResponse> {
    const params = new HttpParams().set('query', query).set('limit', limit);
    return this.http.get<ImdbListTitlesResponse>(`${this.apiUrl}/search/titles`, { params });
  }

  /**
   * Получение детальной информации о тайтле.
   * Делает параллельные запросы за деталями, кредитами и видео.
   */
  getTitleDetails(id: string): Observable<ImdbTitle> {
    // 1. Основная инфо
    const details$ = this.http.get<ImdbTitle>(`${this.apiUrl}/titles/${id}`);

    // 2. Актеры (Credits)
    const credits$ = this.http.get<ImdbListTitleCreditsResponse>(`${this.apiUrl}/titles/${id}/credits`, {
      params: { pageSize: 10 }
    });

    // 3. Видео (Трейлеры)
    const videos$ = this.http.get<ImdbListTitleVideosResponse>(`${this.apiUrl}/titles/${id}/videos`, {
      params: { pageSize: 5 }
    });

    return forkJoin({
      details: details$,
      creditsResp: credits$,
      videosResp: videos$
    }).pipe(
      map(({ details, creditsResp, videosResp }) => {
        // Обогащаем основной объект деталями
        return {
          ...details,
          creditsList: creditsResp.credits,
          videosList: videosResp.videos
        } as ImdbTitle & { creditsList: any[], videosList: any[] };
      })
    );
  }

  // --- Helpers ---

  private mapMediaTypeToImdbType(type: MediaType): ImdbTitleType[] {
    switch (type) {
      case MediaType.Movie:
        return [ImdbTitleType.Movie, ImdbTitleType.TvMovie];
      case MediaType.Tv:
        return [ImdbTitleType.TvSeries, ImdbTitleType.TvMiniSeries];
      case MediaType.All:
      default:
        return []; // Пустой массив = все типы
    }
  }

  private mapSortType(sort: SortType): { sort: ImdbSortBy; order: ImdbSortOrder } {
    switch (sort) {
      case SortType.Newest:
        return { sort: ImdbSortBy.ReleaseDate, order: ImdbSortOrder.Desc };
      case SortType.TopRated:
        return { sort: ImdbSortBy.UserRating, order: ImdbSortOrder.Desc };
      default:
        return { sort: ImdbSortBy.Popularity, order: ImdbSortOrder.Desc };
    }
  }
}

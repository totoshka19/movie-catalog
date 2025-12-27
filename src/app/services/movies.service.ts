import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  ApiListResponse,
  Genre,
  GenreListResponse,
  MediaItem,
  TmdbMovie,
  TmdbTvShow,
} from '../models/movie.model';
import { environment } from '../../environments/environment';

// Определяем тип для фильтрации
export type MediaType = 'all' | 'movie' | 'tv';

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Кэш для жанров, чтобы не запрашивать их каждый раз
  private movieGenreMap = new Map<number, string>();
  private tvGenreMap = new Map<number, string>();
  private movieGenres: Genre[] = [];
  private tvGenres: Genre[] = [];

  /**
   * Загружает и кэширует жанры для фильмов и сериалов.
   * @returns Observable, который завершается, когда жанры загружены.
   */
  loadGenres(): Observable<[Genre[], Genre[]]> {
    if (this.movieGenres.length > 0 && this.tvGenres.length > 0) {
      return of([this.movieGenres, this.tvGenres]);
    }

    const movieGenres$ = this.http.get<GenreListResponse>(`${this.apiUrl}/genre/movie/list`);
    const tvGenres$ = this.http.get<GenreListResponse>(`${this.apiUrl}/genre/tv/list`);

    return forkJoin([movieGenres$, tvGenres$]).pipe(
      tap(([movieGenresResponse, tvGenresResponse]) => {
        this.movieGenres = movieGenresResponse.genres;
        this.tvGenres = tvGenresResponse.genres;

        movieGenresResponse.genres.forEach(genre => this.movieGenreMap.set(genre.id, genre.name));
        tvGenresResponse.genres.forEach(genre => this.tvGenreMap.set(genre.id, genre.name));
      }),
      map(
        ([movieGenresResponse, tvGenresResponse]): [Genre[], Genre[]] => [
          movieGenresResponse.genres,
          tvGenresResponse.genres,
        ]
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Получает популярные фильмы и/или сериалы с возможностью фильтрации по жанру.
   * @param type - Тип контента для загрузки ('all', 'movie', 'tv').
   * @param genreId - ID жанра для фильтрации.
   * @returns Observable со списком медиа-элементов.
   */
  getPopularMedia(type: MediaType = 'all', genreId?: number): Observable<MediaItem[]> {
    // Убеждаемся, что жанры загружены, перед тем как делать основной запрос
    return this.loadGenres().pipe(
      switchMap(() => {
        let params = new HttpParams();
        if (genreId) {
          params = params.set('with_genres', genreId.toString());
        }

        const movies$ =
          type === 'all' || type === 'movie'
            ? this.http.get<ApiListResponse<TmdbMovie>>(`${this.apiUrl}/movie/popular`, { params })
            : of(null);
        const tvShows$ =
          type === 'all' || type === 'tv'
            ? this.http.get<ApiListResponse<TmdbTvShow>>(`${this.apiUrl}/tv/popular`, { params })
            : of(null);

        return forkJoin([movies$, tvShows$]).pipe(
          map(([moviesResponse, tvShowsResponse]) => {
            const movies = moviesResponse ? this.normalizeMovies(moviesResponse.results) : [];
            const tvShows = tvShowsResponse ? this.normalizeTvShows(tvShowsResponse.results) : [];

            if (type === 'all') {
              return this.interleaveArrays(movies, tvShows);
            } else {
              return [...movies, ...tvShows];
            }
          })
        );
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Получает детальную информацию о фильме или сериале по его ID.
   * @param id - ID элемента.
   * @param type - Тип элемента ('movie' или 'tv').
   * @returns Observable с детальными данными.
   */
  getMediaDetails(id: number, type: 'movie' | 'tv'): Observable<MediaItem> {
    const url = `${this.apiUrl}/${type}/${id}`;
    if (type === 'movie') {
      return this.http.get<TmdbMovie>(url).pipe(
        map(movie => this.normalizeMovies([movie])[0]),
        catchError(this.handleError)
      );
    } else {
      return this.http.get<TmdbTvShow>(url).pipe(
        map(tv => this.normalizeTvShows([tv])[0]),
        catchError(this.handleError)
      );
    }
  }

  // --- Приватные методы-хелперы для нормализации данных ---

  private normalizeMovies(movies: TmdbMovie[]): MediaItem[] {
    return movies.map(movie => ({
      ...movie,
      media_type: 'movie',
      title: movie.title,
      release_date: movie.release_date,
      genreNames: movie.genres
        ? movie.genres.map(g => g.name)
        : movie.genre_ids.map(id => this.movieGenreMap.get(id)!).filter(Boolean),
    }));
  }

  private normalizeTvShows(tvShows: TmdbTvShow[]): MediaItem[] {
    return tvShows.map(tv => ({
      ...tv,
      media_type: 'tv',
      title: tv.name,
      release_date: tv.first_air_date,
      genreNames: tv.genres
        ? tv.genres.map(g => g.name)
        : tv.genre_ids.map(id => this.tvGenreMap.get(id)!).filter(Boolean),
    }));
  }

  /**
   * НОВЫЙ МЕТОД: Объединяет два массива, чередуя их элементы.
   * @param movies - Массив с фильмами.
   * @param tvShows - Массив с сериалами.
   * @returns Один массив с чередующимися элементами.
   */
  private interleaveArrays(movies: MediaItem[], tvShows: MediaItem[]): MediaItem[] {
    const result: MediaItem[] = [];
    const maxLength = Math.max(movies.length, tvShows.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < movies.length) {
        result.push(movies[i]);
      }
      if (i < tvShows.length) {
        result.push(tvShows[i]);
      }
    }
    return result;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Произошла ошибка: ${error.error.message}`;
    } else {
      errorMessage = `Сервер вернул код ${error.status}, сообщение: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error('Не удалось загрузить данные. Пожалуйста, попробуйте позже.'));
  }
}

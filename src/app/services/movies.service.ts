import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  ApiListResponse,
  Genre,
  GenreListResponse,
  MediaItem,
  TmdbMovie,
  TmdbTvShow,
} from '../models/movie.model';
import { environment } from '../../environments/environment';
import { MediaType, SortType } from '../core/models/media-type.enum';

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private movieGenreMap = new Map<number, string>();
  private tvGenreMap = new Map<number, string>();
  private movieGenres: Genre[] = [];
  private tvGenres: Genre[] = [];

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

  getPopularMedia(
    type: MediaType,
    sortBy: SortType,
    genreIds: number[] = [],
    page: number = 1
  ): Observable<MediaItem[]> {
    let baseParams = new HttpParams().set('page', page.toString());

    if (genreIds && genreIds.length > 0) {
      baseParams = baseParams.set('with_genres', genreIds.join(','));
    }

    // Получаем сегодняшнюю дату в формате YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // Устанавливаем параметры сортировки
    switch (sortBy) {
      case SortType.Newest:
        // Для новинок добавляем фильтр, чтобы не показывать еще не вышедшие
        break;
      case SortType.TopRated:
        baseParams = baseParams
          .set('sort_by', 'vote_average.desc')
          .set('vote_count.gte', '300'); // Отсекаем фильмы с малым числом голосов
        break;
    }

    // Определяем, нужно ли запрашивать фильмы и/или сериалы
    const fetchMovies = type === MediaType.All || type === MediaType.Movie;
    const fetchTv = type === MediaType.All || type === MediaType.Tv;

    // Клонируем базовые параметры для каждого типа, чтобы добавить специфичную сортировку
    let movieParams = baseParams;
    let tvParams = baseParams;

    if (sortBy === SortType.Newest) {
      // Добавляем сортировку по дате и фильтр по максимальной дате (сегодня)
      movieParams = baseParams
        .set('sort_by', 'primary_release_date.desc')
        .set('primary_release_date.lte', today);
      tvParams = baseParams
        .set('sort_by', 'first_air_date.desc')
        .set('first_air_date.lte', today);
    }

    const movies$ = fetchMovies
      ? this.http.get<ApiListResponse<TmdbMovie>>(`${this.apiUrl}/discover/movie`, {
        params: movieParams,
      })
      : of(null);
    const tvShows$ = fetchTv
      ? this.http.get<ApiListResponse<TmdbTvShow>>(`${this.apiUrl}/discover/tv`, {
        params: tvParams,
      })
      : of(null);

    return this.processMediaRequests(movies$, tvShows$, type);
  }

  searchMedia(
    query: string,
    type: MediaType = MediaType.All,
    page: number = 1
  ): Observable<MediaItem[]> {
    const params = new HttpParams().set('query', query).set('page', page.toString());

    const movies$ =
      type === MediaType.All || type === MediaType.Movie
        ? this.http.get<ApiListResponse<TmdbMovie>>(`${this.apiUrl}/search/movie`, { params })
        : of(null);
    const tvShows$ =
      type === MediaType.All || type === MediaType.Tv
        ? this.http.get<ApiListResponse<TmdbTvShow>>(`${this.apiUrl}/search/tv`, { params })
        : of(null);

    return this.processMediaRequests(movies$, tvShows$, type);
  }

  getMediaDetails(id: number, type: MediaType.Movie | MediaType.Tv): Observable<MediaItem> {
    const url = `${this.apiUrl}/${type}/${id}`;
    if (type === MediaType.Movie) {
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

  // --- Приватные методы ---

  private processMediaRequests(
    movies$: Observable<ApiListResponse<TmdbMovie> | null>,
    tvShows$: Observable<ApiListResponse<TmdbTvShow> | null>,
    type: MediaType
  ): Observable<MediaItem[]> {
    return forkJoin([movies$, tvShows$]).pipe(
      map(([moviesResponse, tvShowsResponse]) => {
        const movies = moviesResponse ? this.normalizeMovies(moviesResponse.results) : [];
        const tvShows = tvShowsResponse ? this.normalizeTvShows(tvShowsResponse.results) : [];

        if (type === MediaType.All) {
          return this.interleaveArrays(movies, tvShows);
        } else {
          return [...movies, ...tvShows];
        }
      }),
      catchError(this.handleError)
    );
  }

  private normalizeMovies(movies: TmdbMovie[]): MediaItem[] {
    return movies.map(movie => ({
      ...movie,
      media_type: MediaType.Movie,
      title: movie.title,
      release_date: movie.release_date,
      genre_ids: movie.genre_ids || (movie.genres ? movie.genres.map(g => g.id) : []),
      genreNames: movie.genres
        ? movie.genres.map(g => g.name)
        : movie.genre_ids.map(id => this.movieGenreMap.get(id)!).filter(Boolean),
    }));
  }

  private normalizeTvShows(tvShows: TmdbTvShow[]): MediaItem[] {
    return tvShows.map(tv => ({
      ...tv,
      media_type: MediaType.Tv,
      title: tv.name,
      release_date: tv.first_air_date,
      genre_ids: tv.genre_ids || (tv.genres ? tv.genres.map(g => g.id) : []),
      genreNames: tv.genres
        ? tv.genres.map(g => g.name)
        : tv.genre_ids.map(id => this.tvGenreMap.get(id)!).filter(Boolean),
    }));
  }

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

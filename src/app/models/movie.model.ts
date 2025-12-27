import { MediaType } from '../core/models/media-type.enum';

/**
 * Интерфейс для жанра, как его возвращает TMDb API.
 */
export interface Genre {
  id: number;
  name: string;
}

/**
 * Интерфейс для ответа от API со списком жанров.
 */
export interface GenreListResponse {
  genres: Genre[];
}

/**
 * "Сырой" интерфейс для фильма, как его возвращает TMDb API.
 */
export interface TmdbMovie {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  vote_average: number;
  poster_path: string | null;
  genre_ids: number[];
  genres?: Genre[];
}

/**
 * "Сырой" интерфейс для сериала, как его возвращает TMDb API.
 */
export interface TmdbTvShow {
  id: number;
  name: string;
  first_air_date: string;
  overview: string;
  vote_average: number;
  poster_path: string | null;
  genre_ids: number[];
  genres?: Genre[];
}

/**
 * Унифицированный интерфейс для отображения в приложении (фильм или сериал).
 */
export interface MediaItem {
  id: number;
  media_type: MediaType.Movie | MediaType.Tv;
  title: string;
  release_date: string;
  overview: string;
  vote_average: number;
  poster_path: string | null;
  genres?: Genre[];
  genreNames: string[];
}

/**
 * Обобщенный интерфейс для ответа от API со списком.
 */
export interface ApiListResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

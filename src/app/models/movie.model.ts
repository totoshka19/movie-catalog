import { MediaType } from '../core/models/media-type.enum';

/**
 * Интерфейс для жанра.
 */
export interface Genre {
  id: number | string;
  name: string;
}

/**
 * Интерфейс для ответа от API со списком жанров.
 */
export interface GenreListResponse {
  genres: Genre[];
}

// --- Новые интерфейсы для расширенных данных ---

/**
 * Интерфейс для актера.
 */
export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

/**
 * Интерфейс для члена съемочной группы.
 */
export interface CrewMember {
  id: number;
  name: string;
  job: string;
}

/**
 * Интерфейс для объекта credits.
 */
export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

/**
 * Интерфейс для видео (трейлера).
 */
export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

/**
 * Интерфейс для ответа от API со списком видео.
 */
export interface VideoResponse {
  results: Video[];
}

/**
 * "Сырой" интерфейс для фильма, как его возвращает TMDb API.
 * Дополнен опциональными полями для расширенных данных.
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
  tagline?: string;
  runtime?: number;
  status?: string;
  credits?: Credits;
  videos?: VideoResponse;
  recommendations?: ApiListResponse<TmdbMovie>;
}

/**
 * "Сырой" интерфейс для сериала, как его возвращает TMDb API.
 * Дополнен опциональными полями для расширенных данных.
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
  tagline?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  credits?: Credits;
  videos?: VideoResponse;
  recommendations?: ApiListResponse<TmdbTvShow>;
}

/**
 * Унифицированный интерфейс для отображения в приложении (фильм или сериал).
 * Дополнен новыми полями.
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
  genre_ids: number[];
  tagline?: string;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  credits?: Credits;
  videos?: Video[];
  recommendations?: MediaItem[];
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

import { ImdbTitleType } from '../models/imdb.model';
import { MediaType } from '../core/models/media-type.enum';

/**
 * Преобразует тип медиа из API (ImdbTitleType) в тип, используемый в приложении для роутинга (MediaType).
 * @param imdbType - Тип из API (например, 'TV_SERIES', 'MOVIE').
 * @returns 'movie' или 'tv'.
 */
export function mapImdbTypeToMediaType(imdbType: ImdbTitleType | string): MediaType.Movie | MediaType.Tv {
  const type = imdbType.toLowerCase();

  switch (type) {
    // Все, что относится к сериалам
    case 'tv_series':
    case 'tv_mini_series':
    case 'tv_special':
      return MediaType.Tv;

    // Все остальное (включая MOVIE, SHORT, VIDEO и т.д.) считаем фильмами
    case 'movie':
    case 'tv_movie':
    case 'short':
    case 'video':
    case 'video_game':
    case 'videogame':
    default:
      return MediaType.Movie;
  }
}

/**
 * Преобразует тип медиа из приложения (MediaType) в массив типов для запроса к IMDb API.
 * @param mediaType - Тип, используемый в приложении ('all', 'movie', 'tv').
 * @returns Массив ImdbTitleType.
 */
export function mapMediaTypeToImdbTypes(mediaType: MediaType): ImdbTitleType[] {
  switch (mediaType) {
    case MediaType.Movie:
      return [ImdbTitleType.Movie, ImdbTitleType.TvMovie];
    case MediaType.Tv:
      return [ImdbTitleType.TvSeries, ImdbTitleType.TvMiniSeries];
    case MediaType.All:
    default:
      return []; // Пустой массив означает все типы
  }
}

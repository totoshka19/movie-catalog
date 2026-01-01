/**
 * Типы тайтлов в IMDb API.
 */
export enum ImdbTitleType {
  Movie = 'MOVIE',
  TvSeries = 'TV_SERIES',
  TvMiniSeries = 'TV_MINI_SERIES',
  TvSpecial = 'TV_SPECIAL',
  TvMovie = 'TV_MOVIE',
  Short = 'SHORT',
  Video = 'VIDEO',
  VideoGame = 'VIDEO_GAME',
}

/**
 * Варианты сортировки.
 */
export enum ImdbSortBy {
  Popularity = 'SORT_BY_POPULARITY',
  ReleaseDate = 'SORT_BY_RELEASE_DATE',
  UserRating = 'SORT_BY_USER_RATING',
  UserRatingCount = 'SORT_BY_USER_RATING_COUNT',
  Year = 'SORT_BY_YEAR',
}

/**
 * Порядок сортировки.
 */
export enum ImdbSortOrder {
  Asc = 'ASC',
  Desc = 'DESC',
}

// --- Shared Interfaces (Общие интерфейсы) ---

export interface ImdbImage {
  url: string;
  width: number;
  height: number;
  type?: string;
}

export interface ImdbPrecisionDate {
  year: number;
  month: number;
  day: number;
}

export interface ImdbRating {
  aggregateRating: number;
  voteCount: number;
}

export interface ImdbCountry {
  code: string;
  name: string;
}

export interface ImdbLanguage {
  code: string;
  name: string;
}

export interface ImdbMoney {
  amount: string;
  currency: string;
}

// --- Entity Interfaces (Сущности) ---

/**
 * Персона (Актер, Режиссер и т.д.)
 */
export interface ImdbName {
  id: string;
  displayName: string;
  primaryImage?: ImdbImage;
  birthDate?: ImdbPrecisionDate;
  deathDate?: ImdbPrecisionDate;
  primaryProfessions?: string[];
}

/**
 * Интерес (Жанр)
 */
export interface ImdbInterest {
  id: string;
  name: string;
  isSubgenre?: boolean;
}

/**
 * Категория интересов (для группировки жанров)
 */
export interface ImdbInterestCategory {
  category: string;
  interests: ImdbInterest[];
}

/**
 * Видео (Трейлер)
 */
export interface ImdbVideo {
  id: string;
  name: string;
  description?: string;
  primaryImage?: ImdbImage;
  type: string;
  runtimeSeconds?: number;
}

/**
 * Кредит (Роль в фильме)
 */
export interface ImdbCredit {
  title?: ImdbTitle;
  name?: ImdbName;
  category: string;
  characters?: string[];
  episodeCount?: number;
}

/**
 * Основная сущность: Фильм или Сериал.
 */
export interface ImdbTitle {
  id: string;
  type: ImdbTitleType;
  primaryTitle: string;
  originalTitle: string;
  isAdult: boolean;
  startYear?: number;
  endYear?: number;
  runtimeSeconds?: number;
  plot?: string;

  // Связанные объекты
  primaryImage?: ImdbImage;
  rating?: ImdbRating;

  // Помечаем как опциональное, чтобы избежать ошибок runtime, если API не вернет поле
  genres?: string[];

  // Списки связанных персон и сущностей
  directors?: ImdbName[];
  writers?: ImdbName[];
  stars?: ImdbName[];
  originCountries?: ImdbCountry[];
  spokenLanguages?: ImdbLanguage[];
  interests?: ImdbInterest[];

  // Расширенные поля (заполняются при детальном запросе)
  creditsList?: ImdbCredit[];
  videosList?: ImdbVideo[];
}

// --- Response Interfaces (Ответы API) ---

/**
 * Ответ списка тайтлов (с пагинацией).
 */
export interface ImdbListTitlesResponse {
  titles: ImdbTitle[];
  totalCount: number;
  nextPageToken: string | null;
}

/**
 * Ответ списка категорий интересов (жанров).
 */
export interface ImdbListInterestCategoriesResponse {
  categories: ImdbInterestCategory[];
}

/**
 * Ответ списка видео для тайтла.
 */
export interface ImdbListTitleVideosResponse {
  videos: ImdbVideo[];
  totalCount: number;
  nextPageToken: string | null;
}

/**
 * Ответ списка кредитов (актеров/съемочной группы).
 */
export interface ImdbListTitleCreditsResponse {
  credits: ImdbCredit[];
  totalCount: number;
  nextPageToken: string | null;
}

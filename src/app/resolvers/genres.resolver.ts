import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { MoviesService } from '../services/movies.service';
import { Genre } from '../models/movie.model';
import { MediaType } from '../core/models/media-type.enum';

/**
 * Resolver, который загружает жанры.
 * 1. Выбирает нужный список в зависимости от URL (фильмы, сериалы или всё).
 * 2. Делает первую букву названия заглавной.
 * 3. Сортирует по алфавиту.
 */
export const genresResolver: ResolveFn<Genre[]> = (route) => {
  const moviesService = inject(MoviesService);
  // Получаем тип медиа из данных маршрута
  const mediaType = (route.data['mediaType'] as MediaType) || MediaType.All;

  return moviesService.loadGenres().pipe(
    map(([movieGenres, tvGenres]) => {
      let resultGenres: Genre[] = [];

      // 1. Выбор списка жанров
      switch (mediaType) {
        case MediaType.Movie:
          resultGenres = movieGenres;
          break;
        case MediaType.Tv:
          resultGenres = tvGenres;
          break;
        case MediaType.All:
        default:
          // Объединяем и убираем дубликаты по ID
          const genreMap = new Map<number, string>();
          movieGenres.forEach(g => genreMap.set(g.id, g.name));
          tvGenres.forEach(g => genreMap.set(g.id, g.name));
          // Преобразуем Map обратно в массив объектов
          resultGenres = Array.from(genreMap, ([id, name]) => ({ id, name }));
          break;
      }

      // 2. Форматирование (Заглавная буква) и 3. Сортировка
      return resultGenres
        .map(genre => ({
          ...genre,
          // Берем первую букву, делаем заглавной + остальная часть строки
          name: genre.name.charAt(0).toUpperCase() + genre.name.slice(1)
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    })
  );
};

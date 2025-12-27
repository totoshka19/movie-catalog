import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { MediaType, MoviesService } from '../services/movies.service';
import { Genre } from '../models/movie.model';

/**
 * Resolver, который загружает жанры.
 * 1. Выбирает нужный список в зависимости от URL (фильмы, сериалы или всё).
 * 2. Делает первую букву названия заглавной.
 * 3. Сортирует по алфавиту.
 */
export const genresResolver: ResolveFn<Genre[]> = (route) => {
  const moviesService = inject(MoviesService);
  // Получаем тип медиа из данных маршрута
  const mediaType = (route.data['mediaType'] as MediaType) || 'all';

  return moviesService.loadGenres().pipe(
    map(([movieGenres, tvGenres]) => {
      let resultGenres: Genre[] = [];

      // 1. Выбор списка жанров
      switch (mediaType) {
        case 'movie':
          resultGenres = movieGenres;
          break;
        case 'tv':
          resultGenres = tvGenres;
          break;
        case 'all':
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

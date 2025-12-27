import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { MoviesService } from '../services/movies.service';
import { Genre } from '../models/movie.model';

/**
 * Resolver, который загружает и объединяет жанры для фильмов и сериалов
 * до активации компонента.
 */
export const genresResolver: ResolveFn<Genre[]> = () => {
  const moviesService = inject(MoviesService);

  return moviesService.loadGenres().pipe(
    map(([movieGenres, tvGenres]) => {
      // Объединяем и убираем дубликаты жанров
      const genreMap = new Map<number, string>();
      movieGenres.forEach(g => genreMap.set(g.id, g.name));
      tvGenres.forEach(g => genreMap.set(g.id, g.name));
      const uniqueGenres = Array.from(genreMap, ([id, name]) => ({ id, name }));
      return uniqueGenres.sort((a, b) => a.name.localeCompare(b.name));
    })
  );
};

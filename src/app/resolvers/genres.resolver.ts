import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { MoviesService } from '../services/movies.service';
import { ImdbInterest } from '../models/imdb.model';

export const genresResolver: ResolveFn<ImdbInterest[]> = () => {
  const moviesService = inject(MoviesService);

  return moviesService.loadGenres().pipe(
    map((genres) => {
      return genres
        .map(genre => ({
          ...genre,
          name: genre.name.charAt(0).toUpperCase() + genre.name.slice(1)
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    })
  );
};

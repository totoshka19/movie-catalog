import { inject, LOCALE_ID } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { MoviesService } from '../services/movies.service';
import { ImdbInterest } from '../models/imdb.model';
import { GENRE_MAP } from '../core/constants/genre-map.constants';

export const genresResolver: ResolveFn<ImdbInterest[]> = () => {
  const moviesService = inject(MoviesService);
  const locale = inject(LOCALE_ID);

  return moviesService.loadGenres().pipe(
    map((genres) => {
      return genres
        .filter(genre => GENRE_MAP.hasOwnProperty(genre.name))

        .sort((a, b) => {
          if (locale.startsWith('en')) {
            return a.name.localeCompare(b.name);
          }

          const nameA = GENRE_MAP[a.name];
          const nameB = GENRE_MAP[b.name];
          return nameA.localeCompare(nameB);
        });
    })
  );
};

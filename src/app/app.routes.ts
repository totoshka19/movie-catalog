import { Routes } from '@angular/router';
import { MovieDetailsPageComponent } from './components/movie-details-page/movie-details-page.component';
import { MediaListPageComponent } from './components/media-list-page/media-list-page.component';
import { genresResolver } from './resolvers/genres.resolver';

export const routes: Routes = [
  // Маршруты для главной страницы с табами
  {
    path: 'all',
    component: MediaListPageComponent,
    data: { mediaType: 'all' },
    resolve: { genres: genresResolver }, // Используем resolver
  },
  {
    path: 'movie',
    component: MediaListPageComponent,
    data: { mediaType: 'movie' },
    resolve: { genres: genresResolver }, // Используем resolver
  },
  {
    path: 'tv',
    component: MediaListPageComponent,
    data: { mediaType: 'tv' },
    resolve: { genres: genresResolver }, // Используем resolver
  },
  // Маршрут для детальной страницы
  {
    path: 'media/:type/:id',
    component: MovieDetailsPageComponent,
  },
  // Редирект с корневого пути на таб "Все"
  {
    path: '',
    redirectTo: '/all',
    pathMatch: 'full',
  },
];

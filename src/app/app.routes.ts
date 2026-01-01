import { Routes } from '@angular/router';
import { genresResolver } from './resolvers/genres.resolver';
import { APP_ROUTES } from './core/constants/routes.constants';
import { MediaType } from './core/models/media-type.enum';
import { mediaTypeGuard } from './guards/media-type.guard';

export const routes: Routes = [
  // Маршруты для главной страницы с табами
  {
    path: APP_ROUTES.ALL,
    loadComponent: () =>
      import('./components/media-list-page/media-list-page.component').then(
        m => m.MediaListPageComponent
      ),
    data: { mediaType: MediaType.All },
    resolve: { genres: genresResolver },
  },
  {
    path: APP_ROUTES.MOVIE,
    loadComponent: () =>
      import('./components/media-list-page/media-list-page.component').then(
        m => m.MediaListPageComponent
      ),
    data: { mediaType: MediaType.Movie },
    resolve: { genres: genresResolver },
  },
  {
    path: APP_ROUTES.TV,
    loadComponent: () =>
      import('./components/media-list-page/media-list-page.component').then(
        m => m.MediaListPageComponent
      ),
    data: { mediaType: MediaType.Tv },
    resolve: { genres: genresResolver },
  },
  // Маршрут для детальной страницы
  {
    path: `${APP_ROUTES.MEDIA}/:type/:id`,
    loadComponent: () =>
      import('./components/movie-details-page/movie-details-page.component').then(
        m => m.MovieDetailsPageComponent
      ),
    canActivate: [mediaTypeGuard],
  },
  // Редирект с корневого пути на таб "Все" с сортировкой "Лучшее" по умолчанию
  {
    path: '',
    redirectTo: `/${APP_ROUTES.ALL}`,
    pathMatch: 'full',
  },
];

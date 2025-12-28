import { Routes } from '@angular/router';
import { MovieDetailsPageComponent } from './components/movie-details-page/movie-details-page.component';
import { MediaListPageComponent } from './components/media-list-page/media-list-page.component';
import { genresResolver } from './resolvers/genres.resolver';
import { APP_ROUTES } from './core/constants/routes.constants';
import { MediaType } from './core/models/media-type.enum';
import { mediaTypeGuard } from './guards/media-type.guard';

export const routes: Routes = [
  // Маршруты для главной страницы с табами
  {
    path: APP_ROUTES.ALL,
    component: MediaListPageComponent,
    data: { mediaType: MediaType.All },
    resolve: { genres: genresResolver },
  },
  {
    path: APP_ROUTES.MOVIE,
    component: MediaListPageComponent,
    data: { mediaType: MediaType.Movie },
    resolve: { genres: genresResolver },
  },
  {
    path: APP_ROUTES.TV,
    component: MediaListPageComponent,
    data: { mediaType: MediaType.Tv },
    resolve: { genres: genresResolver },
  },
  // Маршрут для детальной страницы
  {
    path: `${APP_ROUTES.MEDIA}/:type/:id`,
    component: MovieDetailsPageComponent,
    canActivate: [mediaTypeGuard],
  },
  // Редирект с корневого пути на таб "Все" с сортировкой "Новинки" по умолчанию
  {
    path: '',
    redirectTo: `/${APP_ROUTES.ALL}`,
    pathMatch: 'full',
  },
];

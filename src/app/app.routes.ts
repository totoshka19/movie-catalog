import { Routes } from '@angular/router';
import { MovieDetailsPageComponent } from './components/movie-details-page/movie-details-page.component';

export const routes: Routes = [
  {
    path: 'movies/:id',
    component: MovieDetailsPageComponent,
  },
];

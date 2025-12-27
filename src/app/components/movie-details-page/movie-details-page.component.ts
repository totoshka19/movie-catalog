import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MoviesService } from '../../services/movies.service';
import { Movie } from '../../models/movie.model';
import { Observable, switchMap } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-movie-details-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './movie-details-page.component.html',
  styleUrl: './movie-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieDetailsPageComponent {
  // Получаем id из параметра роута, используя input-биндинг роутера
  public readonly id = input.required<string>();

  private readonly moviesService = inject(MoviesService);

  // Превращаем input id в Observable, чтобы реагировать на его изменения
  private readonly movie$: Observable<Movie> = toObservable(this.id).pipe(
    switchMap(id => this.moviesService.getMovieById(Number(id)))
  );

  // Превращаем Observable с фильмом обратно в сигнал для использования в шаблоне
  protected readonly movie = toSignal(this.movie$, {
    initialValue: null,
  });
}

import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MoviesService } from '../../services/movies.service';
import { MediaItem } from '../../models/movie.model';
import { Observable, switchMap } from 'rxjs';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-movie-details-page',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, NgOptimizedImage],
  templateUrl: './movie-details-page.component.html',
  styleUrl: './movie-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieDetailsPageComponent {
  // Получаем id и тип из параметров роута
  public readonly id = input.required<string>();
  public readonly type = input.required<'movie' | 'tv'>();

  private readonly moviesService = inject(MoviesService);

  // Создаем сигнал из инпутов, чтобы отслеживать их изменения вместе
  private readonly routeParams = computed(() => ({ id: this.id(), type: this.type() }));

  // ИСПРАВЛЕНИЕ: Вызываем новый метод getMediaDetails и передаем ему id и type
  private readonly mediaItem$: Observable<MediaItem> = toObservable(this.routeParams).pipe(
    switchMap(({ id, type }) => this.moviesService.getMediaDetails(Number(id), type))
  );

  // Превращаем Observable с элементом обратно в сигнал для использования в шаблоне
  protected readonly mediaItem = toSignal(this.mediaItem$, {
    initialValue: null,
  });

  /**
   * Формирует полный URL для постера.
   * @param posterPath - Путь к постеру, полученный от API.
   * @returns Полный URL к изображению или null, если путь не указан.
   */
  getPosterUrl(posterPath: string | null): string | null {
    return posterPath ? `${environment.imageBaseUrl}${posterPath}` : null;
  }
}

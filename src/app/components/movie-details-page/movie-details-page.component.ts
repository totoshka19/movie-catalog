import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MoviesService } from '../../services/movies.service';
import { MediaItem } from '../../models/movie.model';
import { Observable, switchMap } from 'rxjs';
import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { environment } from '../../../environments/environment';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { Breadcrumb } from '../../models/breadcrumb.model';
import { SkeletonDetailsComponent } from '../skeleton-details/skeleton-details.component';

@Component({
  selector: 'app-movie-details-page',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    NgOptimizedImage,
    BreadcrumbComponent,
    SkeletonDetailsComponent
  ],
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

  private readonly mediaItem$: Observable<MediaItem> = toObservable(this.routeParams).pipe(
    switchMap(({ id, type }) => this.moviesService.getMediaDetails(Number(id), type))
  );

  // Превращаем Observable с элементом обратно в сигнал для использования в шаблоне
  protected readonly mediaItem = toSignal(this.mediaItem$, {
    initialValue: null,
  });

  // Сигнал для формирования хлебных крошек
  protected readonly breadcrumbs = computed<Breadcrumb[]>(() => {
    const item = this.mediaItem();
    if (!item) {
      return [];
    }

    const mediaTypeLabel = item.media_type === 'movie' ? 'Фильмы' : 'Сериалы';
    const mediaTypeLink = `/${item.media_type}`;

    return [
      { label: 'Главная', link: '/' },
      { label: mediaTypeLabel, link: mediaTypeLink },
      { label: item.title, link: '' }, // У последнего элемента нет ссылки
    ];
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

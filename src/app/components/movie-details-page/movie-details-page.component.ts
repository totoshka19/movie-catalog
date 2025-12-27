import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MoviesService } from '../../services/movies.service';
import { MediaItem } from '../../models/movie.model';
import { Observable, switchMap } from 'rxjs';
import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { Breadcrumb } from '../../models/breadcrumb.model';
import { SkeletonDetailsComponent } from '../skeleton-details/skeleton-details.component';
import { TmdbImagePipe } from '../../pipes/tmdb-image.pipe';
import { MediaType } from '../../core/models/media-type.enum';
import { APP_ROUTES } from '../../core/constants/routes.constants';

@Component({
  selector: 'app-movie-details-page',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    NgOptimizedImage,
    BreadcrumbComponent,
    SkeletonDetailsComponent,
    TmdbImagePipe,
  ],
  templateUrl: './movie-details-page.component.html',
  styleUrl: './movie-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieDetailsPageComponent {
  // Получаем id и тип из параметров роута
  public readonly id = input.required<string>();
  public readonly type = input.required<MediaType.Movie | MediaType.Tv>();

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

    const mediaTypeLabel = item.media_type === MediaType.Movie ? 'Фильмы' : 'Сериалы';
    const mediaTypeLink = item.media_type === MediaType.Movie ? `/${APP_ROUTES.MOVIE}` : `/${APP_ROUTES.TV}`;

    return [
      { label: 'Главная', link: APP_ROUTES.ROOT },
      { label: mediaTypeLabel, link: mediaTypeLink },
      { label: item.title, link: '' }, // У последнего элемента нет ссылки
    ];
  });
}

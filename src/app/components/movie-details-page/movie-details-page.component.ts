import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MoviesService } from '../../services/movies.service';
import { ImdbTitle, ImdbTitleType } from '../../models/imdb.model';
import { EMPTY, Observable, catchError, switchMap } from 'rxjs';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { Breadcrumb } from '../../models/breadcrumb.model';
import { SkeletonDetailsComponent } from '../skeleton-details/skeleton-details.component';
import { APP_ROUTES } from '../../core/constants/routes.constants';
import { NavigationHistoryService } from '../../services/navigation-history.service';
import { Params, Router } from '@angular/router';
import { VideoPlayerComponent } from '../video-player/video-player.component';
import { ScrollLockService } from '../../services/scroll-lock.service';
import { ResizeImagePipe } from '../../pipes/resize-image.pipe';

@Component({
  selector: 'app-movie-details-page',
  standalone: true,
  imports: [
    DecimalPipe,
    NgOptimizedImage,
    BreadcrumbComponent,
    SkeletonDetailsComponent,
    VideoPlayerComponent,
    ResizeImagePipe,
  ],
  templateUrl: './movie-details-page.component.html',
  styleUrl: './movie-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieDetailsPageComponent {
  public readonly id = input.required<string>();
  public readonly type = input.required<string>();

  private readonly moviesService = inject(MoviesService);
  private readonly navigationHistoryService = inject(NavigationHistoryService);
  private readonly router = inject(Router);
  private readonly scrollLockService = inject(ScrollLockService);
  protected readonly error = signal<string | null>(null);
  protected readonly selectedTrailerId = signal<string | null>(null);

  private readonly routeParams = computed(() => ({ id: this.id() }));

  private readonly mediaItem$: Observable<ImdbTitle> = toObservable(this.routeParams).pipe(
    switchMap(({ id }) => {
      this.error.set(null);
      this.selectedTrailerId.set(null);
      window.scrollTo(0, 0);
      return this.moviesService.getTitleDetails(id);
    }),
    catchError((err: Error) => {
      this.error.set(err.message || 'Ошибка загрузки данных');
      return EMPTY;
    })
  );

  protected readonly mediaItem = toSignal(this.mediaItem$, {
    initialValue: null,
  });

  protected readonly breadcrumbs = computed<Breadcrumb[]>(() => {
    const item = this.mediaItem();
    if (!item) return [];

    const isMovie = item.type === ImdbTitleType.Movie || item.type === ImdbTitleType.TvMovie;
    const mediaTypeLabel = isMovie ? 'Фильмы' : 'Сериалы';

    const listLink = isMovie ? `/${APP_ROUTES.MOVIE}` : `/${APP_ROUTES.TV}`;

    return [
      { label: 'Главная', link: [`/${APP_ROUTES.ALL}`] },
      { label: mediaTypeLabel, link: [listLink] },
      { label: item.primaryTitle || item.originalTitle, link: '' },
    ];
  });

  constructor() {
    effect(onCleanup => {
      if (this.selectedTrailerId()) {
        this.scrollLockService.lock();
        onCleanup(() => this.scrollLockService.unlock());
      }
    });
  }

  onPlayTrailer(): void {
    const item = this.mediaItem();
    const videos = item?.videosList;

    if (videos && videos.length > 0) {
      this.selectedTrailerId.set(videos[0].id);
    }
  }

  onCloseTrailer(): void {
    this.selectedTrailerId.set(null);
  }
}

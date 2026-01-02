import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MoviesService } from '../../services/movies.service';
import { ImdbTitle } from '../../models/imdb.model';
import { EMPTY, Observable, catchError, switchMap } from 'rxjs';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { Breadcrumb } from '../../models/breadcrumb.model';
import { SkeletonDetailsComponent } from '../skeleton-details/skeleton-details.component';
import { NavigationHistoryService } from '../../services/navigation-history.service';
import { Router } from '@angular/router';
import { VideoPlayerComponent } from '../video-player/video-player.component';
import { ScrollLockService } from '../../services/scroll-lock.service';
import { ResizeImagePipe } from '../../pipes/resize-image.pipe';
import { MediaType } from '../../core/models/media-type.enum';
import { GenreTranslationPipe } from '../../pipes/genre-translation.pipe';

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
    GenreTranslationPipe
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
      this.error.set($localize`:@@errorLoadingDetails:Ошибка загрузки данных`);
      return EMPTY;
    })
  );

  protected readonly mediaItem = toSignal(this.mediaItem$, {
    initialValue: null,
  });

  protected readonly breadcrumbs = computed<Breadcrumb[]>(() => {
    const item = this.mediaItem();
    if (!item) return [];

    const mediaTypeLabel =
      this.type() === MediaType.Movie
        ? $localize`:@@mediaTypeMovies:Фильмы`
        : $localize`:@@mediaTypeTvSeries:Сериалы`;

    const previousUrl = this.navigationHistoryService.previousUrl();
    const urlTree = this.router.parseUrl(previousUrl);
    const path = [previousUrl.split('?')[0]];
    const queryParams = urlTree.queryParams;

    return [
      { label: $localize`:@@breadcrumbHome:Главная`, link: path, queryParams: queryParams },
      { label: mediaTypeLabel, link: path, queryParams: queryParams },
      { label: item.primaryTitle || item.originalTitle, link: '' },
    ];
  });

  constructor() {
    effect(oncleanup => {
      if (this.selectedTrailerId()) {
        this.scrollLockService.lock();
        oncleanup(() => this.scrollLockService.unlock());
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

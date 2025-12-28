import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MoviesService } from '../../services/movies.service';
import { MediaItem } from '../../models/movie.model';
import { EMPTY, Observable, catchError, switchMap } from 'rxjs';
import { DatePipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { Breadcrumb } from '../../models/breadcrumb.model';
import { SkeletonDetailsComponent } from '../skeleton-details/skeleton-details.component';
import { TmdbImagePipe } from '../../pipes/tmdb-image.pipe';
import { MediaType } from '../../core/models/media-type.enum';
import { APP_ROUTES } from '../../core/constants/routes.constants';
import { NavigationHistoryService } from '../../services/navigation-history.service';
import { Params } from '@angular/router';

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
  private readonly navigationHistoryService = inject(NavigationHistoryService);

  // Сигнал для хранения состояния ошибки
  protected readonly error = signal<string | null>(null);

  // Создаем сигнал из инпутов, чтобы отслеживать их изменения вместе
  private readonly routeParams = computed(() => ({ id: this.id(), type: this.type() }));

  private readonly mediaItem$: Observable<MediaItem> = toObservable(this.routeParams).pipe(
    switchMap(({ id, type }) => {
      // Сбрасываем ошибку перед новым запросом
      this.error.set(null);
      return this.moviesService.getMediaDetails(Number(id), type);
    }),
    catchError((err: Error) => {
      // Устанавливаем сигнал ошибки
      this.error.set(err.message);
      // Возвращаем пустой Observable, чтобы mediaItem остался null
      return EMPTY;
    })
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
    const previousUrl = this.navigationHistoryService.previousUrl();

    // Определяем, является ли предыдущий URL валидной страницей списка
    const isPreviousUrlList =
      previousUrl.startsWith(`/${APP_ROUTES.MOVIE}`) ||
      previousUrl.startsWith(`/${APP_ROUTES.TV}`) ||
      previousUrl.startsWith(`/${APP_ROUTES.ALL}`);

    let homeQueryParams: Params | undefined;
    let mediaTypeLink: string[] | string;
    let mediaTypeQueryParams: Params | undefined;

    if (isPreviousUrlList) {
      // Парсим URL, чтобы отделить путь от query-параметров
      const url = new URL(previousUrl, window.location.origin);
      mediaTypeLink = [url.pathname];
      mediaTypeQueryParams = {};
      url.searchParams.forEach((value, key) => {
        (mediaTypeQueryParams as Params)[key] = value;
      });
      // Используем те же query-параметры для ссылки "Главная"
      homeQueryParams = mediaTypeQueryParams;
    } else {
      // Создаем ссылку по умолчанию без параметров, если пришли не со страницы списка
      mediaTypeLink =
        item.media_type === MediaType.Movie ? [`/${APP_ROUTES.MOVIE}`] : [`/${APP_ROUTES.TV}`];
    }

    return [
      {
        label: 'Главная',
        link: [`/${APP_ROUTES.ALL}`], // Ссылка всегда ведет на таб "Все"
        queryParams: homeQueryParams, // Но с сохранением фильтров
      },
      { label: mediaTypeLabel, link: mediaTypeLink, queryParams: mediaTypeQueryParams },
      { label: item.title, link: '' }, // У последнего элемента нет ссылки
    ];
  });
}

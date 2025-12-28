import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaListPageComponent } from './media-list-page.component';
import { MoviesService } from '../../services/movies.service';
import { ModalService } from '../../services/modal.service';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError, Subject } from 'rxjs';
import { Genre, MediaItem } from '../../models/movie.model';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { MovieListComponent } from '../movie-list/movie-list.component';
import { SkeletonListComponent } from '../skeleton-list/skeleton-list.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { MediaType } from '../../core/models/media-type.enum';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { InfiniteScrollDirective } from '../../directives/infinite-scroll.directive';
import { HeaderComponent } from '../header/header.component';

// --- Моковые данные ---
const MOCK_GENRES: Genre[] = [
  { id: 1, name: 'Action' },
  { id: 2, name: 'Comedy' },
];

const MOCK_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 101,
    title: 'The Matrix',
    release_date: '1999-03-31',
    overview: 'Neo believes...',
    vote_average: 8.7,
    poster_path: '/matrix.jpg',
    media_type: MediaType.Movie,
    genreNames: ['Action', 'Sci-Fi'],
    genre_ids: [1, 3], // Добавлено поле
  },
  {
    id: 102,
    title: 'The Matrix Reloaded',
    release_date: '2003-05-15',
    overview: 'Neo and Trinity...',
    vote_average: 7.2,
    poster_path: '/matrix2.jpg',
    media_type: MediaType.Movie,
    genreNames: ['Action', 'Sci-Fi'],
    genre_ids: [1, 3], // Добавлено поле
  },
  {
    id: 103,
    title: 'Toy Story',
    release_date: '1995-11-22',
    overview: 'Woody and Buzz...',
    vote_average: 8.3,
    poster_path: '/toy.jpg',
    media_type: MediaType.Movie,
    genreNames: ['Animation', 'Comedy'],
    genre_ids: [4, 2], // Добавлено поле
  },
];

describe('MediaListPageComponent', () => {
  let component: MediaListPageComponent;
  let fixture: ComponentFixture<MediaListPageComponent>;
  let moviesServiceMock: any;
  let modalServiceMock: any;
  let router: Router;

  // Subjects для управления состоянием ActivatedRoute в тестах
  let routeDataSubject: BehaviorSubject<any>;
  let queryParamsSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    // Инициализируем Subjects начальными значениями
    routeDataSubject = new BehaviorSubject({ mediaType: MediaType.Movie, genres: MOCK_GENRES });
    queryParamsSubject = new BehaviorSubject(convertToParamMap({}));

    // Создаем моки сервисов
    moviesServiceMock = {
      getPopularMedia: vi.fn().mockReturnValue(of(MOCK_MEDIA_ITEMS)),
      // Добавляем мок для searchMedia
      searchMedia: vi.fn().mockReturnValue(of([])),
    };

    modalServiceMock = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        MediaListPageComponent,
        MovieListComponent,
        SkeletonListComponent,
        SearchBarComponent,
        SidebarComponent,
        InfiniteScrollDirective,
        HeaderComponent
      ],
      providers: [
        provideRouter([]),
        { provide: MoviesService, useValue: moviesServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            data: routeDataSubject.asObservable(),
            queryParamMap: queryParamsSubject.asObservable(),
            snapshot: {
              data: { mediaType: MediaType.Movie, genres: MOCK_GENRES },
              queryParamMap: convertToParamMap({}),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaListPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    // Спай на навигацию роутера
    vi.spyOn(router, 'navigate');

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load media on initialization based on route data', () => {
    expect(moviesServiceMock.getPopularMedia).toHaveBeenCalledWith(MediaType.Movie, [], 1);

    fixture.detectChanges();
    const movieList = fixture.debugElement.query(By.directive(MovieListComponent));
    expect(movieList).toBeTruthy();
    expect(movieList.componentInstance.movies.length).toBe(3);
  });

  it('should call searchMedia when query param is present', async () => {
    // Настраиваем мок, чтобы он возвращал отфильтрованные данные (имитируем сервер)
    const searchResults = MOCK_MEDIA_ITEMS.filter(m => m.title.includes('Matrix'));
    moviesServiceMock.searchMedia.mockReturnValue(of(searchResults));

    queryParamsSubject.next(convertToParamMap({ q: 'Matrix' }));
    fixture.detectChanges();
    await fixture.whenStable();

    // Проверяем, что был вызван метод поиска
    expect(moviesServiceMock.searchMedia).toHaveBeenCalledWith('Matrix', MediaType.Movie, 1);

    const movieList = fixture.debugElement.query(By.directive(MovieListComponent));
    expect(movieList.componentInstance.movies.length).toBe(2);
    expect(movieList.componentInstance.movies[0].title).toBe('The Matrix');
  });

  it('should pass genres to sidebar', () => {
    const sidebar = fixture.debugElement.query(By.directive(SidebarComponent));
    expect(sidebar).toBeTruthy();
    expect(sidebar.componentInstance.genres).toEqual(MOCK_GENRES);
  });

  it('should navigate with new query params when genre is changed via sidebar', () => {
    const sidebar = fixture.debugElement.query(By.directive(SidebarComponent));

    sidebar.triggerEventHandler('genreChange', [1]);

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { genre: '1' },
      queryParamsHandling: 'merge',
    });
  });

  it('should reload media when genre query param changes', async () => {
    moviesServiceMock.getPopularMedia.mockClear();

    queryParamsSubject.next(convertToParamMap({ genre: '2' }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(moviesServiceMock.getPopularMedia).toHaveBeenCalledWith(MediaType.Movie, [2], 1);
  });

  it('should filter search results on client side when genres are selected during search', async () => {
    // Сценарий: Ищем "Matrix" (сервер вернет 2 фильма), но выбран жанр "Comedy" (id: 2).
    // У Матрицы жанры [1, 3], у Истории игрушек [4, 2].
    // Результат поиска "Matrix" вернет только фильмы про Матрицу.
    // Клиентский фильтр должен скрыть их, так как у них нет жанра 2.

    const searchResults = MOCK_MEDIA_ITEMS.filter(m => m.title.includes('Matrix'));
    moviesServiceMock.searchMedia.mockReturnValue(of(searchResults));

    // Устанавливаем и поиск, и жанр
    queryParamsSubject.next(convertToParamMap({ q: 'Matrix', genre: '2' }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(moviesServiceMock.searchMedia).toHaveBeenCalledWith('Matrix', MediaType.Movie, 1);

    const movieList = fixture.debugElement.query(By.directive(MovieListComponent));
    // Ожидаем 0, так как Матрица не Комедия
    expect(movieList.componentInstance.movies.length).toBe(0);
  });

  it('should open modal when a movie is clicked', () => {
    const movieListDebugEl = fixture.debugElement.query(By.directive(MovieListComponent));
    const itemToClick = MOCK_MEDIA_ITEMS[0];

    movieListDebugEl.triggerEventHandler('movieClick', itemToClick);

    expect(modalServiceMock.open).toHaveBeenCalledWith(itemToClick);
  });

  it('should show loading skeleton when isLoading is true', async () => {
    const loadingSubject = new Subject<MediaItem[]>();
    moviesServiceMock.getPopularMedia.mockReturnValue(loadingSubject);

    queryParamsSubject.next(convertToParamMap({ genre: '99' }));
    fixture.detectChanges();
    await fixture.whenStable();

    const skeleton = fixture.debugElement.query(By.directive(SkeletonListComponent));
    const movieList = fixture.debugElement.query(By.directive(MovieListComponent));

    expect(skeleton).toBeTruthy();
    expect(movieList).toBeNull();

    loadingSubject.complete();
  });

  it('should display error message if loading fails', async () => {
    const errorMessage = 'Network Error';
    moviesServiceMock.getPopularMedia.mockReturnValue(throwError(() => new Error(errorMessage)));

    queryParamsSubject.next(convertToParamMap({ genre: '5' }));
    fixture.detectChanges();
    await fixture.whenStable();

    const errorEl = fixture.debugElement.query(By.css('.app-state-indicator--error'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain(errorMessage);
  });

  it('should call loadNextPage when infinite scroll emits', () => {
    const spy = vi.spyOn(component, 'loadNextPage');
    const mainContent = fixture.debugElement.query(By.css('main'));

    mainContent.triggerEventHandler('scrollEnd', null);

    expect(spy).toHaveBeenCalled();
  });
});

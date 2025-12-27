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
    };

    modalServiceMock = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        MediaListPageComponent,
        MovieListComponent,
        SkeletonListComponent,
        SearchBarComponent
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
              queryParamMap: convertToParamMap({})
            }
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
    expect(moviesServiceMock.getPopularMedia).toHaveBeenCalledWith(MediaType.Movie, undefined, 1);

    fixture.detectChanges();
    const movieList = fixture.debugElement.query(By.directive(MovieListComponent));
    expect(movieList).toBeTruthy();
    expect(movieList.componentInstance.movies.length).toBe(3);
  });

  it('should filter media based on search query param', async () => {
    expect(fixture.debugElement.query(By.directive(MovieListComponent)).componentInstance.movies.length).toBe(3);

    queryParamsSubject.next(convertToParamMap({ q: 'Matrix' }));
    fixture.detectChanges();
    await fixture.whenStable();

    const movieList = fixture.debugElement.query(By.directive(MovieListComponent));
    expect(movieList.componentInstance.movies.length).toBe(2);
    expect(movieList.componentInstance.movies[0].title).toBe('The Matrix');

    queryParamsSubject.next(convertToParamMap({ q: 'NotFoundTerm' }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(movieList.componentInstance.movies.length).toBe(0);
  });

  it('should populate genre select with genres from resolver', () => {
    const select = fixture.debugElement.query(By.css('select')).nativeElement as HTMLSelectElement;
    const options = select.querySelectorAll('option');

    expect(options.length).toBe(3);
    expect(options[1].textContent).toContain('Action');
    expect(options[1].value).toBe('1');
  });

  it('should navigate with new query params when genre is changed', () => {
    const select = fixture.debugElement.query(By.css('select'));

    select.nativeElement.value = '1';
    select.triggerEventHandler('change', { target: select.nativeElement });

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

    expect(moviesServiceMock.getPopularMedia).toHaveBeenCalledWith(MediaType.Movie, 2, 1);
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

  it('should highlight active tab correctly', async () => {
    let activeLink = fixture.debugElement.query(By.css('.nav-links a.active'));
    expect(activeLink.nativeElement.textContent).toContain('Фильмы');

    routeDataSubject.next({ mediaType: MediaType.Tv, genres: [] });
    fixture.detectChanges();
    await fixture.whenStable();

    activeLink = fixture.debugElement.query(By.css('.nav-links a.active'));
    expect(activeLink.nativeElement.textContent).toContain('Сериалы');
  });

  it('should load next page on scroll', () => {
    moviesServiceMock.getPopularMedia.mockClear();

    vi.spyOn(component as any, 'getScrollPosition').mockReturnValue({ pos: 1500, max: 2000 });

    // Вызываем обработчик события скролла
    component.onScroll();

    // Ожидаем вызов сервиса с страницей 2
    expect(moviesServiceMock.getPopularMedia).toHaveBeenCalledWith(MediaType.Movie, undefined, 2);
  });
});

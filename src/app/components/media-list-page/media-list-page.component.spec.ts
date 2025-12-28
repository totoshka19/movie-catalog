import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaListPageComponent } from './media-list-page.component';
import { ModalService } from '../../services/modal.service';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { Genre, MediaItem } from '../../models/movie.model';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { MovieListComponent } from '../movie-list/movie-list.component';
import { SkeletonListComponent } from '../skeleton-list/skeleton-list.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { MediaType, SortType } from '../../core/models/media-type.enum';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { InfiniteScrollDirective } from '../../directives/infinite-scroll.directive';
import { HeaderComponent } from '../header/header.component';
import { MediaListStateService } from '../../services/media-list-state.service';
import { signal } from '@angular/core';

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
  let mediaListStateServiceMock: any;
  let modalServiceMock: any;
  let router: Router;

  // Subjects для управления состоянием ActivatedRoute в тестах
  let routeDataSubject: BehaviorSubject<any>;
  let queryParamsSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    // Инициализируем Subjects начальными значениями
    routeDataSubject = new BehaviorSubject({ mediaType: MediaType.All, genres: MOCK_GENRES });
    // По умолчанию сортировка 'newest'
    queryParamsSubject = new BehaviorSubject(convertToParamMap({ sort_by: 'newest' }));

    // Создаем моки сервисов
    mediaListStateServiceMock = {
      // Предоставляем сигналы для привязки в шаблоне
      isLoading: signal(false),
      isLoadingMore: signal(false),
      error: signal(null),
      filteredMedia: signal(MOCK_MEDIA_ITEMS),
      // Предоставляем геттер, который будет использоваться в шаблоне
      canLoadMore: () => true,
      // Мокируем методы, которые будет вызывать компонент
      resetAndLoad: vi.fn(),
      loadNextPage: vi.fn(),
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
        HeaderComponent,
      ],
      providers: [
        provideRouter([]),
        // Заменяем реальный сервис на мок
        { provide: MediaListStateService, useValue: mediaListStateServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            data: routeDataSubject.asObservable(),
            queryParamMap: queryParamsSubject.asObservable(),
            snapshot: {
              data: { mediaType: MediaType.All, genres: MOCK_GENRES },
              queryParamMap: convertToParamMap({ sort_by: 'newest' }),
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

  it('should call resetAndLoad on initialization with default sort', () => {
    expect(mediaListStateServiceMock.resetAndLoad).toHaveBeenCalledWith(
      MediaType.All,
      SortType.Newest,
      [],
      ''
    );

    fixture.detectChanges();
    const movieList = fixture.debugElement.query(By.directive(MovieListComponent));
    expect(movieList).toBeTruthy();
    // Проверяем, что данные из мока сервиса состояния переданы в компонент списка
    expect(movieList.componentInstance.movies.length).toBe(3);
  });

  it('should call resetAndLoad when sort_by query param changes', async () => {
    mediaListStateServiceMock.resetAndLoad.mockClear();

    queryParamsSubject.next(convertToParamMap({ sort_by: 'top_rated' }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mediaListStateServiceMock.resetAndLoad).toHaveBeenCalledWith(
      MediaType.All,
      SortType.TopRated,
      [],
      ''
    );
  });

  it('should call resetAndLoad with search query when q param is present', async () => {
    mediaListStateServiceMock.resetAndLoad.mockClear();

    queryParamsSubject.next(convertToParamMap({ q: 'Matrix' }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mediaListStateServiceMock.resetAndLoad).toHaveBeenCalledWith(
      MediaType.All,
      SortType.Newest, // Сортировка по умолчанию
      [],
      'Matrix'
    );
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

  it('should open modal when a movie is clicked', () => {
    const movieListDebugEl = fixture.debugElement.query(By.directive(MovieListComponent));
    const itemToClick = MOCK_MEDIA_ITEMS[0];

    movieListDebugEl.triggerEventHandler('movieClick', itemToClick);

    expect(modalServiceMock.open).toHaveBeenCalledWith(itemToClick);
  });

  it('should show loading skeleton when isLoading is true', async () => {
    // Устанавливаем сигнал isLoading в моке в true
    mediaListStateServiceMock.isLoading.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const skeleton = fixture.debugElement.query(By.directive(SkeletonListComponent));
    // Когда isLoading=true, список фильмов не должен рендериться (из-за @if в шаблоне)
    const content = fixture.debugElement.query(By.css('.content > app-movie-list'));

    expect(skeleton).toBeTruthy();
    expect(content).toBeNull();

    // Возвращаем состояние для других тестов
    mediaListStateServiceMock.isLoading.set(false);
  });

  it('should call loadNextPage on scrollEnd', () => {
    const contentElement = fixture.debugElement.query(By.css('.content'));
    contentElement.triggerEventHandler('scrollEnd');
    expect(mediaListStateServiceMock.loadNextPage).toHaveBeenCalled();
  });
});

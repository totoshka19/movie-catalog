import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaListPageComponent } from './media-list-page.component';
import { ModalService } from '../../services/modal.service';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { ImdbInterest, ImdbTitle } from '../../models/imdb.model';
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

const MOCK_GENRES: ImdbInterest[] = [
  { id: 'action', name: 'Action' },
  { id: 'comedy', name: 'Comedy' },
];

const MOCK_MEDIA_ITEMS: ImdbTitle[] = [
  {
    id: 'tt0133093',
    type: 'MOVIE' as any,
    primaryTitle: 'The Matrix',
    originalTitle: 'The Matrix',
    isAdult: false,
    startYear: 1999,
    genres: ['Action', 'Sci-Fi'],
    primaryImage: { url: '/matrix.jpg', width: 100, height: 150 },
    rating: { aggregateRating: 8.7, voteCount: 1000 },
  },
  {
    id: 'tt0234215',
    type: 'MOVIE' as any,
    primaryTitle: 'The Matrix Reloaded',
    originalTitle: 'The Matrix Reloaded',
    isAdult: false,
    startYear: 2003,
    genres: ['Action', 'Sci-Fi'],
    primaryImage: { url: '/matrix2.jpg', width: 100, height: 150 },
    rating: { aggregateRating: 7.2, voteCount: 900 },
  },
  {
    id: 'tt0114709',
    type: 'MOVIE' as any,
    primaryTitle: 'Toy Story',
    originalTitle: 'Toy Story',
    isAdult: false,
    startYear: 1995,
    genres: ['Animation', 'Comedy'],
    primaryImage: { url: '/toy.jpg', width: 100, height: 150 },
    rating: { aggregateRating: 8.3, voteCount: 1200 },
  },
];

describe('MediaListPageComponent', () => {
  let component: MediaListPageComponent;
  let fixture: ComponentFixture<MediaListPageComponent>;
  let mediaListStateServiceMock: any;
  let modalServiceMock: any;
  let router: Router;

  let routeDataSubject: BehaviorSubject<any>;
  let queryParamsSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    const MockIntersectionObserver = vi.fn(function() {
      return {
        observe: vi.fn(),
        disconnect: vi.fn(),
        unobserve: vi.fn(),
        takeRecords: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
      };
    });
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    routeDataSubject = new BehaviorSubject({ mediaType: MediaType.All, genres: MOCK_GENRES });
    queryParamsSubject = new BehaviorSubject(convertToParamMap({}));

    mediaListStateServiceMock = {
      isLoading: signal(false),
      isLoadingMore: signal(false),
      error: signal(null),
      filteredMedia: signal(MOCK_MEDIA_ITEMS),
      canLoadMore: () => true,
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
        { provide: MediaListStateService, useValue: mediaListStateServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            data: routeDataSubject.asObservable(),
            queryParamMap: queryParamsSubject.asObservable(),
            snapshot: {
              data: { mediaType: MediaType.All, genres: MOCK_GENRES },
              queryParamMap: convertToParamMap({}),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaListPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    vi.spyOn(router, 'navigate');

    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call resetAndLoad on initialization with default sort', () => {
    expect(mediaListStateServiceMock.resetAndLoad).toHaveBeenCalledWith(
      MediaType.All,
      SortType.TopRated,
      [],
      ''
    );

    fixture.detectChanges();
    const movieList = fixture.debugElement.query(By.directive(MovieListComponent));
    expect(movieList).toBeTruthy();
    expect(movieList.componentInstance.movies.length).toBe(3);
  });

  it('should call resetAndLoad when sort_by query param changes', async () => {
    mediaListStateServiceMock.resetAndLoad.mockClear();

    queryParamsSubject.next(convertToParamMap({ sort_by: 'newest' }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mediaListStateServiceMock.resetAndLoad).toHaveBeenCalledWith(
      MediaType.All,
      SortType.Newest,
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
      SortType.TopRated,
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

    sidebar.triggerEventHandler('genreChange', ['action']);

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { genre: 'action', q: null },
      queryParamsHandling: 'merge',
    });
  });

  it('should open modal when a movie is clicked', () => {
    const movieListDebugEl = fixture.debugElement.query(By.directive(MovieListComponent));
    const itemToClick = MOCK_MEDIA_ITEMS[0];

    movieListDebugEl.triggerEventHandler('movieClick', itemToClick);

    expect(modalServiceMock.open).toHaveBeenCalledWith(itemToClick, MediaType.All);
  });

  it('should show loading skeleton when isLoading is true', async () => {
    mediaListStateServiceMock.isLoading.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const skeleton = fixture.debugElement.query(By.directive(SkeletonListComponent));
    const content = fixture.debugElement.query(By.css('.content > app-movie-list'));

    expect(skeleton).toBeTruthy();
    expect(content).toBeNull();

    mediaListStateServiceMock.isLoading.set(false);
  });

  it('should call loadNextPage on scrollEnd', () => {
    const triggerElement = fixture.debugElement.query(By.css('.infinite-scroll-trigger'));

    expect(triggerElement).toBeTruthy();

    triggerElement.triggerEventHandler('scrollEnd');
    expect(mediaListStateServiceMock.loadNextPage).toHaveBeenCalled();
  });
});

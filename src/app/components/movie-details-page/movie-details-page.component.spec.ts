import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { IMAGE_LOADER } from '@angular/common';

import { MovieDetailsPageComponent } from './movie-details-page.component';
import { SkeletonDetailsComponent } from '../skeleton-details/skeleton-details.component';
import { MoviesService } from '../../services/movies.service';
import { ImdbTitle, ImdbTitleType } from '../../models/imdb.model';
import { MediaType } from '../../core/models/media-type.enum';

const MOCK_MEDIA_ITEM: ImdbTitle = {
  id: 'tt00001',
  type: ImdbTitleType.Movie,
  primaryTitle: 'Тестовый фильм',
  originalTitle: 'Test Movie',
  isAdult: false,
  startYear: 2024,
  plot: 'Описание тестового фильма.',
  genres: ['Тест'],
  primaryImage: { url: 'https://example.com/poster.jpg', width: 300, height: 450 },
  rating: { aggregateRating: 8.5, voteCount: 1234 },
};

const mockMoviesService = {
  getTitleDetails: vi.fn(),
};

describe('MovieDetailsPageComponent', () => {
  let component: MovieDetailsPageComponent;
  let fixture: ComponentFixture<MovieDetailsPageComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [MovieDetailsPageComponent, RouterTestingModule, SkeletonDetailsComponent],
      providers: [
        { provide: MoviesService, useValue: mockMoviesService },
        {
          provide: IMAGE_LOADER,
          useValue: () => '',
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieDetailsPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getTitleDetails with the correct ID from input', () => {
    mockMoviesService.getTitleDetails.mockReturnValue(of(MOCK_MEDIA_ITEM));

    fixture.componentRef.setInput('id', '1');
    fixture.componentRef.setInput('type', MediaType.Movie);
    fixture.detectChanges();

    expect(mockMoviesService.getTitleDetails).toHaveBeenCalled();
    expect(mockMoviesService.getTitleDetails).toHaveBeenCalledWith('1');
  });

  it('should display media details after data is loaded', async () => {
    mockMoviesService.getTitleDetails.mockReturnValue(of(MOCK_MEDIA_ITEM));

    fixture.componentRef.setInput('id', '1');
    fixture.componentRef.setInput('type', MediaType.Movie);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.movie-details-page__title')?.textContent).toContain(
      MOCK_MEDIA_ITEM.primaryTitle
    );
  });

  it('should show skeleton while loading', async () => {
    const loadingSubject = new Subject<ImdbTitle>();
    mockMoviesService.getTitleDetails.mockReturnValue(loadingSubject);

    fixture.componentRef.setInput('id', '999');
    fixture.componentRef.setInput('type', MediaType.Movie);

    fixture.detectChanges();

    const skeleton = fixture.debugElement.query(By.directive(SkeletonDetailsComponent));
    expect(skeleton).toBeTruthy();

    const content = fixture.nativeElement.querySelector('.movie-details-page__content');
    expect(content).toBeNull();

    loadingSubject.complete();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { RouterTestingModule } from '@angular/router/testing';

import { MovieDetailsComponent } from './movie-details.component';
import { ImdbTitle, ImdbTitleType } from '../../models/imdb.model';

const MOCK_MEDIA_ITEM: ImdbTitle = {
  id: 'tt54321',
  type: ImdbTitleType.Movie,
  primaryTitle: 'Тестовый фильм',
  originalTitle: 'Test Movie',
  isAdult: false,
  startYear: 2024,
  plot: 'Это описание тестового фильма.',
  genres: ['Тест', 'Фантастика'],
  primaryImage: { url: 'https://example.com/poster.jpg', width: 200, height: 300 },
  rating: { aggregateRating: 9.9, voteCount: 5000 },
};

describe('MovieDetailsComponent', () => {
  let component: MovieDetailsComponent;
  let fixture: ComponentFixture<MovieDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieDetailsComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieDetailsComponent);
    component = fixture.componentInstance;
    component.movie = MOCK_MEDIA_ITEM;
    fixture.detectChanges();
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display movie details correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.movie-details__title')?.textContent).toContain(
      'Тестовый фильм (2024)'
    );
    expect(compiled.querySelector('.movie-details__rating')?.textContent).toContain('9.9');
    expect(compiled.querySelector('.movie-details__description')?.textContent).toBe(
      'Это описание тестового фильма.'
    );
    const genreTags = compiled.querySelectorAll('.movie-details__genre-tag');
    expect(genreTags.length).toBe(2);
    expect(genreTags[0].textContent).toBe('Тест');
  });

  it('should emit close event on close button click', async () => {
    const spy = vi.spyOn(component.close, 'emit');
    const closeButton = fixture.nativeElement.querySelector(
      '.movie-details__close-btn'
    ) as HTMLButtonElement;

    closeButton.click();

    await vi.advanceTimersByTimeAsync(200);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should emit close event on overlay click', async () => {
    const spy = vi.spyOn(component.close, 'emit');
    const overlay = fixture.nativeElement.querySelector(
      '.movie-details__overlay'
    ) as HTMLElement;

    overlay.click();

    await vi.advanceTimersByTimeAsync(200);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

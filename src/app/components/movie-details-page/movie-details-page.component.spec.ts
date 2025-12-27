import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { MovieDetailsPageComponent } from './movie-details-page.component';
import { MoviesService } from '../../services/movies.service';
import { MediaItem } from '../../models/movie.model';

// Создаем моковые данные, соответствующие интерфейсу MediaItem
const MOCK_MEDIA_ITEM: MediaItem = {
  id: 1,
  title: 'Тестовый фильм',
  release_date: '2024-01-01',
  genres: [{ id: 1, name: 'Тест' }],
  overview: 'Описание тестового фильма.',
  vote_average: 8.5,
  poster_path: 'https://example.com/poster.jpg',
  media_type: 'movie',
  genreNames: ['Тест'],
};

// Мокируем новый метод getMediaDetails
const mockMoviesService = {
  getMediaDetails: vi.fn().mockReturnValue(of(MOCK_MEDIA_ITEM)),
};

describe('MovieDetailsPageComponent', () => {
  let component: MovieDetailsPageComponent;
  let fixture: ComponentFixture<MovieDetailsPageComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [MovieDetailsPageComponent, RouterTestingModule],
      providers: [{ provide: MoviesService, useValue: mockMoviesService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieDetailsPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getMediaDetails with the correct ID and type from input', () => {
    // Устанавливаем оба required input: 'id' и 'type'
    fixture.componentRef.setInput('id', '1');
    fixture.componentRef.setInput('type', 'movie');
    fixture.detectChanges(); // Запускаем обнаружение изменений

    expect(mockMoviesService.getMediaDetails).toHaveBeenCalled();
    expect(mockMoviesService.getMediaDetails).toHaveBeenCalledWith(1, 'movie');
  });

  it('should display media details after data is loaded', async () => {
    fixture.componentRef.setInput('id', '1');
    fixture.componentRef.setInput('type', 'movie');
    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.movie-details-page__title')?.textContent).toContain(
      MOCK_MEDIA_ITEM.title
    );
    expect(compiled.querySelector('.movie-details-page__title')?.textContent).toContain('2024');
    expect(compiled.querySelector('.movie-details-page__rating')?.textContent).toContain(
      String(MOCK_MEDIA_ITEM.vote_average)
    );
    expect(compiled.querySelector('.movie-details-page__description')?.textContent).toBe(
      MOCK_MEDIA_ITEM.overview
    );
  });
});

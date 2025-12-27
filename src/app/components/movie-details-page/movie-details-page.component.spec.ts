import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { MovieDetailsPageComponent } from './movie-details-page.component';
import { MoviesService } from '../../services/movies.service';
import { Movie } from '../../models/movie.model';

// Создаем моковые (тестовые) данные для фильма
const MOCK_MOVIE: Movie = {
  id: 1,
  title: 'Тестовый фильм',
  year: 2024,
  genres: ['Тест', 'Фантастика'],
  description: 'Описание тестового фильма.',
  rating: 8.5,
  posterUrl: 'https://example.com/poster.jpg'
};

// Создаем мок-объект для MoviesService
const mockMoviesService = {
  getMovieById: vi.fn().mockReturnValue(of(MOCK_MOVIE))
};

describe('MovieDetailsPageComponent', () => {
  let component: MovieDetailsPageComponent;
  let fixture: ComponentFixture<MovieDetailsPageComponent>;

  beforeEach(async () => {
    // Сбрасываем моки перед каждым тестом
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [MovieDetailsPageComponent, RouterTestingModule],
      providers: [
        // Подменяем реальный сервис его моковой версией
        { provide: MoviesService, useValue: mockMoviesService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieDetailsPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Тест 1: Компонент должен успешно создаваться
    expect(component).toBeTruthy();
  });

  it('should call getMovieById with the correct ID from input', () => {
    // Тест 2: Проверяем, что сервис вызывается с правильным ID
    // Устанавливаем значение для required input 'id'
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges(); // Запускаем обнаружение изменений

    expect(mockMoviesService.getMovieById).toHaveBeenCalled();
    expect(mockMoviesService.getMovieById).toHaveBeenCalledWith(1);
  });

  it('should display movie details after data is loaded', async () => {
    // Тест 3: Проверяем, что данные фильма корректно отображаются в шаблоне
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges(); // Запускаем получение данных

    // Ждем завершения всех асинхронных операций (включая преобразование Observable в signal)
    await fixture.whenStable();
    fixture.detectChanges(); // Обновляем шаблон с полученными данными

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.movie-details-page__title')?.textContent).toContain(MOCK_MOVIE.title);
    expect(compiled.querySelector('.movie-details-page__title')?.textContent).toContain(String(MOCK_MOVIE.year));
    expect(compiled.querySelector('.movie-details-page__rating')?.textContent).toContain(String(MOCK_MOVIE.rating));
    expect(compiled.querySelector('.movie-details-page__description')?.textContent).toBe(MOCK_MOVIE.description);
    const genreTags = compiled.querySelectorAll('.movie-details-page__genre-tag');
    expect(genreTags.length).toBe(MOCK_MOVIE.genres.length);
    expect(genreTags[0].textContent).toBe(MOCK_MOVIE.genres[0]);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { RouterTestingModule } from '@angular/router/testing';

import { MovieDetailsComponent } from './movie-details.component';
import { MediaItem } from '../../models/movie.model';
import { MediaType } from '../../core/models/media-type.enum';

// Создаем моковые данные, соответствующие интерфейсу MediaItem
const MOCK_MEDIA_ITEM: MediaItem = {
  id: 1,
  title: 'Тестовый фильм',
  release_date: '2024-01-01',
  genres: [
    { id: 1, name: 'Тест' },
    { id: 2, name: 'Фантастика' },
  ],
  overview: 'Это описание тестового фильма.',
  vote_average: 9.9,
  poster_path: 'https://example.com/poster.jpg',
  media_type: MediaType.Movie,
  genreNames: ['Тест', 'Фантастика'],
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

    // Передаем моковые данные в компонент
    component.movie = MOCK_MEDIA_ITEM;

    fixture.detectChanges(); // Запускаем первоначальную привязку данных
  });

  it('should create', () => {
    // Тест 1: Компонент успешно создается
    expect(component).toBeTruthy();
  });

  it('should display movie details correctly', () => {
    // Тест 2: Проверяем, что данные из объекта movie правильно отображаются в шаблоне
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

  it('should emit close event on close button click', () => {
    // Тест 3: Проверяем, что событие close вызывается при клике на кнопку закрытия
    const spy = vi.spyOn(component.close, 'emit');
    const closeButton = fixture.nativeElement.querySelector(
      '.movie-details__close-btn'
    ) as HTMLButtonElement;

    closeButton.click(); // Симулируем клик

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should emit close event on overlay click', () => {
    // Тест 4: Проверяем, что событие close вызывается при клике на оверлей
    const spy = vi.spyOn(component.close, 'emit');
    const overlay = fixture.nativeElement.querySelector(
      '.movie-details__overlay'
    ) as HTMLElement;

    overlay.click(); // Симулируем клик

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

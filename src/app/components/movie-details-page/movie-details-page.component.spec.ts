import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';
import { By } from '@angular/platform-browser';
// ИСПРАВЛЕНИЕ: Импортируем токен IMAGE_LOADER напрямую
import { IMAGE_LOADER } from '@angular/common';

import { MovieDetailsPageComponent } from './movie-details-page.component';
import { SkeletonDetailsComponent } from '../skeleton-details/skeleton-details.component';
import { MoviesService } from '../../services/movies.service';
import { MediaItem } from '../../models/movie.model';
import { MediaType } from '../../core/models/media-type.enum';

// Создаем моковые данные, соответствующие интерфейсу MediaItem
const MOCK_MEDIA_ITEM: MediaItem = {
  id: 1,
  title: 'Тестовый фильм',
  release_date: '2024-01-01',
  genres: [{ id: 1, name: 'Тест' }],
  overview: 'Описание тестового фильма.',
  vote_average: 8.5,
  poster_path: 'https://example.com/poster.jpg',
  media_type: MediaType.Movie,
  genreNames: ['Тест'],
  genre_ids: [1], // Добавлено поле
};

// Мокируем сервис
const mockMoviesService = {
  getMediaDetails: vi.fn(),
};

describe('MovieDetailsPageComponent', () => {
  let component: MovieDetailsPageComponent;
  let fixture: ComponentFixture<MovieDetailsPageComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Мокаем window.scrollTo перед каждым тестом
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [MovieDetailsPageComponent, RouterTestingModule, SkeletonDetailsComponent],
      providers: [
        { provide: MoviesService, useValue: mockMoviesService },
        // ИСПРАВЛЕНИЕ: Вручную предоставляем пустую функцию-загрузчик для токена IMAGE_LOADER
        {
          provide: IMAGE_LOADER,
          useValue: () => '', // Функция-пустышка
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieDetailsPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getMediaDetails with the correct ID and type from input', () => {
    mockMoviesService.getMediaDetails.mockReturnValue(of(MOCK_MEDIA_ITEM));

    fixture.componentRef.setInput('id', '1');
    fixture.componentRef.setInput('type', MediaType.Movie);
    fixture.detectChanges();

    expect(mockMoviesService.getMediaDetails).toHaveBeenCalled();
    expect(mockMoviesService.getMediaDetails).toHaveBeenCalledWith(1, MediaType.Movie);
  });

  it('should display media details after data is loaded', async () => {
    mockMoviesService.getMediaDetails.mockReturnValue(of(MOCK_MEDIA_ITEM));

    fixture.componentRef.setInput('id', '1');
    fixture.componentRef.setInput('type', MediaType.Movie);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.movie-details-page__title')?.textContent).toContain(
      MOCK_MEDIA_ITEM.title
    );
  });

  it('should show skeleton while loading', async () => {
    // Используем Subject, чтобы имитировать долгую загрузку
    const loadingSubject = new Subject<MediaItem>();
    mockMoviesService.getMediaDetails.mockReturnValue(loadingSubject);

    fixture.componentRef.setInput('id', '999');
    fixture.componentRef.setInput('type', MediaType.Movie);

    fixture.detectChanges(); // Инициируем запрос

    // Проверяем, что отображается скелетон
    const skeleton = fixture.debugElement.query(By.directive(SkeletonDetailsComponent));
    expect(skeleton).toBeTruthy();

    // Проверяем, что контент еще не отображается
    const content = fixture.nativeElement.querySelector('.movie-details-page__content');
    expect(content).toBeNull();

    // Завершаем Subject для избежания утечек памяти
    loadingSubject.complete();
  });
});

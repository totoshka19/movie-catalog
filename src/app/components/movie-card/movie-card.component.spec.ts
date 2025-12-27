import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieCardComponent } from './movie-card.component';
import { Movie } from '../../models/movie.model';

// Создаем моковые (тестовые) данные для фильма
const MOCK_MOVIE: Movie = {
  id: 1,
  title: 'Тестовый фильм',
  year: 2024,
  genres: ['Тест'],
  description: 'Описание тестового фильма.',
  rating: 8.5,
  posterUrl: 'https://example.com/poster.jpg'
};

describe('MovieCard', () => {
  let component: MovieCardComponent;
  let fixture: ComponentFixture<MovieCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieCardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MovieCardComponent);
    component = fixture.componentInstance;

    // Передаем моковые данные в @Input свойство компонента
    component.movie = MOCK_MOVIE;

    // Запускаем механизм обнаружения изменений, чтобы шаблон отрисовался с данными
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display movie title and year', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.movie-card__title')?.textContent).toContain(MOCK_MOVIE.title);
    expect(compiled.querySelector('.movie-card__year')?.textContent).toContain(MOCK_MOVIE.year);
  });
});

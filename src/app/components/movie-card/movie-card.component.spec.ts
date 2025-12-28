import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieCardComponent } from './movie-card.component';
import { MediaItem } from '../../models/movie.model';
import { MediaType } from '../../core/models/media-type.enum';

const MOCK_MEDIA_ITEM: MediaItem = {
  id: 1,
  title: 'Тестовый фильм',
  release_date: '2024-01-01',
  overview: 'Описание тестового фильма.',
  vote_average: 8.5,
  poster_path: 'https://example.com/poster.jpg',
  media_type: MediaType.Movie,
  genreNames: ['Тест'],
  genre_ids: [1], // Добавлено поле
};

describe('MovieCard', () => {
  let component: MovieCardComponent;
  let fixture: ComponentFixture<MovieCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCardComponent);
    component = fixture.componentInstance;

    // Передаем моковые данные в @Input свойство компонента
    component.movie = MOCK_MEDIA_ITEM;

    // Запускаем механизм обнаружения изменений, чтобы шаблон отрисовался с данными
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display movie title and year', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.movie-card__title')?.textContent).toContain(
      MOCK_MEDIA_ITEM.title
    );
    expect(compiled.querySelector('.movie-card__year')?.textContent).toContain('2024');
  });

  it('should display rating badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const ratingEl = compiled.querySelector('.movie-card__rating');
    expect(ratingEl).toBeTruthy();
    expect(ratingEl?.textContent).toContain('8.5');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieCardComponent } from './movie-card.component';
import { ImdbTitle, ImdbTitleType } from '../../models/imdb.model';

const MOCK_MEDIA_ITEM: ImdbTitle = {
  id: 'tt12345',
  type: ImdbTitleType.Movie,
  primaryTitle: 'Тестовый фильм',
  originalTitle: 'Test Movie',
  isAdult: false,
  startYear: 2024,
  genres: ['Тест'],
  primaryImage: { url: 'https://example.com/poster.jpg', width: 100, height: 150 },
  rating: { aggregateRating: 8.5, voteCount: 1000 },
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
    component.movie = MOCK_MEDIA_ITEM;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display movie title and year', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.movie-card__title')?.textContent).toContain(
      MOCK_MEDIA_ITEM.primaryTitle
    );
    expect(compiled.querySelector('.movie-card__year')?.textContent).toContain('2024');
  });

  it('should display rating badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const ratingEl = compiled.querySelector('.movie-card__rating');
    expect(ratingEl).toBeTruthy();
    expect(ratingEl?.textContent).toContain('8,5');
  });
});

import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { MovieListComponent } from './components/movie-list/movie-list.component';
import { MoviesService } from './services/movies.service';
import { Movie } from './models/movie.model';
import { finalize } from 'rxjs';
import { MovieDetailsComponent } from './components/movie-details/movie-details.component';
import { SkeletonListComponent } from './components/skeleton-list/skeleton-list.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SearchBarComponent,
    MovieListComponent,
    MovieDetailsComponent,
    SkeletonListComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('Каталог фильмов');

  private readonly moviesService = inject(MoviesService);
  private readonly router = inject(Router);

  // Сигнал для отслеживания текущего URL
  protected readonly isRootRoute = signal(true);

  // Сигналы для управления состоянием
  private readonly allMovies = signal<Movie[]>([]); // Хранит все фильмы
  protected readonly searchQuery = signal<string>(''); // Хранит текущий поисковый запрос
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly selectedMovie = signal<Movie | null>(null);

  // Вычисляемый сигнал, который автоматически фильтрует фильмы при изменении allMovies или searchQuery
  protected readonly filteredMovies = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.allMovies();
    }
    return this.allMovies().filter(movie =>
      movie.title.toLowerCase().includes(query)
    );
  });

  constructor() {
    // Эффект для блокировки прокрутки страницы и компенсации сдвига
    effect(() => {
      if (this.selectedMovie()) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
        document.body.classList.add('no-scroll');
      } else {
        document.body.style.paddingRight = '';
        document.body.classList.remove('no-scroll');
      }
    });

    // Подписываемся на события роутера, чтобы определять, где мы находимся
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isRootRoute.set(event.urlAfterRedirects === '/');
      // Закрываем модальное окно при переходе на страницу фильма
      if (this.selectedMovie()) {
        this.onCloseDetails();
      }
    });
  }

  ngOnInit(): void {
    this.loadAllMovies();
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onMovieSelect(movie: Movie): void {
    this.selectedMovie.set(movie);
  }

  onCloseDetails(): void {
    this.selectedMovie.set(null);
  }

  private loadAllMovies(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.moviesService.getMovies().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (movies) => this.allMovies.set(movies),
      error: (err) => this.error.set(err.message)
    });
  }
}

import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { MovieListComponent } from './components/movie-list/movie-list.component';
import { MoviesService } from './services/movies.service';
import { Movie } from './models/movie.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [SearchBarComponent, MovieListComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('Каталог фильмов');

  private readonly moviesService = inject(MoviesService);

  // Сигналы для управления состоянием
  private readonly allMovies = signal<Movie[]>([]); // Хранит все фильмы
  protected readonly searchQuery = signal<string>(''); // Хранит текущий поисковый запрос
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);

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

  ngOnInit(): void {
    // Загружаем все фильмы при инициализации
    this.loadAllMovies();
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
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

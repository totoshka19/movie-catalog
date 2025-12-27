import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Movie } from '../../models/movie.model';
import { MovieCardComponent } from '../movie-card/movie-card.component';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [MovieCardComponent],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieListComponent {
  @Input({ required: true }) movies: Movie[] = [];
  @Output() movieClick = new EventEmitter<Movie>();

  onCardClick(movie: Movie): void {
    this.movieClick.emit(movie);
  }
}

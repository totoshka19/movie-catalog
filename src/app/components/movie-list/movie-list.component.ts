import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ImdbTitle } from '../../models/imdb.model';
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
  @Input({ required: true }) movies: ImdbTitle[] = [];
  @Input() emptyMessage: string = 'Элементы не найдены.';
  @Output() movieClick = new EventEmitter<ImdbTitle>();

  onCardClick(movie: ImdbTitle): void {
    this.movieClick.emit(movie);
  }
}

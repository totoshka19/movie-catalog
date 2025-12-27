import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MediaItem } from '../../models/movie.model';
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
  @Input({ required: true }) movies: MediaItem[] = [];
  @Input() emptyMessage: string = 'Элементы не найдены.';
  @Output() movieClick = new EventEmitter<MediaItem>();

  onCardClick(movie: MediaItem): void {
    this.movieClick.emit(movie);
  }
}

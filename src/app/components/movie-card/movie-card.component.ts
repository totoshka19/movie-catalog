import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieCardComponent {
  // Используем required input для гарантии получения данных
  @Input({ required: true }) movie!: Movie;

  // Сигнал для отслеживания состояния загрузки изображения
  protected readonly imageLoaded = signal(false);

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }
}

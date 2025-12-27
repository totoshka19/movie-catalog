import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { MediaItem } from '../../models/movie.model';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TmdbImagePipe } from '../../pipes/tmdb-image.pipe';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [DatePipe, DecimalPipe, TmdbImagePipe],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: MediaItem;

  // Сигнал для отслеживания состояния загрузки изображения
  protected readonly imageLoaded = signal(false);

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }
}

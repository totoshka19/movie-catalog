import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { MediaItem } from '../../models/movie.model';
import { environment } from '../../../environments/environment';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: MediaItem;

  // Сигнал для отслеживания состояния загрузки изображения
  protected readonly imageLoaded = signal(false);

  /**
   * Формирует полный URL для постера.
   * @param posterPath - Путь к постеру, полученный от API.
   * @returns Полный URL к изображению или null, если путь не указан.
   */
  getPosterUrl(posterPath: string | null): string | null {
    return posterPath ? `${environment.imageBaseUrl}${posterPath}` : null;
  }

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }
}

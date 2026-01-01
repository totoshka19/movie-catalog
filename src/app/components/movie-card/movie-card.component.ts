import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { ImdbTitle } from '../../models/imdb.model';
import { DecimalPipe, NgOptimizedImage } from '@angular/common'; // DatePipe удален
import { ResizeImagePipe } from '../../pipes/resize-image.pipe';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [DecimalPipe, NgOptimizedImage, ResizeImagePipe],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: ImdbTitle;
  @Input() priority = false;

  // Сигнал для отслеживания состояния загрузки изображения
  protected readonly imageLoaded = signal(false);

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }
}

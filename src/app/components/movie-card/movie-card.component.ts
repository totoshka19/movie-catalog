import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { ImdbTitle } from '../../models/imdb.model';
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
  @Input({ required: true }) movie!: ImdbTitle;

  // Сигнал для отслеживания состояния загрузки изображения
  protected readonly imageLoaded = signal(false);

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }
}

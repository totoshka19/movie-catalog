import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { ImdbTitle } from '../../models/imdb.model';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { ResizeImagePipe } from '../../pipes/resize-image.pipe';
import { GenreTranslationPipe } from '../../pipes/genre-translation.pipe';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [DecimalPipe, NgOptimizedImage, ResizeImagePipe, GenreTranslationPipe],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: ImdbTitle;
  @Input() priority = false;

  protected readonly imageLoaded = signal(false);

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }
}

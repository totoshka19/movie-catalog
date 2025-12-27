import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieDetailsComponent {
  @Input({ required: true }) movie!: Movie;
  @Output() close = new EventEmitter<void>();

  /**
   * Прослушивает нажатие клавиши Escape на уровне документа
   * и вызывает метод закрытия модального окна.
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onClose();
  }

  // Предотвращаем закрытие модального окна при клике на его контент
  onContentClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onClose(): void {
    this.close.emit();
  }
}

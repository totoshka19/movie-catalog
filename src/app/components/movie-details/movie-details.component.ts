import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MediaItem } from '../../models/movie.model';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieDetailsComponent {
  @Input({ required: true }) movie!: MediaItem;
  @Output() close = new EventEmitter<void>();

  /**
   * Прослушивает нажатие клавиши Escape на уровне документа
   * и вызывает метод закрытия модального окна.
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onClose();
  }

  /**
   * Формирует полный URL для постера.
   * @param posterPath - Путь к постеру, полученный от API.
   * @returns Полный URL к изображению или null, если путь не указан.
   */
  getPosterUrl(posterPath: string | null): string | null {
    return posterPath ? `${environment.imageBaseUrl}${posterPath}` : null;
  }

  // Предотвращаем закрытие модального окна при клике на его контент
  onContentClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onClose(): void {
    this.close.emit();
  }
}

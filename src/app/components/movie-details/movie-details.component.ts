import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, signal, AfterViewInit } from '@angular/core';
import { MediaItem } from '../../models/movie.model';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TmdbImagePipe } from '../../pipes/tmdb-image.pipe';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, TmdbImagePipe],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieDetailsComponent implements AfterViewInit {
  @Input({ required: true }) movie!: MediaItem;
  @Output() close = new EventEmitter<void>();

  /**
   * Сигнал для управления CSS-классом, который запускает анимации появления и исчезновения.
   */
  protected readonly isVisible = signal(false);

  /**
   * После того, как компонент отрисовался в DOM,
   * запускаем анимацию появления с небольшой задержкой.
   */
  ngAfterViewInit(): void {
    // Задержка нужна, чтобы браузер успел отрисовать начальное (скрытое) состояние
    setTimeout(() => this.isVisible.set(true), 10);
  }

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
    // 1. Запускаем анимацию исчезновения
    this.isVisible.set(false);
    // 2. Ждем завершения анимации (200ms, как в CSS) и только потом эмитим событие
    setTimeout(() => this.close.emit(), 200);
  }
}

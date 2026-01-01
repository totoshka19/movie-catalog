import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, signal, AfterViewInit } from '@angular/core';
import { ImdbTitle } from '../../models/imdb.model';
import { RouterLink } from '@angular/router';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [RouterLink, DecimalPipe, NgOptimizedImage],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieDetailsComponent implements AfterViewInit {
  @Input({ required: true }) movie!: ImdbTitle;
  @Output() close = new EventEmitter<void>();

  protected readonly isVisible = signal(false);

  /**
   * Преобразует ЛЮБОЙ тип медиа из API в тип, понятный для роутера ('movie' или 'tv').
   * Обрабатывает все известные типы из Swagger и нечувствителен к регистру.
   */
  public get detailsPageLink(): any[] {
    const type = this.movie.type.toLowerCase();
    const id = this.movie.id;

    switch (type) {
      // Все, что относится к сериалам
      case 'tv_series':
      case 'tv_mini_series':
      case 'tv_special':
        return ['/media', 'tv', id];

      // Все остальное (включая MOVIE, SHORT, VIDEO и т.д.) считаем фильмами
      case 'movie':
      case 'tv_movie':
      case 'short':
      case 'video':
      case 'video_game':
      case 'videogame':
      default:
        return ['/media', 'movie', id];
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.isVisible.set(true), 10);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onClose();
  }

  onContentClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onClose(): void {
    this.isVisible.set(false);
    setTimeout(() => this.close.emit(), 200);
  }
}

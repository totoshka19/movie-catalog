import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, signal, AfterViewInit } from '@angular/core';
import { ImdbTitle } from '../../models/imdb.model';
import { RouterLink } from '@angular/router';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { mapImdbTypeToMediaType } from '../../utils/media-type.utils';
import { MediaType } from '../../core/models/media-type.enum';
import { GenreTranslationPipe } from '../../pipes/genre-translation.pipe';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [RouterLink, DecimalPipe, NgOptimizedImage, GenreTranslationPipe],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieDetailsComponent implements AfterViewInit {
  @Input({ required: true }) movie!: ImdbTitle;
  @Input() mediaTypeContext: MediaType | null = null;
  @Output() close = new EventEmitter<void>();

  protected readonly isVisible = signal(false);

  public get detailsPageLink(): any[] {
    const typeFromContext =
      this.mediaTypeContext && this.mediaTypeContext !== MediaType.All
        ? this.mediaTypeContext
        : null;
    const routeType = typeFromContext ?? mapImdbTypeToMediaType(this.movie.type);
    return ['/media', routeType, this.movie.id];
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

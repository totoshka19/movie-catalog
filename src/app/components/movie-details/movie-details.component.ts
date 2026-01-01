import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, signal, AfterViewInit } from '@angular/core';
import { ImdbTitle } from '../../models/imdb.model';
import { RouterLink } from '@angular/router';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { mapImdbTypeToMediaType } from '../../utils/media-type.utils';

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

  public get detailsPageLink(): any[] {
    const routeType = mapImdbTypeToMediaType(this.movie.type);
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

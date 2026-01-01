import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, signal, AfterViewInit } from '@angular/core';
import { ImdbTitle } from '../../models/imdb.model';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieDetailsComponent implements AfterViewInit {
  @Input({ required: true }) movie!: ImdbTitle;
  @Output() close = new EventEmitter<void>();

  protected readonly isVisible = signal(false);

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

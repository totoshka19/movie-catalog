import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImdbInterest } from '../../models/imdb.model';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { MediaType, SortType } from '../../core/models/media-type.enum';
import { GenreTranslationPipe } from '../../pipes/genre-translation.pipe';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SearchBarComponent, RouterLink, GenreTranslationPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() selectedGenres: string[] = [];
  @Input({ required: true }) genres: ImdbInterest[] = [];
  @Input() initialQuery: string = '';
  @Input() activeType: MediaType = MediaType.All;
  @Input() activeSort: SortType = SortType.Newest;
  @Output() genreChange = new EventEmitter<string[]>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  isSelected(id: string): boolean {
    return this.selectedGenres.includes(id);
  }

  onGenreToggle(event: Event, genreId: string): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    let newGenres: string[];

    if (isChecked) {
      newGenres = [...this.selectedGenres, genreId];
    } else {
      newGenres = this.selectedGenres.filter(id => id !== genreId);
    }

    this.genreChange.emit(newGenres);
  }

  resetGenres(): void {
    this.genreChange.emit([]);
  }

  onSearchChange(query: string): void {
    this.searchChange.emit(query);
  }

  onClose(): void {
    this.close.emit();
  }
}

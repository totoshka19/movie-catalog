import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Genre } from '../../models/movie.model';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { MediaType, SortType } from '../../core/models/media-type.enum';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SearchBarComponent, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() selectedGenres: string[] = [];
  @Input({ required: true }) genres: Genre[] = [];
  @Input() initialQuery: string = '';
  @Input() activeType: MediaType = MediaType.All;
  @Input() activeSort: SortType = SortType.Newest;
  @Output() genreChange = new EventEmitter<string[]>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  isSelected(id: string | number): boolean {
    return this.selectedGenres.includes(String(id));
  }

  onGenreToggle(event: Event, genreId: string | number): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const idStr = String(genreId);
    let newGenres: string[];

    if (isChecked) {
      newGenres = [...this.selectedGenres, idStr];
    } else {
      newGenres = this.selectedGenres.filter(id => id !== idStr);
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

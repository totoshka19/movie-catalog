import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Genre } from '../../models/movie.model';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SearchBarComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  // ИЗМЕНЕНИЕ: Добавлен Input для управления состоянием
  @Input() isOpen = false;
  @Input() selectedGenres: number[] = [];
  @Input({ required: true }) genres: Genre[] = [];
  @Input() initialQuery: string = '';
  @Output() genreChange = new EventEmitter<number[]>();
  @Output() searchChange = new EventEmitter<string>();
  // ИЗМЕНЕНИЕ: Добавлен Output для закрытия
  @Output() close = new EventEmitter<void>();

  isSelected(id: number): boolean {
    return this.selectedGenres.includes(id);
  }

  onGenreToggle(event: Event, genreId: number): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    let newGenres: number[];

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

  // ИЗМЕНЕНИЕ: Добавлен метод для закрытия
  onClose(): void {
    this.close.emit();
  }
}

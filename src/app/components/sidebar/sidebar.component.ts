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
  @Input({ required: true }) initialQuery: string = '';
  @Input({ required: true }) placeholder: string = 'Поиск...';
  // Изменили тип с number | undefined на number[]
  @Input() selectedGenres: number[] = [];
  @Input({ required: true }) genres: Genre[] = [];

  @Output() searchChange = new EventEmitter<string>();
  // Изменили тип события на массив чисел
  @Output() genreChange = new EventEmitter<number[]>();

  onSearch(query: string): void {
    this.searchChange.emit(query);
  }

  isSelected(id: number): boolean {
    return this.selectedGenres.includes(id);
  }

  onGenreToggle(event: Event, genreId: number): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    let newGenres: number[];

    if (isChecked) {
      // Добавляем жанр
      newGenres = [...this.selectedGenres, genreId];
    } else {
      // Удаляем жанр
      newGenres = this.selectedGenres.filter(id => id !== genreId);
    }

    this.genreChange.emit(newGenres);
  }

  resetGenres(): void {
    this.genreChange.emit([]);
  }
}

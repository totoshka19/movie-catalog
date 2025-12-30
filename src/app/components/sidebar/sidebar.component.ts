import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Genre } from '../../models/movie.model';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SearchBarComponent], // Импортируем SearchBarComponent
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input() selectedGenres: number[] = [];
  @Input({ required: true }) genres: Genre[] = [];
  @Input() initialQuery: string = ''; // Input для начального значения поиска
  @Output() genreChange = new EventEmitter<number[]>();
  @Output() searchChange = new EventEmitter<string>(); // Output для события поиска

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

  // Метод для "проброса" события от дочернего SearchBarComponent
  onSearchChange(query: string): void {
    this.searchChange.emit(query);
  }
}

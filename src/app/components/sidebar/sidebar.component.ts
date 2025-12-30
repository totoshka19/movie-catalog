import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Genre } from '../../models/movie.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input() selectedGenres: number[] = [];
  @Input({ required: true }) genres: Genre[] = [];
  @Output() genreChange = new EventEmitter<number[]>();

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
}

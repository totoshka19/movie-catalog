import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Genre } from '../../models/movie.model';
import { MediaType } from '../../core/models/media-type.enum';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, SearchBarComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input({ required: true }) initialQuery: string = '';
  @Input({ required: true }) placeholder: string = 'Поиск...';
  @Input({ required: true }) activeTab: MediaType = MediaType.All;
  @Input() selectedGenre?: number;
  @Input({ required: true }) genres: Genre[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() genreChange = new EventEmitter<Event>();

  /**
   * Пробрасывает событие из дочернего компонента `app-search-bar` наверх.
   * @param query - Поисковый запрос.
   */
  onSearch(query: string): void {
    this.searchChange.emit(query);
  }

  /**
   * Пробрасывает событие `change` от элемента `select` наверх.
   * @param event - Событие изменения.
   */
  onGenreChange(event: Event): void {
    this.genreChange.emit(event);
  }
}

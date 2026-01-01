import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MediaType, SortType } from '../../core/models/media-type.enum';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, SearchBarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input({ required: true }) activeType: MediaType = MediaType.All;
  @Input({ required: true }) activeSort: SortType = SortType.Newest;
  @Input() isSidebarOpen = false;
  @Input() selectedGenres: string[] = [];
  @Input() initialQuery: string = '';
  @Input() placeholder: string = 'Поиск...';
  @Output() searchChange = new EventEmitter<string>();
  @Output() toggleSidebar = new EventEmitter<void>();

  onSearch(query: string): void {
    this.searchChange.emit(query);
  }

  onToggleSidebarClick(): void {
    this.toggleSidebar.emit();
  }
}

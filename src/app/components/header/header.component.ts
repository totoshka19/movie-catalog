import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MediaType, SortType } from '../../core/models/media-type.enum';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input({ required: true }) activeType: MediaType = MediaType.All;
  @Input({ required: true }) activeSort: SortType = SortType.Newest;
  @Input() selectedGenres: number[] = [];
}

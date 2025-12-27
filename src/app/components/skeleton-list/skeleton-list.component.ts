import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonCardComponent } from '../skeleton-card/skeleton-card.component';

@Component({
  selector: 'app-skeleton-list',
  standalone: true,
  imports: [SkeletonCardComponent],
  templateUrl: './skeleton-list.component.html',
  styleUrl: './skeleton-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonListComponent {
  // Создаем массив-заглушку для итерации в шаблоне
  protected readonly skeletonItems = Array(12);
}

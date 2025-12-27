import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-details',
  standalone: true,
  imports: [],
  templateUrl: './skeleton-details.component.html',
  styleUrl: './skeleton-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonDetailsComponent {}

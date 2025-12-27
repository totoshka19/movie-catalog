import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Breadcrumb } from '../../models/breadcrumb.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  @Input({ required: true }) items: Breadcrumb[] = [];
}

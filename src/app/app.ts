import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

import { MovieDetailsComponent } from './components/movie-details/movie-details.component';
import { ModalService } from './services/modal.service';
import { NavigationHistoryService } from './services/navigation-history.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MovieDetailsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);
  // Инжектируем сервис, чтобы он был создан и начал работать
  private readonly navigationHistoryService = inject(NavigationHistoryService);

  protected readonly selectedMedia = this.modalService.selectedMedia;

  constructor() {
    // Закрываем модальное окно при переходе на другую страницу
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.modalService.close();
      });

    // Упрощенная блокировка скролла, полагающаяся на CSS
    effect(() => {
      if (this.selectedMedia()) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
    });
  }

  onCloseDetails(): void {
    this.modalService.close();
  }
}

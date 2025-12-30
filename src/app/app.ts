import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

import { MovieDetailsComponent } from './components/movie-details/movie-details.component';
import { ModalService } from './services/modal.service';
import { NavigationHistoryService } from './services/navigation-history.service';
import { ScrollLockService } from './services/scroll-lock.service';

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
  // Инжектируем новый сервис для управления скроллом
  private readonly scrollLockService = inject(ScrollLockService);

  protected readonly selectedMedia = this.modalService.selectedMedia;

  constructor() {
    // Закрываем модальное окно при переходе на другую страницу
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.modalService.close();
      });

    // ИЗМЕНЕНИЕ: Используем ScrollLockService для управления прокруткой
    // Этот подход более надежен, так как использует функцию очистки `onCleanup`.
    effect(onCleanup => {
      if (this.selectedMedia()) {
        this.scrollLockService.lock();

        // `onCleanup` гарантирует, что `unlock` будет вызван,
        // когда эффект уничтожится или перезапустится (т.е. когда `selectedMedia` станет null).
        onCleanup(() => {
          this.scrollLockService.unlock();
        });
      }
    });
  }

  onCloseDetails(): void {
    this.modalService.close();
  }
}

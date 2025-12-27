import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

import { MovieDetailsComponent } from './components/movie-details/movie-details.component';
import { ModalService } from './services/modal.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MovieDetailsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);

  protected readonly selectedMedia = this.modalService.selectedMedia;

  constructor() {
    // Закрываем модальное окно при переходе на другую страницу
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.modalService.close();
      });

    // Блокировка скролла при открытом модальном окне
    effect(() => {
      if (this.selectedMedia()) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
        document.body.classList.add('no-scroll');
      } else {
        document.body.style.paddingRight = '';
        document.body.classList.remove('no-scroll');
      }
    });
  }

  onCloseDetails(): void {
    this.modalService.close();
  }
}

import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Сервис для отслеживания истории навигации.
 * Хранит URL предыдущей страницы, с которой был совершен переход.
 */
@Injectable({
  providedIn: 'root',
})
export class NavigationHistoryService {
  /**
   * Сигнал, хранящий URL предыдущего маршрута.
   * По умолчанию равен корневому пути.
   */
  public readonly previousUrl = signal<string>('/');

  private currentUrl = '/';

  constructor(private router: Router) {
    this.currentUrl = this.router.url;

    // Подписываемся на события навигации
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Устанавливаем предыдущий URL равным тому, что был текущим до навигации
        this.previousUrl.set(this.currentUrl);
        // Обновляем текущий URL
        this.currentUrl = event.urlAfterRedirects;
      });
  }
}

import { Component, computed, effect, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { MovieDetailsComponent } from './components/movie-details/movie-details.component';
import { ModalService } from './services/modal.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SearchBarComponent, MovieDetailsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = 'Медиа Каталог';

  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);

  protected readonly selectedMedia = this.modalService.selectedMedia;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects)
    )
  );
  protected readonly isListPage = computed(() => {
    const url = this.currentUrl() ?? '';
    return url.startsWith('/all') || url.startsWith('/movie') || url.startsWith('/tv');
  });

  // Вычисляемый сигнал для определения текста плейсхолдера
  protected readonly searchPlaceholder = computed(() => {
    const url = this.currentUrl() ?? '';
    if (url.startsWith('/all')) {
      return 'Поиск фильмов или сериалов...';
    }
    if (url.startsWith('/movie')) {
      return 'Поиск фильмов...';
    }
    if (url.startsWith('/tv')) {
      return 'Поиск сериалов...';
    }
    // Возвращаем значение по умолчанию на всякий случай
    return 'Поиск...';
  });

  // Получаем поисковый запрос из URL для инициализации SearchBar
  protected readonly initialSearchQuery = toSignal(
    this.router.events.pipe(
      filter(() => this.isListPage()),
      map(() => {
        const urlTree = this.router.parseUrl(this.router.url);
        return urlTree.queryParams['q'] || '';
      })
    )
  );

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.modalService.close();
      });

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

  onSearch(query: string): void {
    this.router.navigate([], {
      queryParams: { q: query || null },
      queryParamsHandling: 'merge',
    });
  }

  onCloseDetails(): void {
    this.modalService.close();
  }
}

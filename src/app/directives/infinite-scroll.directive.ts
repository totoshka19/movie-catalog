import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true,
})
export class InfiniteScrollDirective implements AfterViewInit, OnDestroy {
  /**
   * Отступ от нижней границы вьюпорта, при котором сработает триггер.
   * Значение в пикселях. По умолчанию 500px (загрузка начнется заранее).
   */
  @Input() threshold = 500;

  /** Флаг для временного отключения (например, если идет загрузка или данных больше нет). */
  @Input() disabled = false;

  /** Событие, которое срабатывает при пересечении границы. */
  @Output() scrollEnd = new EventEmitter<void>();

  private observer: IntersectionObserver | null = null;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.setupObserver();
  }

  ngOnDestroy(): void {
    this.disconnectObserver();
  }

  private setupObserver(): void {
    // Проверяем поддержку API в браузере (на всякий случай, хотя поддержка сейчас отличная)
    if (!('IntersectionObserver' in window)) {
      return;
    }

    const options: IntersectionObserverInit = {
      root: null, // null означает viewport браузера
      // rootMargin позволяет расширить область видимости "виртуально".
      // '0px 0px 500px 0px' означает, что пересечение засчитается,
      // когда элемент будет находиться в 500px ОТ нижней границы экрана.
      rootMargin: `0px 0px ${this.threshold}px 0px`,
      threshold: 0, // Срабатываем при малейшем касании области (даже 1 пиксель)
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Если элемент пересек границу (стал "виден" с учетом отступа) и директива не отключена
        if (entry.isIntersecting && !this.disabled) {
          this.scrollEnd.emit();
        }
      });
    }, options);

    this.observer.observe(this.elementRef.nativeElement);
  }

  private disconnectObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

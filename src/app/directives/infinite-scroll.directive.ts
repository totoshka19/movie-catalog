import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true,
})
export class InfiniteScrollDirective {
  /** Порог в пикселях до конца страницы, при котором срабатывает событие. */
  @Input() threshold = 500;
  /** Флаг для временного отключения директивы (например, во время загрузки). */
  @Input() disabled = false;
  /** Событие, которое срабатывает при достижении конца прокрутки. */
  @Output() scrollEnd = new EventEmitter<void>();

  /**
   * Прослушивает событие прокрутки на уровне всего окна.
   */
  @HostListener('window:scroll')
  onScroll(): void {
    // Если директива отключена, ничего не делаем.
    if (this.disabled) {
      return;
    }

    // Рассчитываем текущую позицию скролла
    const pos =
      (document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight;
    // Рассчитываем максимальную высоту для прокрутки
    const max = document.documentElement.scrollHeight || document.body.scrollHeight;

    // Если текущая позиция достигла порога, отправляем событие
    if (pos >= max - this.threshold) {
      this.scrollEnd.emit();
    }
  }
}

import { Injectable } from '@angular/core';

/**
 * Сервис для централизованного управления блокировкой прокрутки body.
 * Использует счетчик для корректной обработки вложенных запросов на блокировку.
 */
@Injectable({
  providedIn: 'root',
})
export class ScrollLockService {
  private lockCount = 0;

  /**
   * Запрашивает блокировку прокрутки.
   * Добавляет класс 'no-scroll' к body, если это первый запрос на блокировку.
   */
  public lock(): void {
    this.lockCount++;
    if (this.lockCount === 1) {
      document.body.classList.add('no-scroll');
    }
  }

  /**
   * Снимает блокировку прокрутки.
   * Удаляет класс 'no-scroll' с body, если снят последний запрос на блокировку.
   */
  public unlock(): void {
    if (this.lockCount === 0) {
      return; // Предотвращаем уход счетчика в отрицательные значения
    }
    this.lockCount--;
    if (this.lockCount === 0) {
      document.body.classList.remove('no-scroll');
    }
  }
}

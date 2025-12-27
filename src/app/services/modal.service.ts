import { Injectable, signal } from '@angular/core';
import { MediaItem } from '../models/movie.model';

/**
 * Сервис для управления состоянием модального окна с детальной информацией.
 */
@Injectable({
  providedIn: 'root',
})
export class ModalService {
  /**
   * Сигнал, хранящий текущий выбранный для отображения в модальном окне элемент.
   * null означает, что модальное окно закрыто.
   */
  readonly selectedMedia = signal<MediaItem | null>(null);

  /**
   * Открывает модальное окно с деталями для указанного элемента.
   * @param item - Элемент (фильм или сериал) для отображения.
   */
  open(item: MediaItem): void {
    this.selectedMedia.set(item);
  }

  /**
   * Закрывает модальное окно.
   */
  close(): void {
    this.selectedMedia.set(null);
  }
}

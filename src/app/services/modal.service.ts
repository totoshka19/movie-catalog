import { Injectable, signal } from '@angular/core';
import { ImdbTitle } from '../models/imdb.model';
import { MediaType } from '../core/models/media-type.enum';

// Интерфейс для данных модального окна
export interface ModalData {
  item: ImdbTitle;
  type: MediaType;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  readonly selectedMedia = signal<ModalData | null>(null);

  open(item: ImdbTitle, type: MediaType): void {
    this.selectedMedia.set({ item, type });
  }

  close(): void {
    this.selectedMedia.set(null);
  }
}

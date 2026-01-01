import { Injectable, signal } from '@angular/core';
import { ImdbTitle } from '../models/imdb.model';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  readonly selectedMedia = signal<ImdbTitle | null>(null);

  open(item: ImdbTitle): void {
    this.selectedMedia.set(item);
  }

  close(): void {
    this.selectedMedia.set(null);
  }
}

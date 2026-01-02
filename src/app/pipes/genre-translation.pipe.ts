import { Pipe, PipeTransform, inject, LOCALE_ID } from '@angular/core';
import { GENRE_MAP } from '../core/constants/genre-map.constants';

@Pipe({
  name: 'genreTranslation',
  standalone: true
})
export class GenreTranslationPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(value: string | undefined | null): string {
    if (!value) return '';

    if (this.locale.startsWith('en')) {
      return value;
    }

    return GENRE_MAP[value] || value;
  }
}

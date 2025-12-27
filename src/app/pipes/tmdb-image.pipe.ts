import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

@Pipe({
  name: 'tmdbImage',
  standalone: true
})
export class TmdbImagePipe implements PipeTransform {
  /**
   * Преобразует путь к постеру в полный URL.
   * @param path - Путь к изображению (например, "/abc.jpg").
   * @returns Полный URL или null, если путь пустой.
   */
  transform(path: string | null | undefined): string | null {
    if (!path) {
      return null;
    }
    // Используем базовый URL из environment (там уже зашит w500)
    return `${environment.imageBaseUrl}${path}`;
  }
}

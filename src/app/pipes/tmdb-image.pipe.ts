import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

@Pipe({
  name: 'tmdbImage',
  standalone: true,
})
export class TmdbImagePipe implements PipeTransform {
  /**
   * Преобразует путь к постеру в полный URL с указанием размера.
   * @param path - Путь к изображению (например, "/abc.jpg").
   * @param size - Размер изображения (например, "w300", "w500", "original"). По умолчанию "w500".
   * @returns Полный URL или null, если путь пустой.
   */
  transform(path: string | null | undefined, size: string = 'w500'): string | null {
    if (!path) {
      return null;
    }
    // Используем базовый URL из environment и добавляем размер и путь
    return `${environment.imageBaseUrl}${size}${path}`;
  }
}

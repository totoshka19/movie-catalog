import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'resizeImage',
  standalone: true,
})
export class ResizeImagePipe implements PipeTransform {
  /**
   * Преобразует URL изображения IMDb для получения версии с заданной шириной.
   * @param url - Оригинальный URL изображения.
   * @param width - Желаемая ширина в пикселях.
   * @returns Модифицированный URL или оригинальный, если его не удалось обработать.
   */
  transform(url: string | undefined | null, width: number = 300): string {
    if (!url) {
      return 'assets/placeholder.png'; // Можно добавить заглушку
    }

    // Проверяем, содержит ли URL стандартный маркер '_V1_'
    if (url.includes('._V1_')) {
      // Заменяем маркер на версию с указанием ширины (UX = ширина)
      return url.replace('._V1_', `._V1_UX${width}_`);
    }

    // Если маркер не найден, возвращаем оригинальный URL
    return url;
  }
}

import { Pipe, PipeTransform } from '@angular/core';

/**
 * Пайп для перевода статусов фильмов и сериалов с английского на русский.
 */
@Pipe({
  name: 'statusTranslation',
  standalone: true,
})
export class StatusTranslationPipe implements PipeTransform {
  /**
   * Преобразует строку статуса в ее русскоязычный аналог.
   * @param value - Статус на английском языке (например, "Ended", "Released").
   * @returns Переведенный статус или исходная строка, если перевод не найден.
   */
  transform(value: string | undefined | null): string {
    if (!value) {
      return '';
    }

    switch (value) {
      case 'Ended':
        return 'Завершен';
      case 'Returning Series':
        return 'В эфире';
      case 'Released':
        return 'Выпущен';
      case 'In Production':
        return 'В производстве';
      case 'Planned':
        return 'Запланирован';
      case 'Canceled':
        return 'Отменен';
      case 'Post Production':
        return 'Пост-продакшн';
      default:
        // Если статус неизвестен, возвращаем его как есть
        return value;
    }
  }
}

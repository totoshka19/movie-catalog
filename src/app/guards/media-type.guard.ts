import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MediaType } from '../core/models/media-type.enum';

/**
 * Guard для проверки корректности типа медиа в параметрах URL.
 *
 * @param route - Текущий активируемый маршрут.
 * @returns `true`, если тип валиден ('movie' или 'tv'),
 *          иначе перенаправляет на главную страницу и возвращает `false`.
 */
export const mediaTypeGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const type = route.paramMap.get('type');

  // Проверяем, является ли тип одним из допустимых значений
  if (type === MediaType.Movie || type === MediaType.Tv) {
    return true; // Тип корректен, разрешаем активацию маршрута
  }

  // Если тип некорректен, перенаправляем на главную страницу
  // и запрещаем активацию маршрута.
  router.navigate(['/']);
  return false;
};

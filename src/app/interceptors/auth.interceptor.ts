import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * Перехватчик HTTP-запросов для автоматического добавления ключа API.
 * @param req - Исходящий запрос.
 * @param next - Следующий обработчик в цепочке.
 * @returns Модифицированный запрос с добавленным параметром api_key.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Клонируем запрос, чтобы добавить новый параметр
  const authReq = req.clone({
    setParams: {
      api_key: environment.apiKey,
      language: 'ru-RU' // Добавим язык, чтобы получать данные на русском
    },
  });

  // Передаем измененный запрос дальше по цепочке
  return next(authReq);
};

import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { API_LANGUAGE } from '../core/constants/api.constants';

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
      language: API_LANGUAGE,
    },
  });

  // Передаем измененный запрос дальше по цепочке
  return next(authReq);
};

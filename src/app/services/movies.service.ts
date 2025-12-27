import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  private readonly http = inject(HttpClient);
  private readonly moviesUrl = 'http://localhost:3000/movies'; // URL к API

  /**
   * Получает все фильмы с сервера.
   * @returns Observable со списком фильмов.
   */
  getMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.moviesUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Получает один фильм по его ID.
   * @param id - ID фильма.
   * @returns Observable с данными фильма.
   */
  getMovieById(id: number): Observable<Movie> {
    const url = `${this.moviesUrl}/${id}`;
    return this.http.get<Movie>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Обрабатывает ошибки HTTP-запросов.
   * @param error - Объект ошибки.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Клиентская ошибка или ошибка сети.
      errorMessage = `Произошла ошибка: ${error.error.message}`;
    } else {
      // Бэкенд вернул неуспешный код ответа.
      errorMessage = `Сервер вернул код ${error.status}, сообщение: ${error.message}`;
    }
    console.error(errorMessage);
    // Возвращаем observable с ошибкой, понятной для пользователя.
    return throwError(() => new Error('Не удалось загрузить фильмы. Пожалуйста, попробуйте позже.'));
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { MediaType, SortType } from '../core/models/media-type.enum';
import {
  ImdbInterest,
  ImdbListInterestCategoriesResponse,
  ImdbListTitleCreditsResponse,
  ImdbListTitlesResponse,
  ImdbListTitleVideosResponse,
  ImdbSortBy,
  ImdbSortOrder,
  ImdbTitle,
  ImdbTitleType,
} from '../models/imdb.model';
import { mapMediaTypeToImdbTypes } from '../utils/media-type.utils';

export interface TitleQueryParams {
  types?: ImdbTitleType[];
  genres?: string[];
  sortBy?: ImdbSortBy;
  sortOrder?: ImdbSortOrder;
  pageToken?: string;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  loadGenres(): Observable<ImdbInterest[]> {
    return this.http.get<ImdbListInterestCategoriesResponse>(`${this.apiUrl}/interests`).pipe(
      map(response => {
        return response.categories.flatMap(cat => cat.interests);
      })
    );
  }

  getTitles(
    mediaType: MediaType,
    sortBy: SortType,
    interestIds: string[] = [],
    pageToken?: string
  ): Observable<ImdbListTitlesResponse> {
    let params = new HttpParams();

    const types = mapMediaTypeToImdbTypes(mediaType);
    if (types.length) {
      types.forEach(t => (params = params.append('types', t)));
    }

    const { sort, order } = this.mapSortType(sortBy);
    params = params.set('sortBy', sort).set('sortOrder', order);

    if (interestIds.length) {
      interestIds.forEach(id => (params = params.append('interestIds', id)));
    }

    if (pageToken) {
      params = params.set('pageToken', pageToken);
    }

    return this.http.get<ImdbListTitlesResponse>(`${this.apiUrl}/titles`, { params });
  }

  searchTitles(query: string, limit: number = 20): Observable<ImdbListTitlesResponse> {
    const params = new HttpParams().set('query', query).set('limit', limit);
    return this.http.get<ImdbListTitlesResponse>(`${this.apiUrl}/search/titles`, { params });
  }

  getTitleDetails(id: string): Observable<ImdbTitle> {
    const details$ = this.http.get<ImdbTitle>(`${this.apiUrl}/titles/${id}`);

    const credits$ = this.http.get<ImdbListTitleCreditsResponse>(`${this.apiUrl}/titles/${id}/credits`, {
      params: { pageSize: 10 }
    });

    const videos$ = this.http.get<ImdbListTitleVideosResponse>(`${this.apiUrl}/titles/${id}/videos`, {
      params: { pageSize: 5 }
    });

    return forkJoin({
      details: details$,
      creditsResp: credits$,
      videosResp: videos$
    }).pipe(
      map(({ details, creditsResp, videosResp }) => {
        return {
          ...details,
          creditsList: creditsResp.credits,
          videosList: videosResp.videos
        } as ImdbTitle & { creditsList: any[], videosList: any[] };
      })
    );
  }

  private mapSortType(sort: SortType): { sort: ImdbSortBy; order: ImdbSortOrder } {
    switch (sort) {
      case SortType.Newest:
        return { sort: ImdbSortBy.ReleaseDate, order: ImdbSortOrder.Desc };
      case SortType.TopRated:
        return { sort: ImdbSortBy.UserRating, order: ImdbSortOrder.Desc };
      default:
        return { sort: ImdbSortBy.Popularity, order: ImdbSortOrder.Desc };
    }
  }
}

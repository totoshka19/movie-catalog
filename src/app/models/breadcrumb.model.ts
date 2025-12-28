import { Params } from '@angular/router';

/**
 * Интерфейс для элемента хлебных крошек.
 */
export interface Breadcrumb {
  label: string;
  link: any[] | string;
  queryParams?: Params;
}

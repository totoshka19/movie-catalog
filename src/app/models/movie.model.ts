/**
 * Интерфейс для жанра.
 * Используется в SidebarComponent и GenresResolver.
 * TODO: В будущем перенести в imdb.model.ts
 */
export interface Genre {
  id: number | string;
  name: string;
}

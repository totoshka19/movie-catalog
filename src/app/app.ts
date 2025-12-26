import { Component, signal } from '@angular/core';
import { SearchBarComponent } from './components/search-bar/search-bar.component';

@Component({
  selector: 'app-root',
  imports: [SearchBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Каталог фильмов');

  onSearch(query: string): void {
    console.log('Поисковый запрос:', query);
  }
}

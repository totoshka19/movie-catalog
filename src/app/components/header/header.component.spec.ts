import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { By } from '@angular/platform-browser';
import { MediaType, SortType } from '../../core/models/media-type.enum';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { vi } from 'vitest';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // ИЗМЕНЕНИЕ: Добавлен SearchBarComponent для тестирования
      imports: [HeaderComponent, RouterTestingModule, SearchBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;

    // Инициализируем обязательные инпуты
    fixture.componentRef.setInput('activeType', MediaType.All);
    fixture.componentRef.setInput('activeSort', SortType.Newest);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should highlight active sort and type tabs', () => {
    // Проверяем состояние по умолчанию
    let activeLinks = fixture.debugElement.queryAll(By.css('a.active'));
    expect(activeLinks.length).toBe(2);
    expect(activeLinks[0].nativeElement.textContent).toContain('Новинки');
    expect(activeLinks[1].nativeElement.textContent).toContain('Все');

    // Используем setInput для корректного обновления OnPush компонента
    fixture.componentRef.setInput('activeType', MediaType.Movie);
    fixture.componentRef.setInput('activeSort', SortType.TopRated);
    fixture.detectChanges();

    activeLinks = fixture.debugElement.queryAll(By.css('a.active'));
    expect(activeLinks.length).toBe(2);
    expect(activeLinks[0].nativeElement.textContent).toContain('Лучшее');
    expect(activeLinks[1].nativeElement.textContent).toContain('Фильмы');
  });

  // ИЗМЕНЕНИЕ: Добавлен тест для события поиска
  it('should emit searchChange event when search bar emits', () => {
    const spy = vi.spyOn(component.searchChange, 'emit');
    const searchBar = fixture.debugElement.query(By.directive(SearchBarComponent));

    searchBar.triggerEventHandler('searchChange', 'test query');

    expect(spy).toHaveBeenCalledWith('test query');
  });
});

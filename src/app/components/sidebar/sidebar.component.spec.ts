import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { By } from '@angular/platform-browser';

import { SidebarComponent } from './sidebar.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent, SearchBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display genres from input as checkboxes', () => {
    component.genres = [
      { id: 1, name: 'Боевик' },
      { id: 2, name: 'Комедия' },
    ];
    fixture.detectChanges();

    // Ищем элементы чекбоксов по классу лейбла или input
    const checkboxLabels = fixture.debugElement.queryAll(By.css('.checkbox-label'));
    expect(checkboxLabels.length).toBe(2);
    expect(checkboxLabels[1].nativeElement.textContent).toContain('Комедия');
  });

  it('should emit searchChange event on search', () => {
    const spy = vi.spyOn(component.searchChange, 'emit');
    fixture.detectChanges();

    const searchBar = fixture.debugElement.query(By.directive(SearchBarComponent));
    searchBar.triggerEventHandler('searchChange', 'test query');

    expect(spy).toHaveBeenCalledWith('test query');
  });

  it('should emit genreChange event with array when genre is toggled', () => {
    const spy = vi.spyOn(component.genreChange, 'emit');
    component.genres = [{ id: 1, name: 'Боевик' }, { id: 2, name: 'Комедия' }];
    component.selectedGenres = []; // Изначально ничего не выбрано
    fixture.detectChanges();

    // Находим первый чекбокс (Боевик, id: 1)
    const checkboxes = fixture.debugElement.queryAll(By.css('input[type="checkbox"]'));
    const firstCheckbox = checkboxes[0];

    // Симулируем клик/изменение (выбираем жанр)
    firstCheckbox.nativeElement.checked = true;
    firstCheckbox.triggerEventHandler('change', { target: firstCheckbox.nativeElement });

    // Должен эмитить массив с [1]
    expect(spy).toHaveBeenCalledWith([1]);
  });

  it('should emit genreChange event with removed id when unchecked', () => {
    const spy = vi.spyOn(component.genreChange, 'emit');
    component.genres = [{ id: 1, name: 'Боевик' }];
    component.selectedGenres = [1]; // Изначально выбран
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]'));

    // Симулируем снятие галочки
    checkbox.nativeElement.checked = false;
    checkbox.triggerEventHandler('change', { target: checkbox.nativeElement });

    // Должен эмитить пустой массив
    expect(spy).toHaveBeenCalledWith([]);
  });
});

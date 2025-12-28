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

  it('should display genres from input', () => {
    component.genres = [
      { id: 1, name: 'Боевик' },
      { id: 2, name: 'Комедия' },
    ];
    fixture.detectChanges();
    const options = fixture.debugElement.queryAll(By.css('select option'));
    // 1 (Все жанры) + 2 (из инпута)
    expect(options.length).toBe(3);
    expect(options[1].nativeElement.textContent).toBe('Боевик');
  });

  it('should emit searchChange event on search', () => {
    const spy = vi.spyOn(component.searchChange, 'emit');
    fixture.detectChanges();

    const searchBar = fixture.debugElement.query(By.directive(SearchBarComponent));
    searchBar.triggerEventHandler('searchChange', 'test query');

    expect(spy).toHaveBeenCalledWith('test query');
  });

  it('should emit genreChange event on genre selection', () => {
    const spy = vi.spyOn(component.genreChange, 'emit');
    component.genres = [{ id: 1, name: 'Боевик' }];
    fixture.detectChanges();

    const select = fixture.debugElement.query(By.css('select'));
    select.nativeElement.value = '1';
    select.triggerEventHandler('change', { target: select.nativeElement });

    expect(spy).toHaveBeenCalled();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent, RouterTestingModule],
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

    const checkboxLabels = fixture.debugElement.queryAll(By.css('.checkbox-label'));
    expect(checkboxLabels.length).toBe(2);
    expect(checkboxLabels[1].nativeElement.textContent).toContain('Комедия');
  });

  it('should emit genreChange event with array when genre is toggled', () => {
    const spy = vi.spyOn(component.genreChange, 'emit');
    component.genres = [{ id: 1, name: 'Боевик' }, { id: 2, name: 'Комедия' }];
    component.selectedGenres = [];
    fixture.detectChanges();

    const checkboxes = fixture.debugElement.queryAll(By.css('input[type="checkbox"]'));
    const firstCheckbox = checkboxes[0];

    firstCheckbox.nativeElement.checked = true;
    firstCheckbox.triggerEventHandler('change', { target: firstCheckbox.nativeElement });

    expect(spy).toHaveBeenCalledWith([1]);
  });

  it('should emit genreChange event with removed id when unchecked', () => {
    const spy = vi.spyOn(component.genreChange, 'emit');
    component.genres = [{ id: 1, name: 'Боевик' }];
    component.selectedGenres = [1];
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]'));

    checkbox.nativeElement.checked = false;
    checkbox.triggerEventHandler('change', { target: checkbox.nativeElement });

    expect(spy).toHaveBeenCalledWith([]);
  });
});

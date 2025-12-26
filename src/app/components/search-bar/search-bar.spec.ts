import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchBarComponent } from './search-bar.component';
import { vi } from 'vitest';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit search value after debounce time', async () => {
    const spy = vi.spyOn(component.searchChange, 'emit');
    const inputElement = fixture.nativeElement.querySelector('input');
    inputElement.value = 'Interstellar';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(spy).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('Interstellar');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not emit if value has not changed', async () => {
    const spy = vi.spyOn(component.searchChange, 'emit');
    const inputElement = fixture.nativeElement.querySelector('input');
    inputElement.value = 'Inception';
    inputElement.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    inputElement.value = 'Inception';
    inputElement.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

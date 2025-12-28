import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { InfiniteScrollDirective } from './infinite-scroll.directive';
import { By } from '@angular/platform-browser';

// --- Компонент-хост для тестирования директивы ---
@Component({
  imports: [InfiniteScrollDirective],
  standalone: true,
  template: `
    <div
      class="trigger"
      appInfiniteScroll
      [disabled]="isDisabled"
      (scrollEnd)="onScrollEnd()"
    ></div>
  `,
})
class TestHostComponent {
  isDisabled = false;
  onScrollEnd = vi.fn();
}

describe('InfiniteScrollDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let observeSpy: any;
  let disconnectSpy: any;
  let intersectionCallback: (entries: any[]) => void;

  beforeEach(async () => {
    // Мокаем IntersectionObserver перед созданием компонента
    observeSpy = vi.fn();
    disconnectSpy = vi.fn();
    intersectionCallback = () => {};

    // Создаем мок-функцию (ВАЖНО: используем function, а не стрелочную функцию, чтобы работал new)
    const MockIntersectionObserver = vi.fn(function(callback: any) {
      intersectionCallback = callback;
      return {
        observe: observeSpy,
        disconnect: disconnectSpy,
        unobserve: vi.fn(),
        takeRecords: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
      };
    });

    // Присваиваем мок глобальному объекту window
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create an instance and start observing', () => {
    fixture.detectChanges(); // ngOnInit -> ngAfterViewInit
    const directiveEl = fixture.debugElement.query(By.directive(InfiniteScrollDirective));
    expect(directiveEl).toBeTruthy();
    expect(observeSpy).toHaveBeenCalled();
  });

  it('should emit scrollEnd when intersecting and NOT disabled', () => {
    fixture.detectChanges();

    // Симулируем пересечение (isIntersecting: true)
    intersectionCallback([{ isIntersecting: true }]);

    expect(component.onScrollEnd).toHaveBeenCalled();
  });

  it('should NOT emit scrollEnd when intersecting but IS disabled', () => {
    component.isDisabled = true;
    fixture.detectChanges();

    // Симулируем пересечение
    intersectionCallback([{ isIntersecting: true }]);

    expect(component.onScrollEnd).not.toHaveBeenCalled();
  });

  it('should NOT emit scrollEnd when NOT intersecting', () => {
    fixture.detectChanges();

    // Симулируем отсутствие пересечения (выход из зоны видимости)
    intersectionCallback([{ isIntersecting: false }]);

    expect(component.onScrollEnd).not.toHaveBeenCalled();
  });

  it('should disconnect observer on destroy', () => {
    fixture.detectChanges();
    fixture.destroy(); // Уничтожаем компонент
    expect(disconnectSpy).toHaveBeenCalled();
  });
});

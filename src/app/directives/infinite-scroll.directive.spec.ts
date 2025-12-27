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
      style="height: 2000px;"
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
  let directive: InfiniteScrollDirective;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    directive = fixture.debugElement
      .query(By.directive(InfiniteScrollDirective))
      .injector.get(InfiniteScrollDirective);
  });

  // Мокаем свойства окна перед каждым тестом
  function mockWindowScroll(scrollTop: number, scrollHeight: number, innerHeight: number) {
    Object.defineProperties(document.documentElement, {
      scrollTop: { value: scrollTop, configurable: true },
      scrollHeight: { value: scrollHeight, configurable: true },
    });
    Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true });
  }

  it('should create an instance', () => {
    fixture.detectChanges(); // Инициализация View
    expect(directive).toBeTruthy();
  });

  it('should NOT emit scrollEnd event if not near the bottom', () => {
    fixture.detectChanges(); // Инициализация View
    mockWindowScroll(500, 2000, 800); // 500 + 800 = 1300. 2000 - 1300 = 700 > 500 (threshold)
    directive.onScroll();
    expect(component.onScrollEnd).not.toHaveBeenCalled();
  });

  it('should emit scrollEnd event when near the bottom', () => {
    fixture.detectChanges(); // Инициализация View
    mockWindowScroll(1300, 2000, 800); // 1300 + 800 = 2100. 2000 - 2100 = -100 < 500 (threshold)
    directive.onScroll();
    expect(component.onScrollEnd).toHaveBeenCalledTimes(1);
  });

  it('should NOT emit scrollEnd event if disabled', async () => {
    component.isDisabled = true; // Устанавливаем значение ДО первого detectChanges
    fixture.detectChanges(); // Теперь Angular инициализирует View сразу с disabled=true
    await fixture.whenStable();

    mockWindowScroll(1300, 2000, 800);
    directive.onScroll();

    expect(component.onScrollEnd).not.toHaveBeenCalled();
  });
});

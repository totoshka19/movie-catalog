import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonListComponent } from './skeleton-list.component';

describe('SkeletonListComponent', () => {
  let component: SkeletonListComponent;
  let fixture: ComponentFixture<SkeletonListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonListComponent] // Компонент является standalone
    })
      .compileComponents();

    fixture = TestBed.createComponent(SkeletonListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Тест 1: Проверяем, что компонент успешно создается.
    expect(component).toBeTruthy();
  });

  it('should render 12 skeleton cards', () => {
    // Тест 2: Проверяем, что в шаблоне отображается правильное количество
    // дочерних компонентов-скелетонов, как определено в логике компонента.
    const compiled = fixture.nativeElement as HTMLElement;
    const skeletonCards = compiled.querySelectorAll('app-skeleton-card');
    expect(skeletonCards.length).toBe(12);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbComponent } from './breadcrumb.component';
import { Breadcrumb } from '../../models/breadcrumb.model';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Импортируем сам компонент, так как он standalone,
      // и RouterTestingModule для поддержки директивы [routerLink]
      imports: [BreadcrumbComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render nothing inside the list when items array is empty', () => {
    component.items = [];
    fixture.detectChanges();
    const listItems = element.querySelectorAll('li');
    expect(listItems.length).toBe(0);
  });

  it('should render a single item as a non-link span', () => {
    const mockItems: Breadcrumb[] = [{ label: 'Главная', link: '/' }];
    component.items = mockItems;
    fixture.detectChanges();

    const listItems = element.querySelectorAll('li');
    const link = element.querySelector('a');
    const span = element.querySelector('span[aria-current="page"]');

    expect(listItems.length).toBe(1);
    expect(link).toBeNull(); // Ссылки быть не должно
    expect(span).not.toBeNull();
    expect(span?.textContent).toContain('Главная');
  });

  it('should render multiple items with links and a final non-link item', () => {
    const mockItems: Breadcrumb[] = [
      { label: 'Главная', link: '/' },
      { label: 'Фильмы', link: '/movie' },
      { label: 'Название фильма', link: '' }, // Ссылка для последнего элемента не используется
    ];
    component.items = mockItems;
    fixture.detectChanges();

    const listItems = element.querySelectorAll('li');
    const links = element.querySelectorAll('a');
    const span = element.querySelector('span[aria-current="page"]');

    // Проверяем общее количество элементов
    expect(listItems.length).toBe(3);
    expect(links.length).toBe(2); // Должно быть 2 ссылки

    // Проверяем первую ссылку
    expect(links[0].textContent).toContain('Главная');
    expect(links[0].getAttribute('href')).toBe('/');

    // Проверяем вторую ссылку
    expect(links[1].textContent).toContain('Фильмы');
    expect(links[1].getAttribute('href')).toBe('/movie');

    // Проверяем последний элемент (не-ссылку)
    expect(span).not.toBeNull();
    expect(span?.textContent).toContain('Название фильма');
  });
});

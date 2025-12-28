import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { By } from '@angular/platform-browser';
import { MediaType } from '../../core/models/media-type.enum';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;

    // Инициализируем обязательные инпуты
    fixture.componentRef.setInput('activeTab', MediaType.All);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should highlight active tab', () => {
    // Используем setInput для корректного обновления OnPush компонента
    fixture.componentRef.setInput('activeTab', MediaType.Movie);
    fixture.detectChanges();

    const activeLink = fixture.debugElement.query(By.css('a.active'));
    expect(activeLink.nativeElement.textContent).toContain('Фильмы');
  });
});

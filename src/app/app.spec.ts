import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { MoviesService } from './services/movies.service';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from './app.routes';
import { By } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

const mockMoviesService = {
  loadGenres: vi.fn().mockReturnValue(of([[], []])),
  getPopularMedia: vi.fn().mockReturnValue(of([])),
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, RouterTestingModule.withRoutes(routes)],
      providers: [{ provide: MoviesService, useValue: mockMoviesService }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should contain router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const routerOutlet = fixture.debugElement.query(By.directive(RouterOutlet));
    expect(routerOutlet).toBeTruthy();
  });
});

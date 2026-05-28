/**
 * app.component.spec.ts
 * Pruebas del componente principal.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';

describe('AppComponent', () => {

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  const routerEvents$ = new Subject<any>();

  const routerMock = {
    events: routerEvents$.asObservable(),
  };

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {

    expect(component).toBeTruthy();
  });

  it('debe tener el título SaludYa', () => {

    expect(component.title).toBe('SaludYa');
  });

  it('debe ocultar navbar en rutas públicas', () => {

    routerEvents$.next(
      new NavigationEnd(
        1,
        '/login',
        '/login'
      )
    );

    expect(component.showNavbar).toBe(false);
  });

  it('debe mostrar navbar en rutas privadas', () => {

    routerEvents$.next(
      new NavigationEnd(
        1,
        '/paciente/dashboard',
        '/paciente/dashboard'
      )
    );

    expect(component.showNavbar).toBe(true);
  });

  it('debe ocultar navbar en /registro', () => {

    routerEvents$.next(
      new NavigationEnd(
        1,
        '/registro',
        '/registro'
      )
    );

    expect(component.showNavbar).toBe(false);
  });

  it('debe ocultar navbar si la ruta comienza con una ruta pública', () => {

    routerEvents$.next(
      new NavigationEnd(
        1,
        '/verificar-reset/token',
        '/verificar-reset/token'
      )
    );

    expect(component.showNavbar).toBe(false);
  });

  it('debe ignorar eventos que no sean NavigationEnd', () => {

    component.showNavbar = true;

    routerEvents$.next({
      type: 'fake-event',
    });

    expect(component.showNavbar).toBe(true);
  });
});
/**
 * auth.guard.spec.ts
 * Pruebas del guard de autenticación.
 */

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';

import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  GuardResult,
  MaybeAsync,
} from '@angular/router';

const routerMock = {
  navigate: jest.fn(),
};

describe('authGuard', () => {

  let estaLogueadoSignal: WritableSignal<boolean>;

  beforeEach(() => {

    routerMock.navigate.mockClear();

    estaLogueadoSignal = signal(false);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: AuthService,
          useValue: {
            estaLogueado: estaLogueadoSignal,
          },
        },
      ],
    });
  });

  function runGuard(): MaybeAsync<GuardResult> {
    return TestBed.runInInjectionContext(() => {
      return authGuard(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      );
    });
  }

  it('debe permitir acceso si el usuario está logueado', () => {

    estaLogueadoSignal.set(true);
    const resultado = runGuard();

    expect(resultado).toBe(true);
  });

  it('debe redirigir a /login si el usuario no está logueado', () => {

    estaLogueadoSignal.set(false);
    const resultado = runGuard();

    expect(resultado).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
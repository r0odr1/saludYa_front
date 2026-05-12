/**
 * auth.service.spec.ts
 * Pruebas del servicio de autenticación.
 * Usa HttpClientTestingModule para interceptar peticiones HTTP
 * sin hacer llamadas reales al backend.
 */

import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

// Mock del Router para no necesitar rutas reales
const routerMock = { navigate: jest.fn() };

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Limpiar localStorage entre pruebas
    localStorage.clear();
    routerMock.navigate.mockClear();
  });

  afterEach(() => {
    // Verificar que no haya peticiones HTTP pendientes
    httpMock.verify();
  });

  /** ESTADO INICIAL */
  describe('Estado inicial', () => {
    it('debe crearse correctamente', () => {
      expect(service).toBeTruthy();
    });
  });
});

/**
 * token.interceptor.spec.ts
 * Pruebas del interceptor JWT.
 */

import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { tokenInterceptor } from './token.interceptor';
import { AuthService } from '../services/auth.service';

describe('tokenInterceptor', () => {

  let http: HttpClient;
  let httpMock: HttpTestingController;

  const authServiceMock = {
    obtenerToken: jest.fn(),
    logout: jest.fn(),
  };

  const routerMock = {
    navigate: jest.fn(),
  };

  beforeEach(() => {

    authServiceMock.obtenerToken.mockReset();
    authServiceMock.logout.mockReset();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([tokenInterceptor])
        ),
        provideHttpClientTesting(),

        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe agregar Authorization si existe token', () => {

    authServiceMock.obtenerToken.mockReturnValue('jwt-token');

    http.get('/api/citas').subscribe();

    const req = httpMock.expectOne('/api/citas');

    expect(req.request.headers.get('Authorization'))
      .toBe('Bearer jwt-token');

    req.flush({});
  });

  it('no debe agregar Authorization en rutas /auth/', () => {

    authServiceMock.obtenerToken.mockReturnValue('jwt-token');

    http.post('/auth/login', {}).subscribe();

    const req = httpMock.expectOne('/auth/login');

    expect(req.request.headers.has('Authorization'))
      .toBe(false);

    req.flush({});
  });

  it('no debe agregar Authorization si no hay token', () => {

    authServiceMock.obtenerToken.mockReturnValue(null);

    http.get('/api/citas').subscribe();

    const req = httpMock.expectOne('/api/citas');

    expect(req.request.headers.has('Authorization'))
      .toBe(false);

    req.flush({});
  });

  it('debe ejecutar logout si responde 401', () => {

    authServiceMock.obtenerToken.mockReturnValue('jwt-token');

    http.get('/api/protegido').subscribe({
      next: () => fail('debió fallar'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
      },
    });

    const req = httpMock.expectOne('/api/protegido');

    req.flush(
      { mensaje: 'No autorizado' },
      {
        status: 401,
        statusText: 'Unauthorized',
      }
    );

    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('no debe ejecutar logout para errores distintos de 401', () => {

    authServiceMock.obtenerToken.mockReturnValue('jwt-token');

    http.get('/api/error').subscribe({
      error: () => {},
    });

    const req = httpMock.expectOne('/api/error');

    req.flush(
      { mensaje: 'Error interno' },
      {
        status: 500,
        statusText: 'Server Error',
      }
    );

    expect(authServiceMock.logout).not.toHaveBeenCalled();
  });
});
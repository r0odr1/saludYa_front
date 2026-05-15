/**
 * auth.service.spec.ts
 * Pruebas unitarias del servicio de autenticación.
 */

import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

// Mock del Router
const routerMock = {
  navigate: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/auth`;

  // Setup
  beforeEach(() => {
    localStorage.clear();
    routerMock.navigate.mockClear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // Estado inicial
  describe('Estado inicial', () => {
    it('debe crearse correctamente', () => {
      expect(service).toBeTruthy();
    });

    it('no debe estar logueado al inicio', () => {
      expect(service.estaLogueado()).toBe(false);
    });

    it('el usuario inicial debe ser null', () => {
      expect(service.usuario()).toBeNull();
    });

    it('el email pendiente inicial debe estar vacío', () => {
      expect(service.emailPendiente()).toBe('');
    });
  });

  // Registro
  describe('registro()', () => {
    it('debe hacer POST a /auth/registro', () => {
      const datos = {
        nombre: 'Juan',
        email: 'juan@test.com',
        password: 'Test1234!',
        telefono: '3001234567',
      };

      service.registro(datos).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/registro`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(datos);

      req.flush({
        requiereVerificacion: true,
        email: 'juan@test.com',
      });
    });

    it('debe guardar email pendiente', () => {
      service.registro({
        nombre: 'Juan',
        email: 'juan@test.com',
        password: 'Test1234!',
        telefono: '3001234567',
      }).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/registro`);

      req.flush({
        requiereVerificacion: true,
        email: 'juan@test.com',
      });

      expect(service.emailPendiente()).toBe('juan@test.com');
    });
  });

  // VerificarCuenta
  describe('verificarCuenta()', () => {
    it('debe hacer POST a /auth/verificar-cuenta', () => {
      service.verificarCuenta('test@test.com', '123456').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/verificar-cuenta`);

      expect(req.request.method).toBe('POST');

      expect(req.request.body).toEqual({
        email: 'test@test.com',
        codigo: '123456',
      });

      req.flush({
        token: 'jwt-token',
        usuario: {
          _id: '1',
          nombre: 'Juan',
          email: 'test@test.com',
          telefono: '300',
          rol: 'paciente',
          cuentaVerificada: true,
        },
      });
    });

    it('debe guardar sesión tras verificación exitosa', () => {
      const usuarioMock = {
        _id: '1',
        nombre: 'Juan',
        email: 'juan@test.com',
        telefono: '3001234567',
        rol: 'paciente' as const,
        cuentaVerificada: true,
      };

      service
        .verificarCuenta('juan@test.com', '123456')
        .subscribe();

      const req = httpMock.expectOne(`${apiUrl}/verificar-cuenta`);

      req.flush({
        token: 'jwt-token-test',
        usuario: usuarioMock,
      });

      expect(service.estaLogueado()).toBe(true);

      expect(service.usuario()?.email).toBe('juan@test.com');

      expect(localStorage.getItem('sy_token')).toBe('jwt-token-test');
    });
  });

  // ReenviarCodigo
  describe('reenviarCodigo()', () => {
    it('debe hacer POST a /auth/reenviar-codigo', () => {
      service.reenviarCodigo('test@test.com').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/reenviar-codigo`);

      expect(req.request.method).toBe('POST');

      expect(req.request.body).toEqual({email: 'test@test.com'});

      req.flush({mensaje: 'Código reenviado'});
    });
  });

  // Login
  describe('login()', () => {
    it('debe hacer POST a /auth/login', () => {
      service.login('test@test.com', 'Test1234!').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/login`);

      expect(req.request.method).toBe('POST');

      expect(req.request.body).toEqual({
        email: 'test@test.com',
        password: 'Test1234!',
      });

      req.flush({
        token: 'jwt',
        usuario: {
          _id: '1',
          nombre: 'Juan',
          email: 'test@test.com',
          telefono: '300',
          rol: 'paciente',
          cuentaVerificada: true,
        },
      });
    });

    it('debe actualizar usuario tras login exitoso', () => {
      const usuarioMock = {
        _id: '1',
        nombre: 'Ana',
        email: 'ana@test.com',
        telefono: '3001234567',
        rol: 'paciente' as const,
        cuentaVerificada: true,
      };

      service.login('ana@test.com', 'Test1234!').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/login`);

      req.flush({
        token: 'abc',
        usuario: usuarioMock,
      });

      expect(service.usuario()?.nombre).toBe('Ana');
      expect(service.estaLogueado()).toBe(true);
    });

    it('debe guardar email pendiente si requiere verificación', () => {
      service.login('test@test.com', 'Test1234!').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/login`);

      req.flush({
        requiereVerificacion: true,
        email: 'test@test.com',
      });

      expect(service.emailPendiente()).toBe('test@test.com');
    });
  });

  // SolicitarReset
  describe('solicitarReset()', () => {
    it('debe hacer POST a /auth/solicitar-reset', () => {
      service.solicitarReset('test@test.com').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/solicitar-reset`);

      expect(req.request.method).toBe('POST');

      expect(req.request.body).toEqual({email: 'test@test.com'});

      req.flush({
        mensaje: 'Correo enviado',
        email: 'test@test.com',
      });
    });

    it('debe guardar email pendiente', () => {
      service.solicitarReset('test@test.com').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/solicitar-reset`);

      req.flush({
        mensaje: 'Correo enviado',
        email: 'test@test.com',
      });

      expect(service.emailPendiente()).toBe('test@test.com');
    });
  });

  // VerificarReset
  describe('verificarReset()', () => {
    it('debe hacer POST a /auth/verificar-reset', () => {
      service
        .verificarReset('test@test.com', '123456')
        .subscribe();

      const req = httpMock.expectOne(`${apiUrl}/verificar-reset`);

      expect(req.request.method).toBe('POST');

      expect(req.request.body).toEqual({
        email: 'test@test.com',
        codigo: '123456',
      });

      req.flush({
        mensaje: 'Código válido',
        resetToken: 'reset-token',
      });
    });
  });

  // NuevaContrasena
  describe('nuevaContrasena()', () => {
    it('debe hacer POST a /auth/nueva-contrasena', () => {
      service
        .nuevaContrasena('reset-token', 'Nueva123!')
        .subscribe();

      const req = httpMock.expectOne(`${apiUrl}/nueva-contrasena`);

      expect(req.request.method).toBe('POST');

      expect(req.request.body).toEqual({
        resetToken: 'reset-token',
        nuevaPassword: 'Nueva123!',
      });

      req.flush({mensaje: 'Contraseña actualizada'});
    });
  });

  // ActualizarPerfil
  describe('actualizarPerfil()', () => {
    it('debe hacer PUT a /auth/perfil', () => {
      service
        .actualizarPerfil({
          nombre: 'Nuevo',
          telefono: '3111111111',
        })
        .subscribe();

      const req = httpMock.expectOne(`${apiUrl}/perfil`);

      expect(req.request.method).toBe('PUT');

      expect(req.request.body).toEqual({
        nombre: 'Nuevo',
        telefono: '3111111111',
      });

      req.flush({
        usuario: {
          nombre: 'Nuevo',
          telefono: '3111111111',
        },
      });
    });
  });

  // CambiarContrasena
  describe('cambiarContrasena()', () => {
    it('debe hacer PUT a /auth/cambiar-contrasena', () => {
      service
        .cambiarContrasena(
          'Actual123!',
          'Nueva456!'
        )
        .subscribe();

      const req = httpMock.expectOne(`${apiUrl}/cambiar-contrasena`);

      expect(req.request.method).toBe('PUT');

      expect(req.request.body).toEqual({
        contrasenaActual: 'Actual123!',
        nuevaContrasena: 'Nueva456!',
      });

      req.flush({ mensaje: 'Contraseña cambiada' });
    });
  });

  // Logout
  describe('logout()', () => {
    it('debe limpiar sesión y redirigir al login', () => {
      localStorage.setItem('sy_token', 'token-test');

      localStorage.setItem('sy_usuario', JSON.stringify({
          _id: '1',
          nombre: 'Juan',
          email: 'juan@test.com',
          telefono: '300',
          rol: 'paciente',
          cuentaVerificada: true,
        })
      );

      service.logout();

      expect(localStorage.getItem('sy_token')).toBeNull();

      expect(localStorage.getItem('sy_usuario')).toBeNull();

      expect(service.usuario()).toBeNull();

      expect(service.estaLogueado()).toBe(false);

      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  // Helpers
  describe('Helpers de rol', () => {
    it('estaLogueado() debe retornar false sin token', () => {
      expect(service.estaLogueado()).toBe(false);
    });

    it('esPaciente() debe retornar true', () => {
      localStorage.setItem('sy_token', 'token');

      localStorage.setItem('sy_usuario', JSON.stringify({
          _id: '1',
          nombre: 'Juan',
          email: 'juan@test.com',
          telefono: '300',
          rol: 'paciente',
          cuentaVerificada: true,
        })
      );

      TestBed.resetTestingModule();

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          AuthService,
          {
            provide: Router,
            useValue: routerMock,
          },
        ],
      });

      const nuevoService = TestBed.inject(AuthService);

      expect(nuevoService.esPaciente()).toBe(true);
    });

    it('obtenerToken() debe retornar null inicialmente', () => {
      expect(service.obtenerToken()).toBeNull();
    });

    it('setEmailPendiente() debe actualizar email pendiente', () => {
      service.setEmailPendiente('test@test.com');

      expect(service.emailPendiente()).toBe('test@test.com');
    });
  });

  // RedirigirPorRol
  describe('redirigirPorRol()', () => {
    it('debe redirigir a dashboard paciente', () => {
      localStorage.setItem('sy_token', 'token');

      localStorage.setItem('sy_usuario', JSON.stringify({
          _id: '1',
          nombre: 'Juan',
          email: 'juan@test.com',
          telefono: '300',
          rol: 'paciente',
          cuentaVerificada: true,
        })
      );

      TestBed.resetTestingModule();

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          AuthService,
          {
            provide: Router,
            useValue: routerMock,
          },
        ],
      });

      const nuevoService = TestBed.inject(AuthService);

      nuevoService.redirigirPorRol();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/paciente/dashboard']);
    });
  });
});
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { NuevaContrasenaComponent } from './nueva-contrasena.component';
import { AuthService } from '../../services/auth.service';

describe('NuevaContrasenaComponent', () => {
  let component: NuevaContrasenaComponent;
  let fixture: ComponentFixture<NuevaContrasenaComponent>;

  let authServiceMock: {
    nuevaContrasena: jest.Mock;
  };

  let routerMock: {
    navigate: jest.Mock;
  };

  beforeEach(async () => {
    authServiceMock = {
      nuevaContrasena: jest.fn(),
    };

    routerMock = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NuevaContrasenaComponent],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ token: 'token-test' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevaContrasenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debe obtener el token desde query params', () => {
      expect(component.resetToken).toBe('token-test');
    });

    it('debe redirigir si no existe token', async () => {
      await TestBed.resetTestingModule();

      await TestBed.configureTestingModule({
        imports: [NuevaContrasenaComponent],
        providers: [
          {
            provide: AuthService,
            useValue: authServiceMock,
          },
          {
            provide: Router,
            useValue: routerMock,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              queryParams: of({}),
            },
          },
        ],
      }).compileComponents();

      const fixture2 = TestBed.createComponent(
        NuevaContrasenaComponent,
      );

      fixture2.detectChanges();

      expect(routerMock.navigate).toHaveBeenCalledWith([
        '/solicitar-reset',
      ]);
    });
  });

  describe('getters', () => {
    it('debe validar mayúsculas', () => {
      component.nuevaPassword = 'Password1';

      expect(component.tieneUpper).toBe(true);
    });

    it('debe validar números', () => {
      component.nuevaPassword = 'Password1';

      expect(component.tieneNumero).toBe(true);
    });

    it('debe validar coincidencia de contraseñas', () => {
      component.nuevaPassword = 'Password1';
      component.confirmarPassword = 'Password1';

      expect(component.passwordsCoinciden).toBe(true);
    });

    it('debe validar formulario correcto', () => {
      component.nuevaPassword = 'Password1';
      component.confirmarPassword = 'Password1';

      expect(component.formularioValido).toBe(true);
    });

    it('debe detectar formulario inválido', () => {
      component.nuevaPassword = 'abc';
      component.confirmarPassword = 'abc';

      expect(component.formularioValido).toBe(false);
    });

    it('debe detectar cuando las contraseñas no coinciden', () => {
      component.nuevaPassword = 'Password1';
      component.confirmarPassword = 'Password2';

      expect(component.passwordsCoinciden).toBe(false);
    });

    it('debe detectar ausencia de mayúsculas', () => {
      component.nuevaPassword = 'password1';

      expect(component.tieneUpper).toBe(false);
    });

    it('debe detectar ausencia de números', () => {
      component.nuevaPassword = 'Password';

      expect(component.tieneNumero).toBe(false);
    });
  });

  describe('cambiarContrasena', () => {
    beforeEach(() => {
      component.nuevaPassword = 'Password1';
      component.confirmarPassword = 'Password1';
    });

    it('no debe llamar el servicio si el formulario es inválido', () => {
      component.nuevaPassword = '123';
      component.confirmarPassword = '123';

      component.cambiarContrasena();

      expect(authServiceMock.nuevaContrasena).not.toHaveBeenCalled();
    });

    it('debe cambiar la contraseña exitosamente', () => {
      authServiceMock.nuevaContrasena.mockReturnValue(of({}));

      component.cambiarContrasena();

      expect(authServiceMock.nuevaContrasena).toHaveBeenCalledWith(
        'token-test',
        'Password1',
      );

      expect(component.cargando).toBe(false);
      expect(component.exitoso).toBe(true);
    });

    it('debe manejar error enviado por backend', () => {
      authServiceMock.nuevaContrasena.mockReturnValue(
        throwError(() => ({
          error: {
            mensaje: 'Token inválido',
          },
        })),
      );

      component.cambiarContrasena();

      expect(component.cargando).toBe(false);
      expect(component.error).toBe('Token inválido');
    });

    it('debe usar mensaje por defecto cuando no existe mensaje backend', () => {
      authServiceMock.nuevaContrasena.mockReturnValue(
        throwError(() => ({})),
      );

      component.cambiarContrasena();

      expect(component.error).toContain(
        'Error al cambiar contraseña',
      );
    });
  });

  describe('redirección automática', () => {
    beforeEach(() => {
      component.nuevaPassword = 'Password1';
      component.confirmarPassword = 'Password1';
    });

    it('debe iniciar contador después del éxito', () => {
      authServiceMock.nuevaContrasena.mockReturnValue(of({}));

      component.cambiarContrasena();

      expect(component.exitoso).toBe(true);
      expect(component.contadorRedireccion).toBe(10);
      expect(component.progresoRedireccion).toBe(0);
    });

    it('debe actualizar contador y progreso', fakeAsync(() => {
      authServiceMock.nuevaContrasena.mockReturnValue(of({}));

      component.cambiarContrasena();

      tick(1000);

      expect(component.contadorRedireccion).toBe(9);
      expect(component.progresoRedireccion).toBe(10);
    }));

    it('debe redirigir al login al terminar el contador', fakeAsync(() => {
      authServiceMock.nuevaContrasena.mockReturnValue(of({}));

      component.cambiarContrasena();

      tick(10000);

      expect(routerMock.navigate).toHaveBeenCalledWith([
        '/login',
      ]);
    }));
  });

  describe('irAlLogin', () => {
    it('debe navegar al login', () => {
      component.irAlLogin();

      expect(routerMock.navigate).toHaveBeenCalledWith([
        '/login',
      ]);
    });

    it('debe limpiar intervalo activo', () => {
      component['redireccionInterval'] = setInterval(() => {}, 1000);

      const clearSpy = jest.spyOn(global, 'clearInterval');

      component.irAlLogin();

      expect(clearSpy).toHaveBeenCalled();

      clearSpy.mockRestore();
    });
  });

  describe('ngOnDestroy', () => {
    it('debe limpiar intervalo activo al destruir componente', () => {
      component['redireccionInterval'] = setInterval(() => {}, 1000);

      const clearSpy = jest.spyOn(global, 'clearInterval');

      component.ngOnDestroy();

      expect(clearSpy).toHaveBeenCalled();

      clearSpy.mockRestore();
    });

    it('no debe fallar si no existe intervalo', () => {
      component['redireccionInterval'] = null;

      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  const authMock = {
    estaLogueado: jest.fn(),
    redirigirPorRol: jest.fn(),
    login: jest.fn(),
    setEmailPendiente: jest.fn(),
  };

  const routerMock = {
    navigate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    authMock.estaLogueado.mockReturnValue(false);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authMock,
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);

    jest
    .spyOn(router, 'navigate')
    .mockResolvedValue(true);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debe redirigir si ya está logueado', () => {
      authMock.estaLogueado.mockReturnValue(true);

      component.ngOnInit();

      expect(authMock.redirigirPorRol).toHaveBeenCalled();
    });

    it('no debe redirigir si no está logueado', () => {
      authMock.estaLogueado.mockReturnValue(false);

      component.ngOnInit();

      expect(authMock.redirigirPorRol).not.toHaveBeenCalled();
    });
  });

  describe('onLogin', () => {
    it('debe mostrar error si email está vacío', () => {
      component.email = '';
      component.password = '123456';

      component.onLogin();

      expect(component.error).toBe(
        'Ingresa tu correo y contraseña.'
      );

      expect(authMock.login).not.toHaveBeenCalled();
    });

    it('debe mostrar error si password está vacío', () => {
      component.email = 'test@test.com';
      component.password = '';

      component.onLogin();

      expect(component.error).toBe(
        'Ingresa tu correo y contraseña.'
      );

      expect(authMock.login).not.toHaveBeenCalled();
    });

    it('debe llamar login correctamente', () => {
      authMock.login.mockReturnValue(
        of({
          token: 'token',
          usuario: { id: 1 },
        })
      );

      component.email = 'test@test.com';
      component.password = '123456';

      component.onLogin();

      expect(authMock.login).toHaveBeenCalledWith(
        'test@test.com',
        '123456'
      );
    });

    it('debe redirigir a verificar cuenta cuando requiere verificación', () => {
      authMock.login.mockReturnValue(
        of({
          requiereVerificacion: true,
        })
      );

      component.email = 'test@test.com';
      component.password = '123456';

      component.onLogin();

      expect(router.navigate).toHaveBeenCalledWith([
        '/verificar-cuenta',
      ]);

      expect(component.cargando).toBe(false);
    });

    it('debe redirigir por rol cuando recibe token y usuario', () => {
      authMock.login.mockReturnValue(
        of({
          token: 'token',
          usuario: {
            id: 1,
            nombre: 'Juan',
          },
        })
      );

      component.email = 'test@test.com';
      component.password = '123456';

      component.onLogin();

      expect(authMock.redirigirPorRol).toHaveBeenCalled();

      expect(component.cargando).toBe(false);
    });

    it('debe mostrar error cuando la respuesta es inválida', () => {
      authMock.login.mockReturnValue(
        of({})
      );

      component.email = 'test@test.com';
      component.password = '123456';

      component.onLogin();

      expect(component.error).toBe(
        'Respuesta inválida del servidor. Intenta de nuevo.'
      );

      expect(component.cargando).toBe(false);
    });

    it('debe guardar email y redirigir cuando backend responde 403 con requiereVerificacion', () => {
      authMock.login.mockReturnValue(
        throwError(() => ({
          status: 403,
          error: {
            requiereVerificacion: true,
            email: 'test@test.com',
          },
        }))
      );

      component.email = 'test@test.com';
      component.password = '123456';

      component.onLogin();

      expect(
        authMock.setEmailPendiente
      ).toHaveBeenCalledWith('test@test.com');

      expect(router.navigate).toHaveBeenCalledWith([
        '/verificar-cuenta',
      ]);

      expect(component.cargando).toBe(false);
    });

    it('debe mostrar mensaje del backend cuando ocurre error', () => {
      authMock.login.mockReturnValue(
        throwError(() => ({
          status: 400,
          error: {
            mensaje: 'Credenciales inválidas',
          },
        }))
      );

      component.email = 'test@test.com';
      component.password = '123456';

      component.onLogin();

      expect(component.error).toBe(
        'Credenciales inválidas'
      );

      expect(component.cargando).toBe(false);
    });

    it('debe mostrar mensaje por defecto cuando error no tiene mensaje', () => {
      authMock.login.mockReturnValue(
        throwError(() => ({
          status: 500,
          error: {},
        }))
      );

      component.email = 'test@test.com';
      component.password = '123456';

      component.onLogin();

      expect(component.error).toBe(
        'Error al iniciar sesión.'
      );

      expect(component.cargando).toBe(false);
    });
  });
});
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { VerificarCuentaComponent } from './verificar-cuenta.component';
import { AuthService } from '../../services/auth.service';

describe('VerificarCuentaComponent', () => {
  let component: VerificarCuentaComponent;
  let fixture: ComponentFixture<VerificarCuentaComponent>;
  let router: Router;

  const authMock = {
    emailPendiente: jest.fn(),
    verificarCuenta: jest.fn(),
    reenviarCodigo: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    authMock.emailPendiente.mockReturnValue(
      'test@test.com'
    );

    await TestBed.configureTestingModule({
      imports: [VerificarCuentaComponent],
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

    fixture =
      TestBed.createComponent(
        VerificarCuentaComponent
      );

    component = fixture.componentInstance;

    fixture.detectChanges();

    (component as any).digitInputs = {
      toArray: () => [],
    };
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debe cargar email pendiente', () => {
      expect(component.email).toBe(
        'test@test.com'
      );
    });

    it('debe redirigir si no existe email', () => {
      authMock.emailPendiente.mockReturnValue('');

      const fixtureNueva =
        TestBed.createComponent(
          VerificarCuentaComponent
        );

      fixtureNueva.detectChanges();

      expect(
        router.navigate
      ).toHaveBeenCalledWith([
        '/login',
      ]);
    });
  });

  describe('codigoCompleto', () => {
    it('debe retornar el código unido', () => {
      component.digitos = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
      ];

      expect(
        component.codigoCompleto
      ).toBe('123456');
    });
  });

  describe('trackByIndex', () => {
    it('debe retornar el índice', () => {
      expect(
        component.trackByIndex(5)
      ).toBe(5);
    });
  });

  describe('verificar', () => {
    beforeEach(() => {
      (component as any).digitInputs = {
        toArray: () => [],
      };
    });

    it('no debe verificar si el código es incompleto', () => {
      component.digitos = ['1'];

      component.verificar();

      expect(
        authMock.verificarCuenta
      ).not.toHaveBeenCalled();
    });

    it('debe verificar correctamente', () => {
      authMock.verificarCuenta.mockReturnValue(
        of({})
      );

      const spy = jest.spyOn(
        component as any,
        'iniciarRedireccion'
      );

      component.digitos = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
      ];

      component.verificar();

      expect(
        authMock.verificarCuenta
      ).toHaveBeenCalledWith(
        'test@test.com',
        '123456'
      );

      expect(
        component.verificado
      ).toBe(true);

      expect(spy).toHaveBeenCalled();
    });

    it('debe mostrar error del backend', () => {
      authMock.verificarCuenta.mockReturnValue(
        throwError(() => ({
          error: {
            mensaje: 'Código inválido',
          },
        }))
      );

      component.digitos = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
      ];

      component.verificar();

      expect(component.error).toBe(
        'Código inválido'
      );
    });

    it('debe usar mensaje por defecto al fallar', () => {
      authMock.verificarCuenta.mockReturnValue(
        throwError(() => ({}))
      );

      component.digitos = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
      ];

      component.verificar();

      expect(component.error).toBe(
        'Código incorrecto.'
      );
    });

    it('debe limpiar los inputs luego del error', fakeAsync(() => {
      authMock.verificarCuenta.mockReturnValue(
        throwError(() => ({
          error: {
            mensaje: 'Error',
          },
        }))
      );

      component.digitos = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
      ];

      component.verificar();

      tick(600);

      expect(component.digitos).toEqual([
        '',
        '',
        '',
        '',
        '',
        '',
      ]);

      expect(
        component.mostrarError
      ).toBe(false);
    }));
  });

  describe('reenviar', () => {
    it('debe reenviar correctamente', () => {
      authMock.reenviarCodigo.mockReturnValue(
        of({})
      );

      component.reenviar();

      expect(
        authMock.reenviarCodigo
      ).toHaveBeenCalledWith(
        'test@test.com'
      );

      expect(component.exito).toBe(
        'Nuevo código enviado a tu correo.'
      );

      expect(component.cooldown).toBe(60);
    });

    it('debe mostrar error del backend', () => {
      authMock.reenviarCodigo.mockReturnValue(
        throwError(() => ({
          error: {
            mensaje: 'Error backend',
          },
        }))
      );

      component.reenviar();

      expect(component.error).toBe(
        'Error backend'
      );
    });

    it('debe usar mensaje por defecto', () => {
      authMock.reenviarCodigo.mockReturnValue(
        throwError(() => ({}))
      );

      component.reenviar();

      expect(component.error).toBe(
        'Error al reenviar código.'
      );
    });

    it('debe limpiar mensaje de éxito después de 4 segundos', fakeAsync(() => {
      authMock.reenviarCodigo.mockReturnValue(
        of({})
      );

      component.reenviar();

      tick(4000);

      expect(component.exito).toBe('');
    }));

    it('debe disminuir cooldown', fakeAsync(() => {
      authMock.reenviarCodigo.mockReturnValue(
        of({})
      );

      component.reenviar();

      tick(1000);

      expect(component.cooldown).toBe(59);
    }));
  });

  describe('irAlInicio', () => {
    it('debe ejecutar logout', () => {
      component.irAlInicio();

      expect(
        authMock.logout
      ).toHaveBeenCalled();
    });
  });

  describe('redirección automática', () => {
    it('debe iniciar valores de redirección', () => {
      (component as any).iniciarRedireccion();

      expect(
        component.contadorRedireccion
      ).toBe(10);

      expect(
        component.progresoRedireccion
      ).toBe(0);
    });
  });

  describe('ngOnDestroy', () => {
    it('debe limpiar intervalos', () => {
      const clearSpy = jest.spyOn(
        window,
        'clearInterval'
      );

      (component as any).redireccionInterval =
        setInterval(() => {}, 1000);

      component.ngOnDestroy();

      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('onDigitInput', () => {
    beforeEach(() => {
      const focus = jest.fn();

      (component as any).digitInputs = {
        toArray: () => [
          { nativeElement: { focus } },
          { nativeElement: { focus } },
          { nativeElement: { focus } },
          { nativeElement: { focus } },
          { nativeElement: { focus } },
          { nativeElement: { focus } },
        ],
      };
    });

    it('debe guardar solo números', () => {
      const event = {
        target: {
          value: 'a5b',
        },
      } as any;

      component.onDigitInput(event, 0);

      expect(component.digitos[0]).toBe('5');
      expect(event.target.value).toBe('5');
    });

    it('debe enfocar el siguiente input', () => {
      const focus = jest.fn();

      (component as any).digitInputs = {
        toArray: () => [
          { nativeElement: { focus: jest.fn() } },
          { nativeElement: { focus } },
        ],
      };

      const event = {
        target: {
          value: '1',
        },
      } as any;

      component.onDigitInput(event, 0);

      expect(focus).toHaveBeenCalled();
    });

    it('debe ejecutar verificar cuando hay 6 dígitos', () => {
      const spy = jest.spyOn(
        component,
        'verificar'
      );

      component.digitos = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '',
      ];

      const event = {
        target: {
          value: '6',
        },
      } as any;

      component.onDigitInput(event, 5);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onKeyDown', () => {
    it('debe enfocar el input anterior al presionar backspace', () => {
      const focus = jest.fn();

      (component as any).digitInputs = {
        toArray: () => [
          { nativeElement: { focus } },
          { nativeElement: { focus: jest.fn() } },
        ],
      };

      component.digitos = ['', ''];

      component.onKeyDown(
        {
          key: 'Backspace',
        } as KeyboardEvent,
        1
      );

      expect(focus).toHaveBeenCalled();
    });

    it('no debe hacer nada si no es backspace', () => {
      const focus = jest.fn();

      (component as any).digitInputs = {
        toArray: () => [
          { nativeElement: { focus } },
        ],
      };

      component.onKeyDown(
        {
          key: 'A',
        } as KeyboardEvent,
        0
      );

      expect(focus).not.toHaveBeenCalled();
    });
  });

  describe('onPaste', () => {
    it('debe llenar los dígitos pegados', fakeAsync(() => {
      const focus = jest.fn();

      (component as any).digitInputs = {
        toArray: () =>
          Array.from({ length: 6 }, () => ({
            nativeElement: {
              value: '',
              focus,
            },
          })),
      };

      const preventDefault = jest.fn();

      const event = {
        preventDefault,
        clipboardData: {
          getData: () => '123456',
        },
      } as any;

      component.onPaste(event);

      tick();

      expect(preventDefault).toHaveBeenCalled();

      expect(component.digitos).toEqual([
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
      ]);
    }));

    it('debe ignorar caracteres no numéricos', fakeAsync(() => {
      (component as any).digitInputs = {
        toArray: () =>
          Array.from({ length: 6 }, () => ({
            nativeElement: {
              value: '',
              focus: jest.fn(),
            },
          })),
      };

      const event = {
        preventDefault: jest.fn(),
        clipboardData: {
          getData: () => '12a3b4',
        },
      } as any;

      component.onPaste(event);

      tick();

      expect(component.digitos).toEqual([
        '1',
        '2',
        '3',
        '4',
        '',
        '',
      ]);
    }));

    it('no debe hacer nada si el texto pegado está vacío', () => {
      const event = {
        preventDefault: jest.fn(),
        clipboardData: {
          getData: () => '',
        },
      } as any;

      component.onPaste(event);

      expect(component.digitos).toEqual([
        '',
        '',
        '',
        '',
        '',
        '',
      ]);
    });
  });
});
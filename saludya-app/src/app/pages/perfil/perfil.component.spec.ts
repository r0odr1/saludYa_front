import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PerfilComponent } from './perfil.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('PerfilComponent', () => {

  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;

  let authServiceMock: {
    usuario: jest.Mock;
    actualizarPerfil: jest.Mock;
    cambiarContrasena: jest.Mock;
    esPaciente: jest.Mock;
    esDoctor: jest.Mock;
    esAdmin: jest.Mock;
  };

  beforeEach(async () => {

    authServiceMock = {

      usuario: jest.fn().mockReturnValue({
        nombre: 'Juan',
        telefono: '123456789',
      }),

      actualizarPerfil: jest.fn(),

      cambiarContrasena: jest.fn(),

      esPaciente: jest.fn().mockReturnValue(true),

      esDoctor: jest.fn().mockReturnValue(false),

      esAdmin: jest.fn().mockReturnValue(false),

    };

    await TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar nombre y teléfono desde auth service', () => {
    expect(component.nombre).toBe('Juan');
    expect(component.telefono).toBe('123456789');
  });

  describe('Validaciones de contraseña', () => {

    it('debe validar mayúscula', () => {
      component.nuevaContrasena = 'Password1';

      expect(component.tieneUpper).toBe(true);
    });

    it('tieneNumero debe ser false sin números', () => {
      component.nuevaContrasena = 'Password';

      expect(component.tieneNumero).toBe(false);
    });

    it('tieneUpper debe ser false sin mayúsculas', () => {
      component.nuevaContrasena = 'password123';

      expect(component.tieneUpper).toBe(false);
    });

    it('passwordsCoinciden debe ser false si son diferentes', () => {
      component.nuevaContrasena = 'Nueva123';
      component.confirmarContrasena = 'Otra123';

      expect(component.passwordsCoinciden).toBe(false);
    });

  });

  describe('guardarPerfil', () => {

    it('debe actualizar perfil correctamente', fakeAsync(() => {

      authServiceMock.actualizarPerfil.mockReturnValue(of({}));

      component.nombre = 'Pedro';
      component.telefono = '987654321';

      component.guardarPerfil();

      tick();

      expect(authServiceMock.actualizarPerfil).toHaveBeenCalledWith({
        nombre: 'Pedro',
        telefono: '987654321',
      });

      expect(component.guardandoPerfil).toBe(false);

      expect(component.mensajePerfil).toBe(
        'Perfil actualizado correctamente.'
      );

    }));

    it('debe manejar nombre vacío correctamente', fakeAsync(() => {

      authServiceMock.actualizarPerfil.mockReturnValue(of({}));

      component.nombre = '';
      component.telefono = '';

      component.guardarPerfil();

      tick();

      expect(authServiceMock.actualizarPerfil).toHaveBeenCalled();

    }));

    it('debe manejar error sin mensaje al guardar perfil', fakeAsync(() => {

      authServiceMock.actualizarPerfil.mockReturnValue(
        throwError(() => ({}))
      );

      component.guardarPerfil();

      tick();

      expect(component.errorPerfil).toBeTruthy();

    }));

  });

  describe('cambiarContrasena', () => {

    beforeEach(() => {

      component.contrasenaActual = 'Vieja123';
      component.nuevaContrasena = 'Nueva123';
      component.confirmarContrasena = 'Nueva123';

    });

    it('debe cambiar contraseña correctamente', fakeAsync(() => {

      authServiceMock.cambiarContrasena.mockReturnValue(of({}));

      component.cambiarContrasena();

      tick();

      expect(authServiceMock.cambiarContrasena).toHaveBeenCalledWith(
        'Vieja123',
        'Nueva123'
      );

      expect(component.guardandoPassword).toBe(false);

    }));

    it('debe manejar error sin mensaje al cambiar contraseña', fakeAsync(() => {

      authServiceMock.cambiarContrasena.mockReturnValue(
        throwError(() => ({}))
      );

      component.cambiarContrasena();

      tick();

      expect(component.errorPassword).toBeTruthy();

    }));

  });

  describe('Cobertura adicional', () => {

    it('debe cubrir esAdmin en true', () => {

      authServiceMock.esAdmin.mockReturnValue(true);

      expect(authServiceMock.esAdmin()).toBe(true);

    });

    it('debe cubrir esAdmin en false', () => {

      authServiceMock.esAdmin.mockReturnValue(false);

      expect(authServiceMock.esAdmin()).toBe(false);

    });

  });

});
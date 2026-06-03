/**
 * registro.component.spec.ts
 * Pruebas del componente RegistroComponent
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegistroComponent } from './registro.component';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

describe('RegistroComponent', () => {
  let component: RegistroComponent;
  let fixture: ComponentFixture<RegistroComponent>;
  let authService: AuthService;
  let router: Router;

  const mockAuthService = {
    registro: jest.fn(),
    estaLogueado: jest.fn(),
    redirigirPorRol: jest.fn(),
    setEmailPendiente: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
  };

  const mockActivatedRoute = {
    queryParams: of({}),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockAuthService.estaLogueado.mockReturnValue(false);
    mockAuthService.registro.mockReturnValue(of({ 
      mensaje: 'Registro exitoso',
      requiereVerificacion: true 
    }));

    await TestBed.configureTestingModule({
      imports: [RegistroComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(RegistroComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialización', () => {
    it('should initialize with default values', () => {
      expect(component.datos.nombre).toBe('');
      expect(component.datos.email).toBe('');
      expect(component.datos.password).toBe('');
      expect(component.datos.telefono).toBe('');
      expect(component.datos.confirmarPassword).toBe('');
      expect(component.submitted).toBe(false);
      expect(component.error).toBe('');
      expect(component.cargando).toBe(false);
    });

    it('should redirect if already logged in', () => {
      mockAuthService.estaLogueado.mockReturnValue(true);
      
      fixture.detectChanges();
      
      expect(mockAuthService.redirigirPorRol).toHaveBeenCalled();
    });

    it('should not redirect if not logged in', () => {
      mockAuthService.estaLogueado.mockReturnValue(false);
      
      fixture.detectChanges();
      
      expect(mockAuthService.redirigirPorRol).not.toHaveBeenCalled();
    });
  });

  describe('Validaciones individuales', () => {
    describe('nombreInvalido', () => {
      it('should be valid when name has 3+ characters', () => {
        component.datos.nombre = 'Juan Pérez';
        component.submitted = true;
        
        expect(component.nombreInvalido).toBe(false);
      });

      it('should be invalid when name is empty', () => {
        component.datos.nombre = '';
        component.submitted = true;
        
        expect(component.nombreInvalido).toBe(true);
      });

      it('should be invalid when name has less than 3 characters', () => {
        component.datos.nombre = 'Ju';
        component.submitted = true;
        
        expect(component.nombreInvalido).toBe(true);
      });

      it('should not validate when not submitted', () => {
        component.datos.nombre = '';
        component.submitted = false;
        
        expect(component.nombreInvalido).toBe(false);
      });
    });

    describe('emailInvalido', () => {
      it('should be valid with correct email format', () => {
        component.datos.email = 'test@email.com';
        component.submitted = true;
        
        expect(component.emailInvalido).toBe(false);
      });

      it('should be invalid with wrong email format', () => {
        component.datos.email = 'test@email';
        component.submitted = true;
        
        expect(component.emailInvalido).toBe(true);
      });

      it('should be invalid when email is empty', () => {
        component.datos.email = '';
        component.submitted = true;
        
        expect(component.emailInvalido).toBe(true);
      });
    });

    describe('telefonoInvalido', () => {
      it('should be valid with 10 digits', () => {
        component.datos.telefono = '3001234567';
        component.submitted = true;
        
        expect(component.telefonoInvalido).toBe(false);
      });

      it('should be invalid with less than 10 digits', () => {
        component.datos.telefono = '300123456';
        component.submitted = true;
        
        expect(component.telefonoInvalido).toBe(true);
      });

      it('should be invalid when phone is empty', () => {
        component.datos.telefono = '';
        component.submitted = true;
        
        expect(component.telefonoInvalido).toBe(true);
      });

      it('should be invalid with non-numeric characters', () => {
        component.datos.telefono = '300123456a';
        component.submitted = true;
        
        expect(component.telefonoInvalido).toBe(true);
      });
    });

    describe('passwordInvalido', () => {
      it('should be valid with strong password', () => {
        component.datos.password = 'Test1234';
        component.submitted = true;
        
        expect(component.passwordInvalido).toBe(false);
      });

      it('should be invalid when password is too short', () => {
        component.datos.password = 'Test1';
        component.submitted = true;
        
        expect(component.passwordInvalido).toBe(true);
      });

      it('should be invalid without uppercase', () => {
        component.datos.password = 'test1234';
        component.submitted = true;
        
        expect(component.passwordInvalido).toBe(true);
      });

      it('should be invalid without number', () => {
        component.datos.password = 'TestPass';
        component.submitted = true;
        
        expect(component.passwordInvalido).toBe(true);
      });

      it('should be invalid when password is empty', () => {
        component.datos.password = '';
        component.submitted = true;
        
        expect(component.passwordInvalido).toBe(true);
      });
    });

    describe('confirmarPasswordInvalido', () => {
      it('should be valid when passwords match', () => {
        component.datos.password = 'Test1234';
        component.datos.confirmarPassword = 'Test1234';
        component.submitted = true;
        
        expect(component.confirmarPasswordInvalido).toBe(false);
      });

      it('should be invalid when passwords do not match', () => {
        component.datos.password = 'Test1234';
        component.datos.confirmarPassword = 'Test5678';
        component.submitted = true;
        
        expect(component.confirmarPasswordInvalido).toBe(true);
      });

      it('should be invalid when confirmar password is empty', () => {
        component.datos.password = 'Test1234';
        component.datos.confirmarPassword = '';
        component.submitted = true;
        
        expect(component.confirmarPasswordInvalido).toBe(true);
      });
    });
  });

  describe('formularioValido', () => {
    it('should be valid when all fields are correct', () => {
      component.datos.nombre = 'Juan Pérez';
      component.datos.email = 'juan@email.com';
      component.datos.telefono = '3001234567';
      component.datos.password = 'Test1234';
      component.datos.confirmarPassword = 'Test1234';
      
      expect(component.formularioValido).toBe(true);
    });

    it('should be invalid when name is too short', () => {
      component.datos.nombre = 'Ju';
      component.datos.email = 'juan@email.com';
      component.datos.telefono = '3001234567';
      component.datos.password = 'Test1234';
      component.datos.confirmarPassword = 'Test1234';
      
      expect(component.formularioValido).toBe(false);
    });

    it('should be invalid when email is invalid', () => {
      component.datos.nombre = 'Juan Pérez';
      component.datos.email = 'invalid-email';
      component.datos.telefono = '3001234567';
      component.datos.password = 'Test1234';
      component.datos.confirmarPassword = 'Test1234';
      
      expect(component.formularioValido).toBe(false);
    });

    it('should be invalid when phone is invalid', () => {
      component.datos.nombre = 'Juan Pérez';
      component.datos.email = 'juan@email.com';
      component.datos.telefono = '123';
      component.datos.password = 'Test1234';
      component.datos.confirmarPassword = 'Test1234';
      
      expect(component.formularioValido).toBe(false);
    });

    it('should be invalid when password is weak', () => {
      component.datos.nombre = 'Juan Pérez';
      component.datos.email = 'juan@email.com';
      component.datos.telefono = '3001234567';
      component.datos.password = 'weak';
      component.datos.confirmarPassword = 'weak';
      
      expect(component.formularioValido).toBe(false);
    });

    it('should be invalid when passwords do not match', () => {
      component.datos.nombre = 'Juan Pérez';
      component.datos.email = 'juan@email.com';
      component.datos.telefono = '3001234567';
      component.datos.password = 'Test1234';
      component.datos.confirmarPassword = 'Test5678';
      
      expect(component.formularioValido).toBe(false);
    });
  });

  describe('Métodos de input/change', () => {
    it('should validate name on change when submitted', () => {
      component.submitted = true;
      component.onNombreChange();
      
      expect(component.nombreInvalido).toBeDefined();
    });

    it('should validate email on change when submitted', () => {
      component.submitted = true;
      component.onEmailChange();
      
      expect(component.emailInvalido).toBeDefined();
    });

    it('should validate phone on input when submitted', () => {
      component.submitted = true;
      const mockEvent = {
        target: { value: '3001234567' }
      } as unknown as Event;
      
      component.onTelefonoInput(mockEvent);
      
      expect(component.telefonoInvalido).toBeDefined();
    });

    it('should remove non-numeric characters from phone', () => {
      const mockEvent = {
        target: { value: '300abc123' }
      } as unknown as Event;
      
      component.onTelefonoInput(mockEvent);
      
      expect(component.datos.telefono).toBe('300123');
    });

    it('should limit phone to 10 digits', () => {
      const mockEvent = {
        target: { value: '3001234567890' }
      } as unknown as Event;
      
      component.onTelefonoInput(mockEvent);
      
      expect(component.datos.telefono.length).toBeLessThanOrEqual(10);
    });

    it('should validate password on change when submitted', () => {
      component.submitted = true;
      component.onPasswordChange();
      
      expect(component.passwordInvalido).toBeDefined();
    });

    it('should validate confirmar password on change when submitted', () => {
      component.submitted = true;
      component.onConfirmarPasswordChange();
      
      expect(component.confirmarPasswordInvalido).toBeDefined();
    });
  });

  describe('Registro exitoso', () => {
    it('should set submitted to true on register', () => {
      component.datos.nombre = 'Juan Pérez';
      component.datos.email = 'juan@email.com';
      component.datos.telefono = '3001234567';
      component.datos.password = 'Test1234';
      component.datos.confirmarPassword = 'Test1234';
      
      component.onRegistro();
      
      expect(component.submitted).toBe(true);
    });

    it('should call auth service with correct data', () => {
      component.datos.nombre = 'Juan Pérez';
      component.datos.email = 'juan@email.com';
      component.datos.telefono = '3001234567';
      component.datos.password = 'Test1234';
      component.datos.confirmarPassword = 'Test1234';
      
      component.onRegistro();
      
      expect(mockAuthService.registro).toHaveBeenCalledWith({
        nombre: 'Juan Pérez',
        email: 'juan@email.com',
        telefono: '3001234567',
        password: 'Test1234',
        confirmarPassword: 'Test1234'
      });
    });

    

    it('should navigate to verificar-cuenta on success', () => {
      component.datos.nombre = 'Juan Pérez';
      component.datos.email = 'juan@email.com';
      component.datos.telefono = '3001234567';
      component.datos.password = 'Test1234';
      component.datos.confirmarPassword = 'Test1234';
      
      component.onRegistro();
      
      expect(mockAuthService.setEmailPendiente).toHaveBeenCalledWith('juan@email.com');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/verificar-cuenta']);
    });

    it('should clear error before request', () => {
      component.error = 'Error previo';
      component.datos.nombre = 'Juan Pérez';
      component.datos.email = 'juan@email.com';
      component.datos.telefono = '3001234567';
      component.datos.password = 'Test1234';
      component.datos.confirmarPassword = 'Test1234';
      
      component.onRegistro();
      
      expect(component.error).toBe('');
    });
  });

  describe('Errores de validación', () => {
    it('should show error for invalid name', () => {
      component.datos.nombre = 'Ju';
      component.datos.email = 'juan@email.com';
      component.datos.telefono = '3001234567';
      component.datos.password = 'Test1234';
      component.datos.confirmarPassword = 'Test1234';
      
      component.onRegistro();
      
      expect(component.error).toBe('El nombre debe tener al menos 3 caracteres.');
      expect(component.cargando).toBe(false);
    });

    it('should show error for invalid email', () => {
      component.datos.nombre = 'Juan Pérez';
      component.datos.email = 'invalid';
      component.datos.telefono = '3001234567';
      component.datos.password = 'Test1234';
      component.datos.confirmarPassword = 'Test1234';
      
      component.onRegistro();
      
      expect(component.error).toBe('Ingrese un correo electrónico válido.');
      expect(component.cargando).toBe(false);
    });

    it('should show error for invalid phone', () => {
      component.datos.nombre = 'Juan Pérez';
      component.datos.email = 'juan@email.com';
      component.datos.telefono = '123';
      component.datos.password = 'Test1234';
      component.datos.confirmarPassword = 'Test1234';
      
      component.onRegistro();
      
      expect(component.error).toBe('El teléfono debe tener 10 dígitos numéricos.');
      expect(component.cargando).toBe(false);
    });

    it('should show error for weak password', () => {
      component.datos.nombre = 'Juan Pérez';
      component.datos.email = 'juan@email.com';
      component.datos.telefono = '3001234567';
      component.datos.password = 'weak';
      component.datos.confirmarPassword = 'weak';
      
      component.onRegistro();
      
      expect(component.error).toBe('La contraseña debe tener mín. 8 caracteres, una mayúscula y un número.');
      expect(component.cargando).toBe(false);
    });

    it('should show error for mismatched passwords', () => {
      component.datos.nombre = 'Juan Pérez';
      component.datos.email = 'juan@email.com';
      component.datos.telefono = '3001234567';
      component.datos.password = 'Test1234';
      component.datos.confirmarPassword = 'Test5678';
      
      component.onRegistro();
      
      expect(component.error).toBe('Las contraseñas no coinciden.');
      expect(component.cargando).toBe(false);
    });

    it('should not call service when form is invalid', () => {
      component.datos.nombre = 'Ju';
      component.onRegistro();
      
      expect(mockAuthService.registro).not.toHaveBeenCalled();
    });
  });

  describe('Errores del servidor', () => {
    it('should handle server error with message', () => {
      mockAuthService.registro.mockReturnValue(
        throwError(() => ({ error: { mensaje: 'El email ya está registrado' } }))
      );
      
      component.datos.nombre = 'Juan Pérez';
      component.datos.email = 'juan@email.com';
      component.datos.telefono = '3001234567';
      component.datos.password = 'Test1234';
      component.datos.confirmarPassword = 'Test1234';
      
      component.onRegistro();
      
      expect(component.error).toBe('El email ya está registrado');
      expect(component.cargando).toBe(false);
    });

    it('should handle generic server error', () => {
      mockAuthService.registro.mockReturnValue(
        throwError(() => ({ error: {} }))
      );
      
      component.datos.nombre = 'Juan Pérez';
      component.datos.email = 'juan@email.com';
      component.datos.telefono = '3001234567';
      component.datos.password = 'Test1234';
      component.datos.confirmarPassword = 'Test1234';
      
      component.onRegistro();
      
      expect(component.error).toBe('Error en el registro.');
      expect(component.cargando).toBe(false);
    });

    it('should handle requiereVerificacion error', () => {
      mockAuthService.registro.mockReturnValue(
        throwError(() => ({ error: { requiereVerificacion: true } }))
      );
      
      component.datos.nombre = 'Juan Pérez';
      component.datos.email = 'juan@email.com';
      component.datos.telefono = '3001234567';
      component.datos.password = 'Test1234';
      component.datos.confirmarPassword = 'Test1234';
      
      component.onRegistro();
      
      expect(mockAuthService.setEmailPendiente).toHaveBeenCalledWith('juan@email.com');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/verificar-cuenta']);
    });
  });
});
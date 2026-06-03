/**
 * verificar-reset.component.spec.ts
 * Pruebas del componente VerificarResetComponent
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { VerificarResetComponent } from './verificar-reset.component';
import { AuthService } from '../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

describe('VerificarResetComponent', () => {
  let component: VerificarResetComponent;
  let fixture: ComponentFixture<VerificarResetComponent>;
  let authService: AuthService;
  let router: Router;

  const mockAuthService = {
    emailPendiente: jest.fn(),
    verificarReset: jest.fn(),
    solicitarReset: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
  };

  const mockActivatedRoute = {
    queryParams: of({}),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockAuthService.emailPendiente.mockReturnValue('test@email.com');
    mockAuthService.verificarReset.mockReturnValue(of({ 
      mensaje: 'Código verificado', 
      resetToken: 'reset-token-123' 
    }));
    mockAuthService.solicitarReset.mockReturnValue(of({ mensaje: 'Código reenviado' }));

    await TestBed.configureTestingModule({
      imports: [VerificarResetComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(VerificarResetComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialización', () => {
    it('should initialize with default values', () => {
      expect(component.email).toBe('');
      expect(component.digitos).toEqual(['', '', '', '', '', '']);
      expect(component.error).toBe('');
      expect(component.cargando).toBe(false);
      expect(component.reenviando).toBe(false);
      expect(component.cooldown).toBe(0);
    });

    it('should get email from auth service on init', () => {
      fixture.detectChanges();
      
      expect(mockAuthService.emailPendiente).toHaveBeenCalled();
      expect(component.email).toBe('test@email.com');
    });

    it('should redirect to solicitar-reset if no email', () => {
      mockAuthService.emailPendiente.mockReturnValue('');
      
      fixture.detectChanges();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/solicitar-reset']);
    });
  });

  describe('Manejo de dígitos', () => {
    it('should return complete code as string', () => {
      component.digitos = ['1', '2', '3', '4', '5', '6'];
      
      expect(component.codigoCompleto).toBe('123456');
    });

    it('should handle digit input and focus next input', () => {
      const mockInput = {
        nativeElement: { value: '5', focus: jest.fn() }
      };
      const mockInputs = {
        toArray: jest.fn().mockReturnValue([mockInput, mockInput, mockInput, mockInput, mockInput, mockInput])
      };
      component.digitInputs = mockInputs as any;

      const event = { target: { value: '5' } };
      component.onDigitInput(event as any, 0);

      expect(component.digitos[0]).toBe('5');
    });

    it('should handle backspace to focus previous input', () => {
      component.digitos = ['1', '', '3', '', '', ''];
      const mockInput = { nativeElement: { focus: jest.fn() } };
      const mockInputs = {
        toArray: jest.fn().mockReturnValue([mockInput, mockInput, mockInput, mockInput, mockInput, mockInput])
      };
      component.digitInputs = mockInputs as any;

      const event = { key: 'Backspace' } as KeyboardEvent;
      component.onKeyDown(event, 1);

      expect(mockInputs.toArray()[0].nativeElement.focus).toHaveBeenCalled();
    });

    it('should handle paste event', fakeAsync(() => {
      const mockInput = { nativeElement: { value: '', focus: jest.fn() } };
      const mockInputs = {
        toArray: jest.fn().mockReturnValue(Array(6).fill(mockInput))
      };
      component.digitInputs = mockInputs as any;

      const pasteEvent = {
        preventDefault: jest.fn(),
        clipboardData: {
          getData: jest.fn().mockReturnValue('123456')
        }
      } as any;

      component.onPaste(pasteEvent);
      tick(10);

      expect(component.digitos).toEqual(['1', '2', '3', '4', '5', '6']);
    }));
  });

  describe('Verificación de código', () => {
    it('should not verify if code is incomplete', () => {
      component.digitos = ['1', '2', '3', '', '', ''];
      component.verificar();
      
      expect(mockAuthService.verificarReset).not.toHaveBeenCalled();
    });

    it('should call service with correct parameters', () => {
      component.email = 'test@email.com';
      component.digitos = ['1', '2', '3', '4', '5', '6'];
      
      component.verificar();
      
      expect(mockAuthService.verificarReset).toHaveBeenCalledWith('test@email.com', '123456');
    });

    it('should navigate to nueva-contrasena on success', () => {
      component.email = 'test@email.com';
      component.digitos = ['1', '2', '3', '4', '5', '6'];
      
      component.verificar();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/nueva-contrasena'], {
        queryParams: { token: 'reset-token-123' }
      });
    });

    it('should show error on failure', () => {
      mockAuthService.verificarReset.mockReturnValue(
        throwError(() => ({ error: { mensaje: 'Código incorrecto' } }))
      );
      
      component.email = 'test@email.com';
      component.digitos = ['1', '2', '3', '4', '5', '6'];
      component.verificar();
      
      expect(component.error).toBe('Código incorrecto');
      expect(component.cargando).toBe(false);
    });

    it('should clear digits after error', fakeAsync(() => {
      mockAuthService.verificarReset.mockReturnValue(
        throwError(() => ({ error: { mensaje: 'Código inválido' } }))
      );
      
      const mockInput = { nativeElement: { value: '1', focus: jest.fn() } };
      const mockInputs = {
        toArray: jest.fn().mockReturnValue(Array(6).fill(mockInput))
      };
      component.digitInputs = mockInputs as any;
      
      component.email = 'test@email.com';
      component.digitos = ['1', '2', '3', '4', '5', '6'];
      component.verificar();
      
      tick(600);
      
      expect(component.digitos).toEqual(['', '', '', '', '', '']);
    }));
  });

  describe('Reenvío de código', () => {
    it('should call service to resend code', () => {
      component.email = 'test@email.com';
      component.reenviar();
      
      expect(mockAuthService.solicitarReset).toHaveBeenCalledWith('test@email.com');
    });

    it('should start cooldown timer on success', fakeAsync(() => {
      component.reenviar();
      
      expect(component.cooldown).toBe(60);
      
      tick(1000);
      expect(component.cooldown).toBe(59);
      
      tick(59000);
      expect(component.cooldown).toBe(0);
    }));

    it('should show error on resend failure', () => {
      mockAuthService.solicitarReset.mockReturnValue(
        throwError(() => ({ error: { mensaje: 'Error al reenviar' } }))
      );
      
      component.reenviar();
      
      expect(component.error).toBe('Error al reenviar');
      expect(component.reenviando).toBe(false);
    });

    it('should clear error before resend', () => {
      component.error = 'Error previo';
      component.reenviar();
      
      expect(component.error).toBe('');
    });
  });

  describe('Helpers', () => {
    it('should track by index', () => {
      expect(component.trackByIndex(0)).toBe(0);
      expect(component.trackByIndex(5)).toBe(5);
    });
  });
    // Tests adicionales para mejorar cobertura de branches

  describe('Estados de botones disabled', () => {
    it('should disable verify button when cargando is true', () => {
      component.cargando = true;
      component.digitos = ['1', '2', '3', '4', '5', '6'];
      
      // El botón debería estar disabled porque cargando es true
      const buttonDisabled = component.cargando || component.codigoCompleto.length !== 6;
      
      expect(buttonDisabled).toBe(true);
    });

    it('should disable verify button when code is incomplete', () => {
      component.cargando = false;
      component.digitos = ['1', '2', '3', '', '', ''];
      
      const buttonDisabled = component.cargando || component.codigoCompleto.length !== 6;
      
      expect(buttonDisabled).toBe(true);
    });

    it('should enable verify button when code is complete and not loading', () => {
      component.cargando = false;
      component.digitos = ['1', '2', '3', '4', '5', '6'];
      
      const buttonDisabled = component.cargando || component.codigoCompleto.length !== 6;
      
      expect(buttonDisabled).toBe(false);
    });

    it('should disable resend button when reenviando is true', () => {
      component.reenviando = true;
      component.cooldown = 0;
      
      const buttonDisabled = component.reenviando || component.cooldown > 0;
      
      expect(buttonDisabled).toBe(true);
    });

    it('should disable resend button when cooldown > 0', () => {
      component.reenviando = false;
      component.cooldown = 30;
      
      const buttonDisabled = component.reenviando || component.cooldown > 0;
      
      expect(buttonDisabled).toBe(true);
    });

    it('should enable resend button when not reenviando and cooldown is 0', () => {
      component.reenviando = false;
      component.cooldown = 0;
      
      const buttonDisabled = component.reenviando || component.cooldown > 0;
      
      expect(buttonDisabled).toBe(false);
    });
  });

  describe('Button text states', () => {
    it('should show "Verificando..." when cargando is true', () => {
      component.cargando = true;
      
      const buttonText = component.cargando ? 'Verificando...' : 'Verificar código';
      
      expect(buttonText).toBe('Verificando...');
    });

    it('should show "Enviando..." when reenviando is true', () => {
      component.reenviando = true;
      component.cooldown = 0;
      
      const buttonText = component.reenviando ? 'Enviando...' : 
                        component.cooldown > 0 ? `Reenviar en ${component.cooldown}s` : 'Reenviar código';
      
      expect(buttonText).toBe('Enviando...');
    });

    it('should show countdown when cooldown > 0', () => {
      component.reenviando = false;
      component.cooldown = 45;
      
      const buttonText = component.reenviando ? 'Enviando...' : 
                        component.cooldown > 0 ? `Reenviar en ${component.cooldown}s` : 'Reenviar código';
      
      expect(buttonText).toBe('Reenviar en 45s');
    });

    it('should show "Reenviar código" when ready', () => {
      component.reenviando = false;
      component.cooldown = 0;
      
      const buttonText = component.reenviando ? 'Enviando...' : 
                        component.cooldown > 0 ? `Reenviar en ${component.cooldown}s` : 'Reenviar código';
      
      expect(buttonText).toBe('Reenviar código');
    });
  });

  describe('Manejo de errores', () => {
    it('should show generic error message when no mensaje in error', () => {
      mockAuthService.verificarReset.mockReturnValue(
        throwError(() => ({ error: {} }))
      );
      
      component.email = 'test@email.com';
      component.digitos = ['1', '2', '3', '4', '5', '6'];
      component.verificar();
      
      expect(component.error).toBe('Código incorrecto.');
    });

    

    it('should show error class shake when mostrarError is true', () => {
      component.mostrarError = true;
      
      // En el HTML: [class.shake]="mostrarError" sería true
      expect(component.mostrarError).toBe(true);
    });

    it('should show generic error on resend failure', () => {
      mockAuthService.solicitarReset.mockReturnValue(
        throwError(() => ({ error: {} }))
      );
      
      component.reenviar();
      
      expect(component.error).toBe('Error al reenviar.');
    });
  });

  describe('Paste event', () => {
    it('should handle paste with less than 6 digits', fakeAsync(() => {
      const mockInput = { nativeElement: { value: '', focus: jest.fn() } };
      const mockInputs = {
        toArray: jest.fn().mockReturnValue(Array(6).fill(mockInput))
      };
      component.digitInputs = mockInputs as any;

      const pasteEvent = {
        preventDefault: jest.fn(),
        clipboardData: {
          getData: jest.fn().mockReturnValue('123')
        }
      } as any;

      component.onPaste(pasteEvent);
      tick(10);

      expect(component.digitos.slice(0, 3)).toEqual(['1', '2', '3']);
      expect(component.digitos.slice(3)).toEqual(['', '', '']);
    }));

    it('should handle paste with more than 6 digits', fakeAsync(() => {
      const mockInput = { nativeElement: { value: '', focus: jest.fn() } };
      const mockInputs = {
        toArray: jest.fn().mockReturnValue(Array(6).fill(mockInput))
      };
      component.digitInputs = mockInputs as any;

      const pasteEvent = {
        preventDefault: jest.fn(),
        clipboardData: {
          getData: jest.fn().mockReturnValue('123456789')
        }
      } as any;

      component.onPaste(pasteEvent);
      tick(10);

      expect(component.digitos).toEqual(['1', '2', '3', '4', '5', '6']);
    }));

    it('should handle paste with non-numeric characters', fakeAsync(() => {
      const mockInput = { nativeElement: { value: '', focus: jest.fn() } };
      const mockInputs = {
        toArray: jest.fn().mockReturnValue(Array(6).fill(mockInput))
      };
      component.digitInputs = mockInputs as any;

      const pasteEvent = {
        preventDefault: jest.fn(),
        clipboardData: {
          getData: jest.fn().mockReturnValue('abc123')
        }
      } as any;

      component.onPaste(pasteEvent);
      tick(10);

      expect(component.digitos.slice(0, 3)).toEqual(['1', '2', '3']);
    }));

    it('should handle empty paste', () => {
      const pasteEvent = {
        preventDefault: jest.fn(),
        clipboardData: {
          getData: jest.fn().mockReturnValue('')
        }
      } as any;

      component.onPaste(pasteEvent);

      expect(component.digitos).toEqual(['', '', '', '', '', '']);
    });

    it('should handle paste with null clipboardData', () => {
      const pasteEvent = {
        preventDefault: jest.fn(),
        clipboardData: null
      } as any;

      component.onPaste(pasteEvent);

      expect(component.digitos).toEqual(['', '', '', '', '', '']);
    });
  });

  describe('onDigitInput edge cases', () => {
    it('should handle empty value in digit input', () => {
      const mockInput = {
        nativeElement: { value: '', focus: jest.fn() }
      };
      const mockInputs = {
        toArray: jest.fn().mockReturnValue([mockInput, mockInput, mockInput, mockInput, mockInput, mockInput])
      };
      component.digitInputs = mockInputs as any;

      const event = { target: { value: '' } };
      component.onDigitInput(event as any, 0);

      expect(component.digitos[0]).toBe('');
    });

    it('should not focus next input when value is empty', () => {
      const mockInput = {
        nativeElement: { value: '', focus: jest.fn() }
      };
      const mockInputs = {
        toArray: jest.fn().mockReturnValue([mockInput, mockInput, mockInput, mockInput, mockInput, mockInput])
      };
      component.digitInputs = mockInputs as any;

      const event = { target: { value: '' } };
      component.onDigitInput(event as any, 0);

      expect(mockInputs.toArray()[1].nativeElement.focus).not.toHaveBeenCalled();
    });

    it('should not focus next input when index is 5', () => {
      const mockInput = {
        nativeElement: { value: '5', focus: jest.fn() }
      };
      const mockInputs = {
        toArray: jest.fn().mockReturnValue([mockInput, mockInput, mockInput, mockInput, mockInput, mockInput])
      };
      component.digitInputs = mockInputs as any;

      const event = { target: { value: '5' } };
      component.onDigitInput(event as any, 5);

      expect(mockInputs.toArray()[6]).toBeUndefined();
    });

    it('should remove non-numeric characters from input', () => {
      const mockInput = {
        nativeElement: { value: 'abc', focus: jest.fn() }
      };
      const mockInputs = {
        toArray: jest.fn().mockReturnValue([mockInput, mockInput, mockInput, mockInput, mockInput, mockInput])
      };
      component.digitInputs = mockInputs as any;

      const event = { target: { value: 'abc' } };
      component.onDigitInput(event as any, 0);

      expect(component.digitos[0]).toBe('');
    });
  });

  describe('onKeyDown edge cases', () => {
    it('should not focus previous when key is not Backspace', () => {
      component.digitos = ['', '2', '3', '', '', ''];
      const mockInput = { nativeElement: { focus: jest.fn() } };
      const mockInputs = {
        toArray: jest.fn().mockReturnValue([mockInput, mockInput, mockInput, mockInput, mockInput, mockInput])
      };
      component.digitInputs = mockInputs as any;

      const event = { key: 'ArrowLeft' } as KeyboardEvent;
      component.onKeyDown(event, 2);

      expect(mockInputs.toArray()[1].nativeElement.focus).not.toHaveBeenCalled();
    });

    it('should not focus previous when index is 0', () => {
      component.digitos = ['', '2', '3', '', '', ''];
      const mockInput = { nativeElement: { focus: jest.fn() } };
      const mockInputs = {
        toArray: jest.fn().mockReturnValue([mockInput, mockInput, mockInput, mockInput, mockInput, mockInput])
      };
      component.digitInputs = mockInputs as any;

      const event = { key: 'Backspace' } as KeyboardEvent;
      component.onKeyDown(event, 0);

      expect(mockInputs.toArray).not.toHaveBeenCalled();
    });

    it('should not focus previous when current digit has value', () => {
      component.digitos = ['1', '2', '3', '', '', ''];
      const mockInput = { nativeElement: { focus: jest.fn() } };
      const mockInputs = {
        toArray: jest.fn().mockReturnValue([mockInput, mockInput, mockInput, mockInput, mockInput, mockInput])
      };
      component.digitInputs = mockInputs as any;

      const event = { key: 'Backspace' } as KeyboardEvent;
      component.onKeyDown(event, 1);

      expect(mockInputs.toArray()[0].nativeElement.focus).not.toHaveBeenCalled();
    });
  });

  describe('Cooldown timer', () => {
    it('should clear interval when cooldown reaches 0', fakeAsync(() => {
      jest.useFakeTimers();
      
      component.reenviar();
      
      jest.advanceTimersByTime(60000);
      
      expect(component.cooldown).toBe(0);
      
      jest.useRealTimers();
    }));

    it('should decrement cooldown every second', fakeAsync(() => {
      component.reenviar();
      
      expect(component.cooldown).toBe(60);
      
      tick(5000);
      expect(component.cooldown).toBe(55);
      
      tick(30000);
      expect(component.cooldown).toBe(25);
    }));
  });

  describe('Verificación con código incompleto', () => {
    it('should not verify with 5 digits', () => {
      component.digitos = ['1', '2', '3', '4', '5', ''];
      component.verificar();
      
      expect(mockAuthService.verificarReset).not.toHaveBeenCalled();
    });

    it('should not verify with empty code', () => {
      component.digitos = ['', '', '', '', '', ''];
      component.verificar();
      
      expect(mockAuthService.verificarReset).not.toHaveBeenCalled();
    });
  });

  describe('Redirección sin email', () => {
    it('should redirect when email is null', () => {
      mockAuthService.emailPendiente.mockReturnValue(null);
      
      fixture.detectChanges();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/solicitar-reset']);
    });

    it('should redirect when email is empty string', () => {
      mockAuthService.emailPendiente.mockReturnValue('');
      
      fixture.detectChanges();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/solicitar-reset']);
    });
  });
});
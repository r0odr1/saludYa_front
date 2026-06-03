/**
 * solicitar-reset.component.spec.ts
 * Pruebas del componente SolicitarResetComponent
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SolicitarResetComponent } from './solicitar-reset.component';
import { AuthService } from '../../services/auth.service';

describe('SolicitarResetComponent', () => {
  let component: SolicitarResetComponent;
  let fixture: ComponentFixture<SolicitarResetComponent>;
  let authService: AuthService;
  let router: Router;

  const mockAuthService = {
    solicitarReset: jest.fn(),
    setEmailPendiente: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockAuthService.solicitarReset.mockReturnValue(of({ mensaje: 'Código enviado' }));

    await TestBed.configureTestingModule({
      imports: [SolicitarResetComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useFactory: () => ({
            queryParams: of({}),
            snapshot: {
              paramMap: {
                get: jest.fn()
              }
            }
          })
        },
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SolicitarResetComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Estado inicial', () => {
    it('should initialize with empty values', () => {
      expect(component.email).toBe('');
      expect(component.error).toBe('');
      expect(component.cargando).toBe(false);
    });
  });

  describe('Validación del formulario', () => {
    it('should show error when email is empty', () => {
      component.email = '';
      component.solicitar();
      
      expect(component.error).toBe('Ingresa tu correo electrónico.');
      expect(mockAuthService.solicitarReset).not.toHaveBeenCalled();
    });
  });

  describe('Solicitud exitosa', () => {
    it('should call service with correct email', () => {
      component.email = 'usuario@test.com';
      component.solicitar();
      
      expect(mockAuthService.solicitarReset).toHaveBeenCalledWith('usuario@test.com');
    });

    it('should set email pending and navigate on success', () => {
      component.email = 'usuario@test.com';
      component.solicitar();
      
      expect(mockAuthService.setEmailPendiente).toHaveBeenCalledWith('usuario@test.com');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/verificar-reset']);
    });

    it('should clear error before request', () => {
      component.error = 'Error previo';
      component.email = 'usuario@test.com';
      component.solicitar();
      
      expect(component.error).toBe('');
    });
  });

  describe('Manejo de errores', () => {
    it('should show error message from service', () => {
      mockAuthService.solicitarReset.mockReturnValue(
        throwError(() => ({ error: { mensaje: 'Correo no registrado' } }))
      );
      
      component.email = 'noexiste@test.com';
      component.solicitar();
      
      expect(component.error).toBe('Correo no registrado');
      expect(component.cargando).toBe(false);
    });

    it('should show generic error message if no mensaje in error', () => {
      mockAuthService.solicitarReset.mockReturnValue(
        throwError(() => ({ error: {} }))
      );
      
      component.email = 'test@test.com';
      component.solicitar();
      
      expect(component.error).toBe('Error al enviar código.');
      expect(component.cargando).toBe(false);
    });
  });
});
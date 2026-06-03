/**
 * especialidades.component.spec.ts
 * Pruebas unitarias para EspecialidadesComponent
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import { EspecialidadesComponent } from './especialidades.component';
import { CitaService } from '../../../services/cita.service';
import { AuthService } from '../../../services/auth.service';

describe('EspecialidadesComponent', () => {
  let component: EspecialidadesComponent;
  let fixture: ComponentFixture<EspecialidadesComponent>;

  let citaServiceMock: jest.Mocked<CitaService>;
  let authServiceMock: jest.Mocked<AuthService>;

  beforeEach(async () => {
    citaServiceMock = {
      getEspecialidades: jest.fn()
    } as unknown as jest.Mocked<CitaService>;

    authServiceMock = {
      estaLogueado: jest.fn()
    } as unknown as jest.Mocked<AuthService>;

    await TestBed.configureTestingModule({
      imports: [EspecialidadesComponent, RouterTestingModule],
      providers: [
        ChangeDetectorRef,
        {
          provide: CitaService,
          useValue: citaServiceMock
        },
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EspecialidadesComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {

    it('debe cargar especialidades si el usuario está logueado', () => {
      const especialidadesMock = [
        { nombre: 'Masoterapia' },
        { nombre: 'Electroterapia' }
      ];

      authServiceMock.estaLogueado.mockReturnValue(true);

      citaServiceMock.getEspecialidades.mockReturnValue(
        of(especialidadesMock)
      );

      fixture.detectChanges();

      expect(citaServiceMock.getEspecialidades)
        .toHaveBeenCalled();

      expect(component.especialidades)
        .toEqual(especialidadesMock);

      expect(component.cargando)
        .toBe(false);
    });

    it('debe mostrar error si el usuario no está autenticado', fakeAsync(() => {

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      authServiceMock.estaLogueado.mockReturnValue(false);

      component.ngOnInit();

      tick(101);

      expect(component.error)
        .toBe('Usuario no autenticado');

      expect(component.cargando)
        .toBe(false);

      expect(citaServiceMock.getEspecialidades)
        .not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    }));

    it('debe cargar especialidades después del timeout si el usuario se autentica', fakeAsync(() => {
      authServiceMock.estaLogueado
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const especialidadesMock = [
        { nombre: 'Rehabilitación Deportiva' }
      ];

      citaServiceMock.getEspecialidades.mockReturnValue(
        of(especialidadesMock)
      );

      component.ngOnInit();

      tick(101);

      expect(citaServiceMock.getEspecialidades)
        .toHaveBeenCalled();

      expect(component.especialidades)
        .toEqual(especialidadesMock);

      expect(component.cargando)
        .toBe(false);
    }));
  });

  describe('cargarEspecialidades()', () => {

    it('debe manejar correctamente respuesta exitosa', () => {
      const especialidadesMock = [
        { nombre: 'Masoterapia' }
      ];

      authServiceMock.estaLogueado.mockReturnValue(true);

      citaServiceMock.getEspecialidades.mockReturnValue(
        of(especialidadesMock)
      );

      fixture.detectChanges();

      expect(component.especialidades)
        .toEqual(especialidadesMock);

      expect(component.error)
        .toBe('');

      expect(component.cargando)
        .toBe(false);
    });

    it('debe manejar error del servicio con mensaje personalizado', () => {

      authServiceMock.estaLogueado.mockReturnValue(true);

      citaServiceMock.getEspecialidades.mockReturnValue(
        throwError(() => ({
          error: {
            mensaje: 'Error cargando'
          }
        }))
      );

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      fixture.detectChanges();

      expect(component.error)
        .toBe('Error cargando');

      expect(component.cargando)
        .toBe(false);

      consoleSpy.mockRestore();
    });

    it('debe manejar error del servicio con mensaje por defecto', () => {

      authServiceMock.estaLogueado.mockReturnValue(true);

      citaServiceMock.getEspecialidades.mockReturnValue(
        throwError(() => ({}))
      );

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      fixture.detectChanges();

      expect(component.error)
        .toBe('No se pudieron cargar las especialidades.');

      expect(component.cargando)
        .toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('getIcon()', () => {

    it('debe retornar icono correcto para Evaluación Fisioterapéutica', () => {
      expect(component.getIcon('Evaluación Fisioterapéutica'))
        .toBe('🔍');
    });

    it('debe retornar icono correcto para Masoterapia', () => {
      expect(component.getIcon('Masoterapia'))
        .toBe('💆');
    });

    it('debe retornar icono correcto para Electroterapia', () => {
      expect(component.getIcon('Electroterapia'))
        .toBe('⚡');
    });

    it('debe retornar icono correcto para Rehabilitación Deportiva', () => {
      expect(component.getIcon('Rehabilitación Deportiva'))
        .toBe('🏃');
    });

    it('debe retornar icono correcto para Terapia Respiratoria', () => {
      expect(component.getIcon('Terapia Respiratoria'))
        .toBe('🫁');
    });

    it('debe retornar icono por defecto para especialidad desconocida', () => {
      expect(component.getIcon('Otra Especialidad'))
        .toBe('🩺');
    });
  });
});
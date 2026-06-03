/**
 * dashboard.component.spec.ts
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../../services/auth.service';
import { CitaService } from '../../../services/cita.service';

const authMock = {
  usuario: jest.fn(() => ({
    nombre: 'Rodrigo Herrera'
  }))
};

const citaMock = {
  getMisCitas: jest.fn()
};

const mockCitas = {
  citas: [
    {
      _id: '1',
      estado: 'agendada',
      fecha: '2026-06-10'
    },
    {
      _id: '2',
      estado: 'cancelada',
      fecha: '2026-06-11'
    },
    {
      _id: '3',
      estado: 'agendada',
      fecha: '2026-06-12'
    }
  ]
};

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();

    citaMock.getMisCitas.mockReturnValue(
      of(mockCitas)
    );

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        RouterTestingModule
      ],
      providers: [
        {
          provide: AuthService,
          useValue: authMock
        },
        {
          provide: CitaService,
          useValue: citaMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  // Inicialización
  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar citas al iniciar', () => {
    expect(citaMock.getMisCitas)
      .toHaveBeenCalled();
  });

  it('debe filtrar solo citas agendadas', () => {
    expect(component.proximasCitas.length)
      .toBe(2);

    expect(component.proximasCitas.every(
      c => c.estado === 'agendada'
    )).toBe(true);
  });

  it('debe cambiar cargando a false después de cargar', () => {
    expect(component.cargando).toBe(false);
  });

  // cargarCitas
  describe('cargarCitas()', () => {
    it('debe manejar respuesta inválida', () => {
      citaMock.getMisCitas.mockReturnValue(
        of({})
      );

      component.cargarCitas();

      expect(component.proximasCitas)
        .toEqual([]);

      expect(component.cargando)
        .toBe(false);
    });

    it('debe manejar error del servicio', () => {
      citaMock.getMisCitas.mockReturnValue(
        throwError(() => new Error('Error'))
      );

      component.cargarCitas();

      expect(component.proximasCitas)
        .toEqual([]);

      expect(component.cargando)
        .toBe(false);
    });
  });

  // nombreUsuario
  describe('nombreUsuario', () => {
    it('debe retornar solo el primer nombre', () => {
      expect(component.nombreUsuario)
        .toBe('Rodrigo');
    });
  });

  // formatFecha
  it('debe formatear fecha correctamente', () => {
    const resultado = component.formatFecha(
      '2026-06-10'
    );

    expect(typeof resultado).toBe('string');
    expect(resultado.length).toBeGreaterThan(0);
  });

  // Template
  it('debe renderizar el nombre del usuario', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent)
      .toContain('Rodrigo');
  });
});
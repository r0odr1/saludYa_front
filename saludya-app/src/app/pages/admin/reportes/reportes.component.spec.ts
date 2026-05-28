/**
 * reportes.component.spec.ts
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ReportesComponent } from './reportes.component';
import { AdminService } from '../../../services/admin.service';

const adminMock = {
  getReportes: jest.fn(),
};

const mockReporte = {
  periodo: {
    inicio: '2026-04-01T00:00:00.000Z',
    fin: '2026-04-30T23:59:59.999Z',
  },

  totalCitas: 24,

  porEspecialidad: [
    { especialidad: 'Electroterapia', total: 8 },
    { especialidad: 'Masoterapia', total: 6 },
    { especialidad: 'Evaluación', total: 5 },
  ],

  porEstado: [
    { _id: 'completada', total: 18 },
    { _id: 'cancelada', total: 4 },
    { _id: 'agendada', total: 2 },
  ],
};

describe('ReportesComponent', () => {
  let component: ReportesComponent;
  let fixture: ComponentFixture<ReportesComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();

    adminMock.getReportes.mockReturnValue(
      of(mockReporte)
    );

    await TestBed.configureTestingModule({
      imports: [ReportesComponent],
      providers: [
        {
          provide: AdminService,
          useValue: adminMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      ReportesComponent
    );

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  // Inicialización
  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar reportes al iniciar', () => {
    expect(adminMock.getReportes)
      .toHaveBeenCalled();
  });

  it('debe guardar el reporte correctamente', () => {
    expect(component.reporte.totalCitas)
      .toBe(24);

    expect(component.reporte.porEspecialidad.length)
      .toBe(3);

    expect(component.reporte.porEstado.length)
      .toBe(3);
  });

  // cargarReportes
  describe('cargarReportes()', () => {
    it('debe actualizar cargando en éxito', () => {
      component.cargarReportes();

      expect(component.cargando)
        .toBe(false);
    });

    it('debe manejar error al cargar', () => {
      adminMock.getReportes.mockReturnValue(
        throwError(() => new Error('Error'))
      );

      component.cargarReportes();

      expect(component.cargando)
        .toBe(false);
    });

    it('debe llamar getReportes con mes y año', () => {
      component.mesSeleccionado = 6;
      component.anioSeleccionado = 2026;

      component.cargarReportes();

      expect(adminMock.getReportes)
        .toHaveBeenCalledWith(6, 2026);
    });
  });

  // getBarWidth
  describe('getBarWidth()', () => {
    it('debe calcular porcentaje correctamente', () => {
      const width = component.getBarWidth(4);

      expect(width).toBe(50);
    });

    it('debe retornar mínimo 8', () => {
      const width = component.getBarWidth(0);

      expect(width).toBe(8);
    });
  });

  // getBarColor
  describe('getBarColor()', () => {
    it('debe retornar color de Electroterapia', () => {
      expect(
        component.getBarColor('Electroterapia')
      ).toBe('#D97706');
    });

    it('debe retornar color por defecto', () => {
      expect(
        component.getBarColor('Otra')
      ).toBe('#6B7280');
    });
  });

  // getEstadoIcon
  describe('getEstadoIcon()', () => {
    it('debe retornar icono de completada', () => {
      expect(
        component.getEstadoIcon('completada')
      ).toBe('✅');
    });

    it('debe retornar icono por defecto', () => {
      expect(
        component.getEstadoIcon('otro')
      ).toBe('📋');
    });
  });

  // getEstadoStyle
  describe('getEstadoStyle()', () => {
    it('debe retornar estilos de cancelada', () => {
      expect(
        component.getEstadoStyle('cancelada')
      ).toEqual({
        background: '#f8d7da',
        color: '#842029',
      });
    });

    it('debe retornar estilos por defecto', () => {
      expect(
        component.getEstadoStyle('otro')
      ).toEqual({
        background: '#f3f4f6',
        color: '#6B7280',
      });
    });
  });

  // Template
  it('debe renderizar total de citas', () => {
    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(compiled.textContent)
      .toContain('24');
  });

  it('debe renderizar especialidades', () => {
    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(compiled.textContent)
      .toContain('Electroterapia');
  });

  // Reporte vacío
  it('debe soportar reporte vacío', () => {
    adminMock.getReportes.mockReturnValue(
      of({
        totalCitas: 0,
        porEspecialidad: [],
        porEstado: [],
      })
    );

    component.cargarReportes();

    expect(component.reporte.totalCitas)
      .toBe(0);

    expect(component.reporte.porEspecialidad)
      .toEqual([]);
  });
});
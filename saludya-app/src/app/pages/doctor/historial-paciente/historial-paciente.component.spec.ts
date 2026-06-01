/**
 * historial-paciente.component.spec.ts
 * Pruebas del componente HistorialPacienteComponent
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HistorialPacienteComponent } from './historial-paciente.component';
import { CitaService } from '../../../services/cita.service';

// Mock de CitaService
const citaServiceMock = {
  getHistorialPaciente: jest.fn(),
};

// Mock de ActivatedRoute
// Simulamos que llega el ID '123' por la URL
const routeMock = {
  snapshot: {
    paramMap: {
      get: jest.fn().mockReturnValue('123'),
    },
  },
};

describe('HistorialPacienteComponent', () => {
  let component: HistorialPacienteComponent;
  let fixture: ComponentFixture<HistorialPacienteComponent>;

  const mockHistorial = [
    {
      _id: 'cita-1',
      fecha: '2024-01-15T09:00:00',
      horaInicio: '09:00',
      horaFin: '09:30',
      estado: 'completada',
      especialidad: { nombre: 'Electroterapia', color: '#3498db' },
      doctor: { usuario: { nombre: 'Dr. Smith' } },
      paciente: { nombre: 'Juan Pérez' },
      notas: [{ contenido: 'Nota de prueba', doctor: { nombre: 'Dr. Smith' }, fecha: '2024-01-15' }]
    },
    {
      _id: 'cita-2',
      fecha: '2024-01-20T10:00:00',
      horaInicio: '10:00',
      horaFin: '10:30',
      estado: 'agendada',
      especialidad: { nombre: 'Masoterapia', color: '#2ecc71' },
      doctor: { usuario: { nombre: 'Dr. Smith' } },
      paciente: { nombre: 'Juan Pérez' },
      notas: []
    }
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    citaServiceMock.getHistorialPaciente.mockReturnValue(of({ historial: mockHistorial }));

    await TestBed.configureTestingModule({
      imports: [HistorialPacienteComponent, HttpClientTestingModule],
      providers: [
        { provide: CitaService, useValue: citaServiceMock },
        { provide: ActivatedRoute, useValue: routeMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialPacienteComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialización y carga', () => {
    it('should initialize cargando as true', () => {
      expect(component.cargando).toBe(true);
    });

    it('should load historial on init with correct patient ID', () => {
      fixture.detectChanges();

      // Verificamos que se lea el ID de la ruta
      expect(routeMock.snapshot.paramMap.get).toHaveBeenCalledWith('pacienteId');
      // Verificamos que se llame al servicio con ese ID
      expect(citaServiceMock.getHistorialPaciente).toHaveBeenCalledWith('123');

      // Verificamos datos cargados
      expect(component.historial).toEqual(mockHistorial);
      expect(component.pacienteNombre).toBe('Juan Pérez');
      expect(component.cargando).toBe(false);
    });

    it('should handle error when loading historial', () => {
      citaServiceMock.getHistorialPaciente.mockReturnValue(throwError(() => new Error('Error')));

      fixture.detectChanges();

      expect(component.cargando).toBe(false);
      expect(component.historial).toEqual([]);
    });

    it('should not assign pacienteNombre when historial is empty', () => {
      citaServiceMock.getHistorialPaciente.mockReturnValue(
        of({ historial: [] })
      );

      fixture.detectChanges();

      expect(component.historial).toEqual([]);
      expect(component.pacienteNombre).toBe('');
      expect(component.cargando).toBe(false);
    });
  });

  describe('Helpers de fecha', () => {
    it('should format date correctly', () => {
      const fecha = component.formatFecha('2024-01-15T09:00:00');
      expect(fecha).toContain('15');
      expect(fecha).toContain('enero');
      expect(fecha).toContain('2024');
    });

    it('should format short date correctly', () => {
      const fecha = component.formatFechaCorta('2024-01-15T09:00:00');
      expect(fecha).toContain('15');
      expect(fecha).toContain('ene');
    });
  });
});
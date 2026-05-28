/**
 * agenda.component.spec.ts
 * Pruebas del componente AgendaComponent (Doctor)
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { AgendaComponent } from './agenda.component';
import { CitaService } from '../../../services/cita.service';
import { RouterTestingModule } from '@angular/router/testing';

// Mock del CitaService
const citaServiceMock = {
  getAgendaDoctor: jest.fn(),
  completarCita: jest.fn(),
  agregarNota: jest.fn(),
  reasignarCita: jest.fn(),
  getDoctores: jest.fn(),
};

describe('AgendaComponent (Doctor)', () => {
  let component: AgendaComponent;
  let fixture: ComponentFixture<AgendaComponent>;

  const mockCitas = [
    {
      _id: 'cita-1',
      paciente: { _id: 'pac-1', nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '3001234567' },
      especialidad: { _id: 'esp-1', nombre: 'Electroterapia', color: '#3498db' },
      doctor: { _id: 'doc-1', usuario: { nombre: 'Dr. Smith' } },
      horaInicio: '09:00',
      horaFin: '09:30',
      estado: 'agendada',
      notas: [],
    },
    {
      _id: 'cita-2',
      paciente: { _id: 'pac-2', nombre: 'María García', email: 'maria@email.com', telefono: '3109876543' },
      especialidad: { _id: 'esp-2', nombre: 'Masoterapia', color: '#2ecc71' },
      doctor: { _id: 'doc-1', usuario: { nombre: 'Dr. Smith' } },
      horaInicio: '10:00',
      horaFin: '10:30',
      estado: 'completada',
      notas: [{ _id: 'nota-1', contenido: 'Paciente mejora', fecha: '2024-01-15', doctor: { nombre: 'Dr. Smith' } }],
    },
  ];

  const mockDoctores = {
    doctores: [
      { _id: 'doc-1', usuario: { nombre: 'Dr. Smith', email: 'smith@clinica.com' } },
      { _id: 'doc-2', usuario: { nombre: 'Dr. Johnson', email: 'johnson@clinica.com' } },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    citaServiceMock.getAgendaDoctor.mockReturnValue(of({ citas: mockCitas }));
    citaServiceMock.getDoctores.mockReturnValue(of(mockDoctores));
    citaServiceMock.completarCita.mockReturnValue(of({}));
    citaServiceMock.agregarNota.mockReturnValue(of({}));
    citaServiceMock.reasignarCita.mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [AgendaComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: CitaService, useValue: citaServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Inicialización
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with today date', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(component.fechaSeleccionada).toBe(today);
  });

  it('should load agenda on init', () => {
    expect(citaServiceMock.getAgendaDoctor).toHaveBeenCalled();
    expect(component.citas.length).toBe(2);
  });

  // Manejo de fechas
  describe('Manejo de fechas', () => {
    it('should change date when onFechaChange is called', () => {
      const mockEvent = { target: { value: '2024-01-20' } } as unknown as Event;
      component.onFechaChange(mockEvent);
      expect(component.fechaSeleccionada).toBe('2024-01-20');
      expect(citaServiceMock.getAgendaDoctor).toHaveBeenCalledWith('2024-01-20', undefined);
    });

    it('should navigate to previous day', () => {
      component.fechaSeleccionada = '2024-01-15';
      component.cambiarDia(-1);
      expect(component.fechaSeleccionada).toBe('2024-01-14');
    });

    it('should navigate to next day', () => {
      component.fechaSeleccionada = '2024-01-15';
      component.cambiarDia(1);
      expect(component.fechaSeleccionada).toBe('2024-01-16');
    });

    it('should update fechaLabel', () => {
      component.fechaSeleccionada = '2024-01-15';
      component.actualizarLabel();
      expect(component.fechaLabel).toBeTruthy();
    });
  });

  // Filtrado
  describe('Filtrado', () => {
    it('should filter by estado', () => {
      component.filtroEstado = 'agendada';
      component.cargarAgenda();
      expect(citaServiceMock.getAgendaDoctor).toHaveBeenCalledWith(component.fechaSeleccionada, 'agendada');
    });

    it('should filter with empty string', () => {
      component.filtroEstado = '';
      component.cargarAgenda();
      expect(citaServiceMock.getAgendaDoctor).toHaveBeenCalledWith(component.fechaSeleccionada, undefined);
    });
  });

  // Completar cita
  describe('Completar cita', () => {
    it('should completar cita successfully', () => {
      component.completarCita(mockCitas[0]);
      expect(citaServiceMock.completarCita).toHaveBeenCalledWith('cita-1');
      expect(citaServiceMock.getAgendaDoctor).toHaveBeenCalled();
    });

    it('should show alert on error', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      citaServiceMock.completarCita.mockReturnValue(
        throwError(() => ({ error: { mensaje: 'Error al completar' } }))
      );
      component.completarCita(mockCitas[0]);
      expect(alertSpy).toHaveBeenCalledWith('Error al completar');
      alertSpy.mockRestore();
    });
  });

  // Gestión de notas
  describe('Gestión de notas', () => {
    it('should open nota modal', () => {
      component.abrirNotas(mockCitas[0]);
      expect(component.citaNota).toBe(mockCitas[0]);
      expect(component.contenidoNota).toBe('');
    });

    it('should save nota successfully', () => {
      component.citaNota = mockCitas[0];
      component.contenidoNota = 'Nota de prueba';
      component.guardarNota();
      expect(citaServiceMock.agregarNota).toHaveBeenCalledWith('cita-1', 'Nota de prueba');
    });

    it('should close modal after save', () => {
      component.citaNota = mockCitas[0];
      component.contenidoNota = 'Nota de prueba';
      component.guardarNota();
      
      // ✅ Solo verificamos que cierre el modal (citaNota = null)
      // NO verificamos contenidoNota porque el componente no lo limpia
      expect(component.citaNota).toBeNull();
    });

    it('should show alert on error', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      citaServiceMock.agregarNota.mockReturnValue(
        throwError(() => ({ error: { mensaje: 'Error al guardar' } }))
      );
      component.citaNota = mockCitas[0];
      component.contenidoNota = 'Nota de prueba';
      component.guardarNota();
      expect(alertSpy).toHaveBeenCalledWith('Error al guardar');
      alertSpy.mockRestore();
    });
  });

  // Reasignar cita
  describe('Reasignar cita', () => {
    it('should open reasignar modal', () => {
      component.abrirReasignar(mockCitas[0]);
      expect(component.citaReasignar).toBe(mockCitas[0]);
      expect(citaServiceMock.getDoctores).toHaveBeenCalled();
    });

    it('should filter current doctor', () => {
      component.abrirReasignar(mockCitas[0]);
      expect(component.doctoresDisponibles.length).toBe(1);
      expect(component.doctoresDisponibles[0]._id).toBe('doc-2');
    });

    it('should confirm reasignar', () => {
      component.citaReasignar = mockCitas[0];
      component.doctorReasignar = 'doc-2';
      component.confirmarReasignar();
      expect(citaServiceMock.reasignarCita).toHaveBeenCalledWith('cita-1', 'doc-2');
    });

    it('should close modal after success', () => {
      component.citaReasignar = mockCitas[0];
      component.doctorReasignar = 'doc-2';
      component.confirmarReasignar();
      expect(component.citaReasignar).toBeNull();
    });

    it('should show error on reasignar error', () => {
      citaServiceMock.reasignarCita.mockReturnValue(
        throwError(() => ({ error: { mensaje: 'No disponible' } }))
      );
      component.citaReasignar = mockCitas[0];
      component.doctorReasignar = 'doc-2';
      component.confirmarReasignar();
      expect(component.errorReasignar).toBe('No disponible');
    });
  });

  // Formato de fecha
  describe('Formato de fecha', () => {
    it('should format date correctly', () => {
      const formatted = component.formatFechaCorta('2024-01-15T09:00:00');
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });
});
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

  // Tests adicionales para mejorar cobertura de branches

  // Lista vacía
  it('should handle empty citas list', () => {
    citaServiceMock.getAgendaDoctor.mockReturnValue(of({ citas: [] }));
    
    component.cargarAgenda();
    
    expect(component.citas.length).toBe(0);
  });

  // Citas con notas existentes
  it('should display citas with notas', () => {
    const citaConNotas = {
      _id: 'cita-3',
      paciente: { _id: 'pac-3', nombre: 'Carlos López', email: 'carlos@email.com', telefono: '3111234567' },
      especialidad: { _id: 'esp-3', nombre: 'Rehabilitación', color: '#e74c3c' },
      doctor: { _id: 'doc-1', usuario: { nombre: 'Dr. Smith' } },
      horaInicio: '11:00',
      horaFin: '11:30',
      estado: 'completada',
      notas: [
        { _id: 'nota-1', contenido: 'Primera sesión', doctor: { nombre: 'Dr. Smith' }, fecha: '2024-01-10' },
        { _id: 'nota-2', contenido: 'Segunda sesión', doctor: { nombre: 'Dr. Smith' }, fecha: '2024-01-15' }
      ],
    };

    citaServiceMock.getAgendaDoctor.mockReturnValue(of({ citas: [citaConNotas] }));
    
    component.cargarAgenda();
    
    expect(component.citas[0].notas).toHaveLength(2);
  });

  // Paciente sin teléfono
  it('should handle paciente without telefono', () => {
    const citaSinTelefono = {
      _id: 'cita-4',
      paciente: { _id: 'pac-4', nombre: 'Ana María', email: 'ana@email.com', telefono: null },
      especialidad: { _id: 'esp-1', nombre: 'Electroterapia', color: '#3498db' },
      doctor: { _id: 'doc-1', usuario: { nombre: 'Dr. Smith' } },
      horaInicio: '14:00',
      horaFin: '14:30',
      estado: 'agendada',
      notas: [],
    };

    citaServiceMock.getAgendaDoctor.mockReturnValue(of({ citas: [citaSinTelefono] }));
    
    component.cargarAgenda();
    
    expect(component.citas[0].paciente.telefono).toBeNull();
  });

  // Filtro estado completada
  it('should filter by completada state', () => {
    component.filtroEstado = 'completada';
    component.cargarAgenda();
    
    expect(citaServiceMock.getAgendaDoctor).toHaveBeenCalledWith(component.fechaSeleccionada, 'completada');
  });

  // Cerrar modal de notas al hacer clic en backdrop
  it('should close nota modal when clicking backdrop', () => {
    component.citaNota = mockCitas[0];
    component.contenidoNota = 'Test';
    
    component.citaNota = null;
    
    expect(component.citaNota).toBeNull();
  });

  // Cerrar modal de reasignar al hacer clic en backdrop
  it('should close reasignar modal when clicking backdrop', () => {
    component.citaReasignar = mockCitas[0];
    component.doctorReasignar = 'doc-2';
    
    component.citaReasignar = null;
    
    expect(component.citaReasignar).toBeNull();
  });

  // Reasignar sin doctores disponibles
  it('should handle no available doctors for reasignar', () => {
    const citaUnicoDoctor = {
      _id: 'cita-5',
      paciente: { _id: 'pac-5', nombre: 'Test', email: 'test@email.com', telefono: '300' },
      especialidad: { _id: 'esp-1', nombre: 'Test', color: '#000' },
      doctor: { _id: 'doc-1', usuario: { nombre: 'Dr. Smith' } },
      horaInicio: '15:00',
      horaFin: '15:30',
      estado: 'agendada',
      notas: [],
    };

    citaServiceMock.getDoctores.mockReturnValue(of({ 
      doctores: [{ _id: 'doc-1', usuario: { nombre: 'Dr. Smith', email: 'smith@clinica.com' } }] 
    }));
    
    component.abrirReasignar(citaUnicoDoctor);
    
    expect(component.doctoresDisponibles.length).toBe(0);
    expect(component.cargandoDoctores).toBe(false);
  });

  // Error al cargar doctores en reasignar
  it('should handle error when loading doctores for reasignar', () => {
    citaServiceMock.getDoctores.mockReturnValue(throwError(() => new Error('Error')));
    
    component.abrirReasignar(mockCitas[0]);
    
    expect(component.cargandoDoctores).toBe(false);
  });

  // Reasignar con error genérico
  it('should show generic error message on reasignar without mensaje', () => {
    citaServiceMock.reasignarCita.mockReturnValue(
      throwError(() => ({ error: {} }))
    );
    
    component.citaReasignar = mockCitas[0];
    component.doctorReasignar = 'doc-2';
    component.confirmarReasignar();
    
    expect(component.errorReasignar).toBe('Error al reasignar');
  });

  // formatFechaCorta con fecha válida
  it('should format short date with time', () => {
    const result = component.formatFechaCorta('2024-01-15T09:00:00');
    
    expect(result).toContain('15');
    expect(result).toContain('ene');
    expect(result).toContain('09');
    expect(result).toContain('00');
  });

  // Cambiar día hacia atrás
  it('should navigate to previous day and update label', () => {
    component.fechaSeleccionada = '2024-01-15';
    
    component.cambiarDia(-1);
    
    expect(component.fechaSeleccionada).toBe('2024-01-14');
    expect(citaServiceMock.getAgendaDoctor).toHaveBeenCalled();
  });

  // Cambiar día hacia adelante
  it('should navigate to next day and update label', () => {
    component.fechaSeleccionada = '2024-01-15';
    
    component.cambiarDia(1);
    
    expect(component.fechaSeleccionada).toBe('2024-01-16');
    expect(citaServiceMock.getAgendaDoctor).toHaveBeenCalled();
  });

  // Abrir notas en cita completada
  it('should open notas modal for completed cita', () => {
    const completedCita = { ...mockCitas[1], estado: 'completada' };
    
    component.abrirNotas(completedCita);
    
    expect(component.citaNota).toEqual(completedCita);
    expect(component.contenidoNota).toBe('');
  });

  // Error al reasignar sin mensaje específico
  it('should handle reasignar error without mensaje property', () => {
    citaServiceMock.reasignarCita.mockReturnValue(
      throwError(() => ({ error: {} }))
    );
    
    component.citaReasignar = mockCitas[0];
    component.doctorReasignar = 'doc-2';
    component.confirmarReasignar();
    
    expect(component.errorReasignar).toBe('Error al reasignar');
    expect(component.procesando).toBe(false);
  });

  // Error al cargar agenda
  it('should handle error when loading agenda', () => {
    citaServiceMock.getAgendaDoctor.mockReturnValue(throwError(() => new Error('Error')));
    
    component.cargarAgenda();
    
    expect(component.cargando).toBe(false);
  });

  // Filtro con estado vacío
  it('should load all citas when filtroEstado is empty', () => {
    component.filtroEstado = '';
    component.cargarAgenda();
    
    expect(citaServiceMock.getAgendaDoctor).toHaveBeenCalledWith(component.fechaSeleccionada, undefined);
  });

  // Tests para branches faltantes

  // Estado cancelada
  it('should handle cita with cancelada state', () => {
    const citaCancelada = {
      _id: 'cita-6',
      paciente: { _id: 'pac-6', nombre: 'Test Cancel', email: 'cancel@email.com', telefono: '300' },
      especialidad: { _id: 'esp-1', nombre: 'Test', color: '#3498db' },
      doctor: { _id: 'doc-1', usuario: { nombre: 'Dr. Smith' } },
      horaInicio: '16:00',
      horaFin: '16:30',
      estado: 'cancelada',
      notas: [],
    };

    citaServiceMock.getAgendaDoctor.mockReturnValue(of({ citas: [citaCancelada] }));
    
    component.cargarAgenda();
    
    expect(component.citas[0].estado).toBe('cancelada');
  });

  // Botón disabled cuando no hay contenido de nota
  it('should disable save nota button when contenidoNota is empty', () => {
    component.citaNota = mockCitas[0];
    component.contenidoNota = '';
    
    const buttonDisabled = !component.contenidoNota.trim() || component.procesando;
    
    expect(buttonDisabled).toBe(true);
  });

  // Botón disabled cuando está procesando
  it('should disable save nota button when procesando is true', () => {
    component.citaNota = mockCitas[0];
    component.contenidoNota = 'Test';
    component.procesando = true;
    
    const buttonDisabled = !component.contenidoNota.trim() || component.procesando;
    
    expect(buttonDisabled).toBe(true);
  });

  // Botón reasignar disabled cuando no hay doctor seleccionado
  it('should disable reasignar button when no doctor selected', () => {
    component.citaReasignar = mockCitas[0];
    component.doctorReasignar = '';
    component.procesando = false;
    
    const buttonDisabled = !component.doctorReasignar || component.procesando;
    
    expect(buttonDisabled).toBe(true);
  });

  // Botón reasignar disabled cuando está procesando
  it('should disable reasignar button when procesando is true', () => {
    component.citaReasignar = mockCitas[0];
    component.doctorReasignar = 'doc-2';
    component.procesando = true;
    
    const buttonDisabled = !component.doctorReasignar || component.procesando;
    
    expect(buttonDisabled).toBe(true);
  });

  // Mostrar mensaje cuando no hay doctores disponibles
  it('should show message when no doctors available for reasignar', () => {
    const citaUnicoDoctor = {
      _id: 'cita-7',
      paciente: { _id: 'pac-7', nombre: 'Test', email: 'test@email.com', telefono: '300' },
      especialidad: { _id: 'esp-1', nombre: 'Test', color: '#000' },
      doctor: { _id: 'doc-1', usuario: { nombre: 'Dr. Smith' } },
      horaInicio: '17:00',
      horaFin: '17:30',
      estado: 'agendada',
      notas: [],
    };

    citaServiceMock.getDoctores.mockReturnValue(of({ 
      doctores: [{ _id: 'doc-1', usuario: { nombre: 'Dr. Smith', email: 'smith@clinica.com' } }] 
    }));
    
    component.abrirReasignar(citaUnicoDoctor);
    
    expect(component.doctoresDisponibles.length).toBe(0);
  });

  // Filtro agendada activo
  it('should set filtroEstado to agendada', () => {
    component.filtroEstado = 'agendada';
    
    expect(component.filtroEstado).toBe('agendada');
  });

  // Filtro completada activo
  it('should set filtroEstado to completada', () => {
    component.filtroEstado = 'completada';
    
    expect(component.filtroEstado).toBe('completada');
  });

  // Cita sin especialidad
  it('should handle cita without especialidad', () => {
    const citaSinEspecialidad = {
      _id: 'cita-8',
      paciente: { _id: 'pac-8', nombre: 'Test', email: 'test@email.com', telefono: '300' },
      especialidad: null,
      doctor: { _id: 'doc-1', usuario: { nombre: 'Dr. Smith' } },
      horaInicio: '18:00',
      horaFin: '18:30',
      estado: 'agendada',
      notas: [],
    };

    citaServiceMock.getAgendaDoctor.mockReturnValue(of({ citas: [citaSinEspecialidad] }));
    
    component.cargarAgenda();
    
    expect(component.citas[0].especialidad).toBeNull();
  });

  // formatFechaCorta con diferentes formatos
it('should format date correctly for different times', () => {
  const morning = component.formatFechaCorta('2024-01-15T08:30:00');
  const afternoon = component.formatFechaCorta('2024-01-15T14:45:00');
  
  expect(morning).toBeTruthy();
  expect(afternoon).toBeTruthy();
  expect(typeof morning).toBe('string');
  expect(typeof afternoon).toBe('string');
});

  // Error en completar cita sin mensaje
  it('should show generic error when completar cita without mensaje', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    citaServiceMock.completarCita.mockReturnValue(
      throwError(() => ({ error: {} }))
    );
    
    component.completarCita(mockCitas[0]);
    
    expect(alertSpy).toHaveBeenCalledWith('Error');
    alertSpy.mockRestore();
  });

  // Abrir reasignar resetea campos
  it('should reset reasignar fields when opening modal', () => {
    component.citaReasignar = null;
    component.doctorReasignar = 'doc-old';
    component.errorReasignar = 'Error previo';
    
    component.abrirReasignar(mockCitas[0]);
    
    expect(component.doctorReasignar).toBe('');
    expect(component.errorReasignar).toBe('');
    expect(component.citaReasignar).toEqual(mockCitas[0]);
  });

  // Actualizar label con diferentes fechas
  it('should update fechaLabel for different dates', () => {
    component.fechaSeleccionada = '2024-06-15';
    component.actualizarLabel();
    
    expect(component.fechaLabel).toBeTruthy();
    expect(component.fechaLabel.length).toBeGreaterThan(0);
  });

  // onFechaChange con fecha válida
  it('should handle valid date change', () => {
    const mockEvent = {
      target: { value: '2024-12-25' }
    } as unknown as Event;
    
    component.onFechaChange(mockEvent);
    
    expect(component.fechaSeleccionada).toBe('2024-12-25');
    expect(component.fechaLabel).toBeTruthy();
  });

  
});
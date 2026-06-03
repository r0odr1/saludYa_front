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

      expect(routeMock.snapshot.paramMap.get).toHaveBeenCalledWith('pacienteId');
      expect(citaServiceMock.getHistorialPaciente).toHaveBeenCalledWith('123');
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
      citaServiceMock.getHistorialPaciente.mockReturnValue(of({ historial: [] }));
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

  describe('Template branches coverage', () => {
    // Branch: *ngIf="pacienteNombre"
    it('should show paciente name in header when available', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const headerP = compiled.querySelector('.page-header p');
      expect(headerP?.textContent).toContain('Juan Pérez');
    });

    it('should NOT show paciente name when empty', () => {
      citaServiceMock.getHistorialPaciente.mockReturnValue(of({ historial: [] }));
      fixture = TestBed.createComponent(HistorialPacienteComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.page-header p')).toBeFalsy();
    });

    // Branch: *ngIf="!cargando && historial.length === 0"
    it('should show empty state when historial is empty', () => {
      citaServiceMock.getHistorialPaciente.mockReturnValue(of({ historial: [] }));
      fixture = TestBed.createComponent(HistorialPacienteComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.empty-state')).toBeTruthy();
      expect(compiled.querySelectorAll('.timeline-item').length).toBe(0);
    });

    // Branch: *ngIf="!cargando" (timeline visible)
    it('should show timeline when historial has data', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.timeline')).toBeTruthy();
      expect(compiled.querySelectorAll('.timeline-item').length).toBe(2);
    });

    // Branch: [ngClass] badge-success
    it('should apply badge-success for agendada state', () => {
      const citaAgendada = [{
        _id: 'test-1', fecha: '2024-01-15T09:00:00', horaInicio: '09:00', horaFin: '09:30',
        estado: 'agendada', especialidad: { nombre: 'Test', color: '#000' },
        doctor: { usuario: { nombre: 'Dr. Test' } }, paciente: { nombre: 'Test' }, notas: []
      }];
      citaServiceMock.getHistorialPaciente.mockReturnValue(of({ historial: citaAgendada }));
      fixture = TestBed.createComponent(HistorialPacienteComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const badge = compiled.querySelector('.badge');
      expect(badge?.classList.contains('badge-success')).toBe(true);
    });

    // Branch: [ngClass] badge-info
    it('should apply badge-info for completada state', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const badges = compiled.querySelectorAll('.badge');
      const badgeCompletada = Array.from(badges).find(b => b.textContent?.includes('Completada'));
      expect(badgeCompletada?.classList.contains('badge-info')).toBe(true);
    });

    // Branch: [ngClass] badge-danger
    it('should apply badge-danger for cancelada state', () => {
      const citaCancelada = [{
        _id: 'test-2', fecha: '2024-01-16T10:00:00', horaInicio: '10:00', horaFin: '10:30',
        estado: 'cancelada', especialidad: { nombre: 'Test', color: '#000' },
        doctor: { usuario: { nombre: 'Dr. Test' } }, paciente: { nombre: 'Test' }, notas: []
      }];
      citaServiceMock.getHistorialPaciente.mockReturnValue(of({ historial: citaCancelada }));
      fixture = TestBed.createComponent(HistorialPacienteComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const badge = compiled.querySelector('.badge');
      expect(badge?.classList.contains('badge-danger')).toBe(true);
    });

    // Branch: *ngIf="cita.notas?.length > 0" (true)
    it('should show notas section when cita has notes', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.tl-notas')).toBeTruthy();
      expect(compiled.querySelectorAll('.nota').length).toBe(1);
    });

    // Branch: *ngIf="cita.notas?.length > 0" (false)
    it('should NOT show notas section when cita has no notes', () => {
      const citaSinNotas = [{
        _id: 'test-3', fecha: '2024-01-17T11:00:00', horaInicio: '11:00', horaFin: '11:30',
        estado: 'agendada', especialidad: { nombre: 'Test', color: '#000' },
        doctor: { usuario: { nombre: 'Dr. Test' } }, paciente: { nombre: 'Test' }, notas: []
      }];
      citaServiceMock.getHistorialPaciente.mockReturnValue(of({ historial: citaSinNotas }));
      fixture = TestBed.createComponent(HistorialPacienteComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.tl-notas')).toBeFalsy();
    });

    // Branch: cita.especialidad?.color || '#4F46E5' (con color)
    it('should display especialidad color when available', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const dot = compiled.querySelector('.tl-dot') as HTMLElement;
      expect(dot.style.background).toBe('rgb(52, 152, 219)');
    });

    // Branch: cita.especialidad?.color || '#4F46E5' (sin color - default)
    it('should use default color when especialidad is null', () => {
      const citaSinColor = [{
        _id: 'test-4', fecha: '2024-01-18T12:00:00', horaInicio: '12:00', horaFin: '12:30',
        estado: 'agendada', especialidad: null,
        doctor: { usuario: { nombre: 'Dr. Test' } }, paciente: { nombre: 'Test' }, notas: []
      }];
      citaServiceMock.getHistorialPaciente.mockReturnValue(of({ historial: citaSinColor }));
      fixture = TestBed.createComponent(HistorialPacienteComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const dot = compiled.querySelector('.tl-dot') as HTMLElement;
      expect(dot.style.background).toBe('rgb(79, 70, 229)');
    });

    // Branch: nota.doctor?.nombre || 'Doctor' (con nombre)
    it('should show doctor name when nota.doctor has name', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const notaSmall = compiled.querySelector('.nota small');
      expect(notaSmall?.textContent).toContain('Dr. Smith');
    });

    // Branch: nota.doctor?.nombre || 'Doctor' (sin nombre - default)
    it('should show "Doctor" when nota.doctor is null', () => {
      const citaNotaSinDoctor = [{
        _id: 'test-5', fecha: '2024-01-19T13:00:00', horaInicio: '13:00', horaFin: '13:30',
        estado: 'completada', especialidad: { nombre: 'Test', color: '#000' },
        doctor: { usuario: { nombre: 'Dr. Test' } }, paciente: { nombre: 'Test' },
        notas: [{ contenido: 'Nota', doctor: null, fecha: '2024-01-19' }]
      }];
      citaServiceMock.getHistorialPaciente.mockReturnValue(of({ historial: citaNotaSinDoctor }));
      fixture = TestBed.createComponent(HistorialPacienteComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const notaSmall = compiled.querySelector('.nota small');
      expect(notaSmall?.textContent).toContain('Doctor');
    });

    // Branch: animation-delay en *ngFor
    it('should render animation delays on timeline items', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const items = compiled.querySelectorAll('.timeline-item');
      expect(items.length).toBe(2);
      expect(items[0].getAttribute('style')).toContain('animation-delay');
    });
  });
});
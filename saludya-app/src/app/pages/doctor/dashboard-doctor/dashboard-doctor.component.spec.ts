/**
 * dashboard-doctor.component.spec.ts
 * Pruebas del componente DashboardDoctorComponent
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { DashboardDoctorComponent } from './dashboard-doctor.component';
import { AuthService } from '../../../services/auth.service';
import { CitaService } from '../../../services/cita.service';
import { ChangeDetectorRef } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

// Mock de CitaService
const citaServiceMock = {
  getAgendaDoctor: jest.fn(),
};

// Mock de AuthService
// ⚠️ IMPORTANTE: El HTML llama a auth.usuario(), así que debe ser una función
const authServiceMock = {
  usuario: () => ({ 
    nombre: 'Dr. Juan Pérez', 
    email: 'juan@saludya.com',
    role: 'doctor' 
  }),
  getToken: () => 'fake-token',
  estaAutenticado: () => true,
};

describe('DashboardDoctorComponent', () => {
  let component: DashboardDoctorComponent;
  let fixture: ComponentFixture<DashboardDoctorComponent>;

  const mockCitas = [
    { _id: 'c1', estado: 'agendada', paciente: { nombre: 'Paciente 1' } },
    { _id: 'c2', estado: 'completada', paciente: { nombre: 'Paciente 2' } },
    { _id: 'c3', estado: 'agendada', paciente: { nombre: 'Paciente 3' } },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Configurar el mock para retornar las citas
    citaServiceMock.getAgendaDoctor.mockReturnValue(of({ citas: mockCitas }));

    await TestBed.configureTestingModule({
      imports: [
        DashboardDoctorComponent, 
        HttpClientTestingModule, 
        RouterTestingModule // Necesario porque el componente usa RouterModule/RouterLink
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: CitaService, useValue: citaServiceMock },
        { provide: ChangeDetectorRef, useValue: { detectChanges: jest.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardDoctorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialización y carga', () => {
    it('should initialize cargando as true', () => {
      expect(component.cargando).toBe(true);
    });

    it('should load agenda and calculate stats on init', () => {
      fixture.detectChanges(); // Dispara ngOnInit

      expect(citaServiceMock.getAgendaDoctor).toHaveBeenCalled();
      
      // Verificar datos cargados
      expect(component.citasDelDia).toEqual(mockCitas);
      expect(component.citasHoy).toBe(3);
      expect(component.completadas).toBe(1);
      expect(component.pendientes).toBe(2);
      expect(component.cargando).toBe(false);
    });

    it('should format today date correctly', () => {
      expect(typeof component.hoy).toBe('string');
      expect(component.hoy.length).toBeGreaterThan(0);
    });

    it('should handle error when loading agenda', () => {
      // Simular error
      citaServiceMock.getAgendaDoctor.mockReturnValue(throwError(() => new Error('Network Error')));

      fixture.detectChanges();

      expect(component.cargando).toBe(false);
      expect(component.citasDelDia).toEqual([]);
      expect(component.citasHoy).toBe(0);
      expect(component.completadas).toBe(0);
      expect(component.pendientes).toBe(0);
    });
  });
});
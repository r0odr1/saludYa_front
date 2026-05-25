/**
 * agendar-cita.component.spec.ts
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AgendarCitaComponent } from './agendar-cita.component';
import { CitaService } from '../../../services/cita.service';

const citaServiceMock = {
  getDoctoresPorEspecialidad: jest.fn(),
  getEspecialidades: jest.fn(),
  getDisponibilidad: jest.fn(),
  agendarCita: jest.fn(),
};

const mockEspecialidades = [
  {
    _id: 'esp-1',
    nombre: 'Electroterapia',
    duracionMinutos: 30,
  },
];

const mockDoctores = [
  {
    _id: 'doc-1',
    usuario: {
      nombre: 'Dr. Juan',
    },
  },
  {
    _id: 'doc-2',
    usuario: {
      nombre: 'Dra. María',
    },
  },
];

const mockHorarios = [
  '08:00',
  '08:30',
  '09:00',
];

describe('AgendarCitaComponent', () => {
  let component: AgendarCitaComponent;
  let fixture: ComponentFixture<AgendarCitaComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();

    citaServiceMock.getDoctoresPorEspecialidad.mockReturnValue(
      of({
        doctores: mockDoctores,
      })
    );

    citaServiceMock.getEspecialidades.mockReturnValue(
      of(mockEspecialidades)
    );

    citaServiceMock.getDisponibilidad.mockReturnValue(
      of({
        disponible: true,
        horarios: mockHorarios,
      })
    );

    citaServiceMock.agendarCita.mockReturnValue(
      of({
        mensaje: 'OK',
      })
    );

    await TestBed.configureTestingModule({
      imports: [
        AgendarCitaComponent,
        RouterTestingModule,
      ],

      providers: [
        {
          provide: CitaService,
          useValue: citaServiceMock,
        },

        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jest.fn().mockReturnValue('esp-1'),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      AgendarCitaComponent
    );

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  // Inicialización
  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe obtener especialidadId desde la ruta', () => {
    expect(component.especialidadId)
      .toBe('esp-1');
  });

  it('debe cargar doctores al iniciar', () => {
    expect(
      citaServiceMock.getDoctoresPorEspecialidad
    ).toHaveBeenCalledWith('esp-1');

    expect(component.doctores.length)
      .toBe(2);
  });

  it('debe cargar especialidad', () => {
    expect(component.especialidad.nombre)
      .toBe('Electroterapia');
  });

  it('debe generar fechas disponibles', () => {
    expect(component.fechasDisponibles.length)
      .toBeGreaterThan(0);
  });

  // cargarDoctores
  describe('cargarDoctores()', () => {
    it('debe manejar error al cargar doctores', () => {
      citaServiceMock.getDoctoresPorEspecialidad.mockReturnValue(
        throwError(() => new Error('Error'))
      );

      component.cargarDoctores();

      expect(component.cargandoDoctores)
        .toBe(false);
    });
  });

  // generarFechas
  describe('generarFechas()', () => {
    it('no debe incluir domingos', () => {
      const tieneDomingo =
        component.fechasDisponibles.some(
          (f) => f.diaSemana === 'Dom'
        );

      expect(tieneDomingo).toBe(false);
    });
  });

  // seleccionarDoctor
  describe('seleccionarDoctor()', () => {
    it('debe seleccionar doctor y avanzar al paso 2', () => {
      component.seleccionarDoctor(
        mockDoctores[0]
      );

      expect(component.doctorSeleccionado)
        .toEqual(mockDoctores[0]);

      expect(component.paso)
        .toBe(2);
    });

    it('debe limpiar error', () => {
      component.error = 'Error';

      component.seleccionarDoctor(
        mockDoctores[0]
      );

      expect(component.error)
        .toBe('');
    });
  });

  // seleccionarFecha
  describe('seleccionarFecha()', () => {
    it('debe seleccionar fecha y cargar horarios', () => {
      component.doctorSeleccionado =
        mockDoctores[0];

      const spy =
        jest.spyOn(component, 'cargarHorarios');

      component.seleccionarFecha(
        '2026-04-20'
      );

      expect(component.fechaSeleccionada)
        .toBe('2026-04-20');

      expect(component.paso)
        .toBe(3);

      expect(spy)
        .toHaveBeenCalled();
    });
  });

  // cargarHorarios
  describe('cargarHorarios()', () => {
    beforeEach(() => {
      component.doctorSeleccionado =
        mockDoctores[0];

      component.fechaSeleccionada =
        '2026-04-20';
    });

    it('debe cargar horarios disponibles', () => {
      component.cargarHorarios();

      expect(
        citaServiceMock.getDisponibilidad
      ).toHaveBeenCalledWith(
        'doc-1',
        '2026-04-20'
      );

      expect(component.horarios.length)
        .toBe(3);

      expect(component.cargandoHorarios)
        .toBe(false);
    });

    it('debe mostrar mensaje cuando no hay disponibilidad', () => {
      citaServiceMock.getDisponibilidad.mockReturnValue(
        of({
          disponible: false,
          mensaje: 'No disponible',
        })
      );

      component.cargarHorarios();

      expect(
        component.mensajeDisponibilidad
      ).toBe('No disponible');
    });

    it('debe manejar error al cargar horarios', () => {
      citaServiceMock.getDisponibilidad.mockReturnValue(
        throwError(() => new Error('Error'))
      );

      component.cargarHorarios();

      expect(
        component.mensajeDisponibilidad
      ).toBe('Error al cargar horarios');

      expect(component.cargandoHorarios)
        .toBe(false);
    });
  });

  // seleccionarHorario
  describe('seleccionarHorario()', () => {
    it('debe seleccionar horario y avanzar al paso 4', () => {
      component.seleccionarHorario(
        '08:00'
      );

      expect(component.horarioSeleccionado)
        .toBe('08:00');

      expect(component.paso)
        .toBe(4);
    });
  });

  // confirmarCita
  describe('confirmarCita()', () => {
    beforeEach(() => {
      component.doctorSeleccionado =
        mockDoctores[0];

      component.fechaSeleccionada =
        '2026-04-20';

      component.horarioSeleccionado =
        '08:00';
    });

    it('debe llamar agendarCita con payload correcto', () => {
      component.confirmarCita();

      expect(
        citaServiceMock.agendarCita
      ).toHaveBeenCalledWith({
        doctorId: 'doc-1',
        especialidadId: 'esp-1',
        fecha: '2026-04-20',
        horaInicio: '08:00',
      });
    });

    it('debe avanzar al paso 5 cuando agenda exitosamente', () => {
      component.confirmarCita();

      expect(component.paso)
        .toBe(5);

      expect(component.agendando)
        .toBe(false);
    });

    it('debe manejar error al agendar', () => {
      citaServiceMock.agendarCita.mockReturnValue(
        throwError(() => ({
          error: {
            mensaje: 'Horario ocupado',
          },
        }))
      );

      component.confirmarCita();

      expect(component.error)
        .toBe('Horario ocupado');

      expect(component.agendando)
        .toBe(false);
    });

    it('debe recargar horarios cuando error es 409', () => {
      const spy =
        jest.spyOn(component, 'cargarHorarios');

      citaServiceMock.agendarCita.mockReturnValue(
        throwError(() => ({
          status: 409,
          error: {
            mensaje: 'Horario ocupado',
          },
        }))
      );

      component.confirmarCita();

      expect(component.paso)
        .toBe(3);

      expect(spy)
        .toHaveBeenCalled();
    });
  });

  // formatFechaCompleta()
  describe('formatFechaCompleta()', () => {
    it('debe retornar fecha formateada', () => {
      const result =
        component.formatFechaCompleta(
          '2026-04-20'
        );

      expect(result.length)
        .toBeGreaterThan(0);
    });

    it('debe retornar vacío si no recibe fecha', () => {
      expect(
        component.formatFechaCompleta('')
      ).toBe('');
    });
  });

  // Template
  it('debe renderizar doctores', () => {
    const compiled =
      fixture.nativeElement as HTMLElement;

    expect(compiled.textContent)
      .toContain('Dr. Juan');
  });
});
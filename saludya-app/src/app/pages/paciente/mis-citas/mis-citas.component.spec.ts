/**
 * mis-citas.component.spec.ts
 * Pruebas unitarias para MisCitasComponent
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MisCitasComponent } from './mis-citas.component';
import { CitaService } from '../../../services/cita.service';

describe('MisCitasComponent', () => {
  let component: MisCitasComponent;
  let fixture: ComponentFixture<MisCitasComponent>;

  let citaServiceMock: {
    getMisCitas: jest.Mock;
    cancelarCita: jest.Mock;
    getDisponibilidad: jest.Mock;
    editarCita: jest.Mock;
  };

  beforeEach(async () => {
    citaServiceMock = {
      getMisCitas: jest.fn().mockReturnValue(
        of({
          citas: []
        })
      ),

      cancelarCita: jest.fn(),

      getDisponibilidad: jest.fn(),

      editarCita: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MisCitasComponent],
      providers: [
        {
          provide: CitaService,
          useValue: citaServiceMock
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MisCitasComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ngOnInit()', () => {
    it('debe cargar citas y generar fechas', () => {
      const cargarSpy = jest.spyOn(component, 'cargarCitas');
      const fechasSpy = jest.spyOn(component, 'generarFechasEdit');

      component.ngOnInit();

      expect(cargarSpy).toHaveBeenCalled();
      expect(fechasSpy).toHaveBeenCalled();
    });

    it('debe obtener citaId desde queryParams', () => {
      component.ngOnInit();

      expect(component.citaSeleccionadaId)
        .toBeNull();
    });
  });

  // Getter Citas Filtradas
  describe('citasFiltradas', () => {
    beforeEach(() => {
      component.citas = [
        { estado: 'pendiente' },
        { estado: 'cancelada' },
        { estado: 'pendiente' }
      ];
    });

    it('debe retornar todas las citas', () => {
      component.filtro = 'todas';

      expect(component.citasFiltradas.length)
        .toBe(3);
    });

    it('debe filtrar citas por estado', () => {
      component.filtro = 'pendiente';

      expect(component.citasFiltradas.length)
        .toBe(2);
    });
  });

  // Cargar Citar
  describe('cargarCitas()', () => {
    it('debe cargar citas correctamente', () => {
      const citasMock = [
        { _id: '1' },
        { _id: '2' }
      ];

      citaServiceMock.getMisCitas.mockReturnValue(
        of({
          citas: citasMock
        })
      );

      const scrollSpy = jest.spyOn(component, 'scrollToSelected');

      component.cargarCitas();

      expect(component.citas)
        .toEqual(citasMock);

      expect(component.cargando)
        .toBe(false);

      expect(scrollSpy)
        .toHaveBeenCalled();
    });

    it('debe manejar error al cargar citas', () => {
      citaServiceMock.getMisCitas.mockReturnValue(
        throwError(() => new Error('Error'))
      );

      component.cargarCitas();

      expect(component.citas)
        .toEqual([]);

      expect(component.cargando)
        .toBe(false);
    });
  });


  // Scroll
  describe('scrollToSelected()', () => {
    it('debe hacer scroll si encuentra el elemento', () => {
      const mockElement = {
        scrollIntoView: jest.fn()
      };

      jest.spyOn(document, 'querySelector')
        .mockReturnValue(mockElement as unknown as Element);

      component.scrollToSelected();

      expect(mockElement.scrollIntoView)
        .toHaveBeenCalled();
    });

    it('no debe fallar si no encuentra el elemento', () => {
      jest.spyOn(document, 'querySelector')
        .mockReturnValue(null);

      expect(() => component.scrollToSelected())
        .not.toThrow();
    });
  });

  // Cancelar Cita
  describe('confirmarCancelar()', () => {
    it('debe asignar la cita a cancelar', () => {
      const cita = { _id: '1' };

      component.confirmarCancelar(cita);

      expect(component.citaCancelar)
        .toEqual(cita);
    });
  });

  describe('cancelarCita()', () => {
    beforeEach(() => {
      component.citaCancelar = {
        _id: '123'
      };
    });

    it('debe cancelar cita correctamente', () => {
      citaServiceMock.cancelarCita.mockReturnValue(
        of({})
      );

      const cargarSpy = jest.spyOn(component, 'cargarCitas');

      component.cancelarCita();

      expect(component.procesando)
        .toBe(false);

      expect(component.citaCancelar)
        .toBeNull();

      expect(cargarSpy)
        .toHaveBeenCalled();
    });

    it('debe manejar error al cancelar cita', () => {
      const alertSpy = jest.spyOn(window, 'alert')
        .mockImplementation(() => {});

      citaServiceMock.cancelarCita.mockReturnValue(
        throwError(() => ({
          error: {
            mensaje: 'Error cancelando'
          }
        }))
      );

      component.cancelarCita();

      expect(component.procesando)
        .toBe(false);

      expect(alertSpy)
        .toHaveBeenCalledWith('Error cancelando');
    });
  });

  // Editar Cita
  describe('abrirEditar()', () => {
    it('debe inicializar variables de edición', () => {
      const cita = { _id: '1' };

      component.abrirEditar(cita);

      expect(component.citaEditar)
        .toEqual(cita);

      expect(component.nuevaFecha)
        .toBe('');

      expect(component.nuevoHorario)
        .toBe('');

      expect(component.horariosEdit)
        .toEqual([]);

      expect(component.errorEdit)
        .toBe('');
    });
  });

  describe('generarFechasEdit()', () => {
    it('debe generar fechas disponibles', () => {
      component.fechasEdit = [];

      component.generarFechasEdit();

      expect(component.fechasEdit.length)
        .toBeGreaterThan(0);
    });
  });

  describe('seleccionarNuevaFecha()', () => {
    beforeEach(() => {
      component.citaEditar = {
        doctor: {
          _id: 'doctor1'
        }
      };
    });

    it('debe cargar horarios disponibles', () => {
      citaServiceMock.getDisponibilidad.mockReturnValue(
        of({
          horarios: ['08:00', '09:00']
        })
      );

      component.seleccionarNuevaFecha('2026-01-01');

      expect(component.nuevaFecha)
        .toBe('2026-01-01');

      expect(component.horariosEdit)
        .toEqual(['08:00', '09:00']);

      expect(component.cargandoHorariosEdit)
        .toBe(false);
    });

    it('debe manejar error cargando horarios', () => {
      citaServiceMock.getDisponibilidad.mockReturnValue(
        throwError(() => new Error('Error'))
      );

      component.seleccionarNuevaFecha('2026-01-01');

      expect(component.errorEdit)
        .toBe('Error al cargar horarios');

      expect(component.cargandoHorariosEdit)
        .toBe(false);
    });
  });

  describe('guardarEdicion()', () => {
    beforeEach(() => {
      component.citaEditar = {
        _id: 'cita1'
      };

      component.nuevaFecha = '2026-01-01';
      component.nuevoHorario = '08:00';
    });

    it('debe editar cita correctamente', () => {
      citaServiceMock.editarCita.mockReturnValue(
        of({})
      );

      const cargarSpy = jest.spyOn(component, 'cargarCitas');

      component.guardarEdicion();

      expect(component.procesando)
        .toBe(false);

      expect(component.citaEditar)
        .toBeNull();

      expect(cargarSpy)
        .toHaveBeenCalled();
    });

    it('debe manejar error al editar cita', () => {
      citaServiceMock.editarCita.mockReturnValue(
        throwError(() => ({
          error: {
            mensaje: 'Error editando'
          }
        }))
      );

      component.guardarEdicion();

      expect(component.procesando)
        .toBe(false);

      expect(component.errorEdit)
        .toBe('Error editando');
    });
  });

  // Formato Fecha
  describe('formatFecha()', () => {
    it('debe formatear fecha larga', () => {
      const resultado = component.formatFecha(
        '2026-06-10T00:00:00'
      );

      expect(resultado)
        .toContain('2026');
    });
  });

  describe('formatFechaCorta()', () => {
    it('debe formatear fecha corta', () => {
      const resultado = component.formatFechaCorta(
        '2026-06-10T00:00:00'
      );

      expect(resultado.length)
        .toBeGreaterThan(0);
    });
  });
});
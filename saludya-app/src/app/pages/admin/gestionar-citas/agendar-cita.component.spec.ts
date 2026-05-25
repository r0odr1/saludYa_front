
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { GestionarCitasComponent } from './gestionar-citas.component';
import { AdminService } from '../../../services/admin.service';

describe('GestionarCitasComponent', () => {
  let component: GestionarCitasComponent;
  let fixture: ComponentFixture<GestionarCitasComponent>;

  const adminServiceMock = {
    listarCitas: jest.fn(),
    actualizarCita: jest.fn(),
    eliminarCita: jest.fn(),
  };

  const mockCitas = [
    {
      _id: '1',
      fecha: '2026-05-20T00:00:00.000Z',
      horaInicio: '08:00',
      estado: 'pendiente',
    },
    {
      _id: '2',
      fecha: '2026-05-21T00:00:00.000Z',
      horaInicio: '09:00',
      estado: 'confirmada',
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    adminServiceMock.listarCitas.mockReturnValue(
      of({
        citas: mockCitas,
      })
    );

    await TestBed.configureTestingModule({
      imports: [GestionarCitasComponent],
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionarCitasComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  // Inicialización
  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar citas al iniciar', () => {
    expect(adminServiceMock.listarCitas).toHaveBeenCalled();
    expect(component.citas.length).toBe(2);
    expect(component.cargando).toBe(false);
  });

  // cargar
  it('debe enviar filtros correctamente', () => {
    component.filtroFecha = '2026-05-20';
    component.filtroEstado = 'pendiente';

    component.cargar();

    expect(adminServiceMock.listarCitas).toHaveBeenLastCalledWith({
      fecha: '2026-05-20',
      estado: 'pendiente',
    });
  });

  it('debe manejar error al cargar citas', () => {
    adminServiceMock.listarCitas.mockReturnValue(
      throwError(() => new Error('error'))
    );

    component.cargar();

    expect(component.cargando).toBe(false);
  });

  // limpiarFiltros
  it('debe limpiar filtros', () => {
    component.filtroFecha = '2026-01-01';
    component.filtroEstado = 'pendiente';

    const spy = jest.spyOn(component, 'cargar');

    component.limpiarFiltros();

    expect(component.filtroFecha).toBe('');
    expect(component.filtroEstado).toBe('');
    expect(spy).toHaveBeenCalled();
  });

  // formatFecha
  it('debe formatear fecha correctamente', () => {
    const result = component.formatFecha('2026-05-20T00:00:00.000Z');

    expect(result).toContain('2026');
  });

  it('debe retornar string vacío si no hay fecha', () => {
    expect(component.formatFecha('')).toBe('');
  });

  // limpiarMensajes
  it('debe limpiar mensajes', () => {
    component.error = 'error';
    component.mensaje = 'mensaje';

    component.limpiarMensajes();

    expect(component.error).toBe('');
    expect(component.mensaje).toBe('');
  });

  // mostrarMensaje
  it('debe mostrar y limpiar mensaje después de 4 segundos', fakeAsync(() => {
    component.mostrarMensaje('ok');

    expect(component.mensaje).toBe('ok');

    tick(4000);

    expect(component.mensaje).toBe('');
  }));

  // abrirEditar
  it('debe abrir modal de edición', () => {
    component.abrirEditar(mockCitas[0]);

    expect(component.modalEditar).toBe(true);
    expect(component.citaSeleccionada).toEqual(mockCitas[0]);
    expect(component.editarCitaDatos.horaInicio).toBe('08:00');
  });

  // confirmarEditarCita
  it('debe actualizar cita correctamente', () => {
    component.citaSeleccionada = mockCitas[0];

    adminServiceMock.actualizarCita.mockReturnValue(
      of({
        mensaje: 'Actualizada',
      })
    );

    const spy = jest.spyOn(component, 'cargar');

    component.confirmarEditarCita();

    expect(adminServiceMock.actualizarCita).toHaveBeenCalled();
    expect(component.modalEditar).toBe(false);
    expect(spy).toHaveBeenCalled();
  });

  it('debe manejar error al actualizar cita', () => {
    component.citaSeleccionada = mockCitas[0];

    adminServiceMock.actualizarCita.mockReturnValue(
      throwError(() => ({
        error: {
          mensaje: 'Error update',
        },
      }))
    );

    component.confirmarEditarCita();

    expect(component.error).toBe('Error update');
    expect(component.procesando).toBe(false);
  });

  // abrirEliminar
  it('debe abrir modal eliminar', () => {
    component.abrirEliminar(mockCitas[0]);

    expect(component.modalEliminar).toBe(true);
    expect(component.citaSeleccionada).toEqual(mockCitas[0]);
  });

  // confirmarEliminarCita
  it('debe eliminar cita correctamente', () => {
    component.citaSeleccionada = mockCitas[0];

    adminServiceMock.eliminarCita.mockReturnValue(
      of({
        mensaje: 'Eliminada',
      })
    );

    const spy = jest.spyOn(component, 'cargar');

    component.confirmarEliminarCita();

    expect(adminServiceMock.eliminarCita).toHaveBeenCalledWith('1');
    expect(component.modalEliminar).toBe(false);
    expect(spy).toHaveBeenCalled();
  });

  it('debe manejar error al eliminar cita', () => {
    component.citaSeleccionada = mockCitas[0];

    adminServiceMock.eliminarCita.mockReturnValue(
      throwError(() => ({
        error: {
          mensaje: 'Error delete',
        },
      }))
    );

    component.confirmarEliminarCita();

    expect(component.error).toBe('Error delete');
    expect(component.procesando).toBe(false);
  });
});
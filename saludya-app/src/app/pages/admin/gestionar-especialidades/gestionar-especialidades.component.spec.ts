/**
 * gestionar-especialidades.component.spec.ts
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { GestionarEspecialidadesComponent } from './gestionar-especialidades.component';
import { AdminService } from '../../../services/admin.service';

const adminMock = {
  listarEspecialidades: jest.fn(),
  crearEspecialidad: jest.fn(),
  actualizarEspecialidad: jest.fn(),
  eliminarEspecialidad: jest.fn(),
};

const mockEspecialidades = [
  {
    _id: 'esp-1',
    nombre: 'Electroterapia',
    descripcion: 'Terapia',
    duracionMinutos: 30,
    color: '#D97706',
    activa: true,
  },
  {
    _id: 'esp-2',
    nombre: 'Masoterapia',
    descripcion: 'Masaje',
    duracionMinutos: 45,
    color: '#059669',
    activa: true,
  },
];

describe('GestionarEspecialidadesComponent', () => {
  let component: GestionarEspecialidadesComponent;
  let fixture: ComponentFixture<GestionarEspecialidadesComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();

    adminMock.listarEspecialidades.mockReturnValue(
      of({ especialidades: mockEspecialidades })
    );

    await TestBed.configureTestingModule({
      imports: [GestionarEspecialidadesComponent],
      providers: [
        {
          provide: AdminService,
          useValue: adminMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      GestionarEspecialidadesComponent
    );

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  // Inicialización
  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar especialidades al iniciar', () => {
    expect(adminMock.listarEspecialidades).toHaveBeenCalled();

    expect(component.especialidades.length).toBe(2);
  });

  it('debe renderizar especialidades en pantalla', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Electroterapia');
    expect(compiled.textContent).toContain('Masoterapia');
  });

  // cargar
  describe('cargar()', () => {
    it('debe actualizar especialidades correctamente', () => {
      component.cargar();

      expect(component.especialidades.length).toBe(2);

      expect(component.cargando).toBe(false);
    });

    it('debe manejar error al cargar', () => {
      adminMock.listarEspecialidades.mockReturnValue(
        throwError(() => new Error('Error'))
      );

      component.cargar();

      expect(component.cargando).toBe(false);
    });

    it('debe soportar respuesta como array directo', () => {
      adminMock.listarEspecialidades.mockReturnValue(
        of(mockEspecialidades)
      );

      component.cargar();

      expect(component.especialidades.length).toBe(2);
    });

    it('debe dejar array vacío si respuesta inválida', () => {
      adminMock.listarEspecialidades.mockReturnValue(
        of({})
      );

      component.cargar();

      expect(component.especialidades).toEqual([]);
    });
  });

  // guardar - crear
  describe('guardar() creando', () => {
    beforeEach(() => {
      component.form = {
        nombre: 'Nueva Especialidad',
        descripcion: 'Descripción',
        duracionMinutos: 30,
        color: '#FF0000',
      };
    });

    it('debe validar nombre obligatorio', () => {
      component.form.nombre = '   ';

      component.guardar();

      expect(component.error).toBe(
        'El nombre es obligatorio'
      );

      expect(adminMock.crearEspecialidad).not.toHaveBeenCalled();
    });

    it('debe llamar crearEspecialidad', () => {
      adminMock.crearEspecialidad.mockReturnValue(
        of({ mensaje: 'OK' })
      );

      const payload = {
        nombre: 'Nueva Especialidad',
        descripcion: 'Descripción',
        duracionMinutos: 30,
        color: '#FF0000',
      };

      component.form = payload;

      component.guardar();

      expect(adminMock.crearEspecialidad)
        .toHaveBeenCalledWith(payload);
    });

    it('debe mostrar mensaje de creación', () => {
      adminMock.crearEspecialidad.mockReturnValue(
        of({ mensaje: 'OK' })
      );

      component.guardar();

      expect(component.mensaje).toBe(
        'Especialidad creada'
      );
    });

    it('debe manejar error al crear', () => {
      adminMock.crearEspecialidad.mockReturnValue(
        throwError(() => ({
          error: {
            mensaje: 'Error al crear',
          },
        }))
      );

      component.guardar();

      expect(component.error).toBe(
        'Error al crear'
      );

      expect(component.procesando).toBe(false);
    });
  });

  // editar
  describe('editar()', () => {
    it('debe cargar datos en el formulario', () => {
      component.editar(mockEspecialidades[0]);

      expect(component.editandoId).toBe('esp-1');

      expect(component.form.nombre)
        .toBe('Electroterapia');

      expect(component.mostrarForm).toBe(true);
    });

    it('debe limpiar mensajes', () => {
      component.error = 'Error';
      component.mensaje = 'Mensaje';

      component.editar(mockEspecialidades[0]);

      expect(component.error).toBe('');
      expect(component.mensaje).toBe('');
    });
  });

  // guardar - editar
  describe('guardar() editando', () => {
    beforeEach(() => {
      component.editandoId = 'esp-1';

      component.form = {
        nombre: 'Editada',
        descripcion: 'Nueva',
        duracionMinutos: 45,
        color: '#000000',
      };
    });

    it('debe llamar actualizarEspecialidad', () => {
      adminMock.actualizarEspecialidad.mockReturnValue(
        of({ mensaje: 'OK' })
      );

      const payload = {
        nombre: 'Editada',
        descripcion: 'Nueva',
        duracionMinutos: 45,
        color: '#000000',
      };

      component.editandoId = 'esp-1';
      component.form = payload;

      component.guardar();

      expect(adminMock.actualizarEspecialidad)
        .toHaveBeenCalledWith(
          'esp-1',
          payload
        );
    });

    it('debe mostrar mensaje de actualización', () => {
      adminMock.actualizarEspecialidad.mockReturnValue(
        of({ mensaje: 'OK' })
      );

      component.guardar();

      expect(component.mensaje).toBe(
        'Especialidad actualizada'
      );
    });
  });

  // eliminar
  describe('eliminar()', () => {
    beforeEach(() => {
      jest.spyOn(window, 'confirm')
        .mockReturnValue(true);
    });

    it('debe llamar eliminarEspecialidad', () => {
      adminMock.eliminarEspecialidad.mockReturnValue(
        of({ mensaje: 'OK' })
      );

      component.eliminar(mockEspecialidades[0]);

      expect(adminMock.eliminarEspecialidad)
        .toHaveBeenCalledWith('esp-1');
    });

    it('debe mostrar mensaje al eliminar', () => {
      adminMock.eliminarEspecialidad.mockReturnValue(
        of({ mensaje: 'OK' })
      );

      component.eliminar(mockEspecialidades[0]);

      expect(component.mensaje).toBe(
        'Especialidad desactivada'
      );
    });

    it('no debe eliminar si confirm retorna false', () => {
      (window.confirm as jest.Mock)
        .mockReturnValue(false);

      component.eliminar(mockEspecialidades[0]);

      expect(adminMock.eliminarEspecialidad)
        .not.toHaveBeenCalled();
    });

    it('debe manejar error al eliminar', () => {
      adminMock.eliminarEspecialidad.mockReturnValue(
        throwError(() => ({
          error: {
            mensaje: 'No se pudo eliminar',
          },
        }))
      );

      component.eliminar(mockEspecialidades[0]);

      expect(component.error).toBe(
        'No se pudo eliminar'
      );
    });
  });

  // cancelarEdicion
  describe('cancelarEdicion()', () => {
    it('debe limpiar formulario y estado', () => {
      component.editandoId = 'esp-1';

      component.form = {
        nombre: 'Test',
        descripcion: 'Test',
        duracionMinutos: 60,
        color: '#000',
      };

      component.mostrarForm = true;
      component.error = 'Error';

      component.cancelarEdicion();

      expect(component.editandoId).toBe('');

      expect(component.form.nombre).toBe('');

      expect(component.mostrarForm).toBe(false);

      expect(component.error).toBe('');
    });
  });
});
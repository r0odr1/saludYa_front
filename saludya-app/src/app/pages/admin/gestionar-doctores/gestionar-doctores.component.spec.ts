/**
 * gestionar-doctores.component.spec.ts
 * Pruebas del componente GestionarDoctoresComponent
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { GestionarDoctoresComponent } from './gestionar-doctores.component';
import { AdminService } from '../../../services/admin.service';

const adminMock = {
  listarDoctores: jest.fn(),
  listarEspecialidades: jest.fn(),
  registrarDoctor: jest.fn(),
};

const mockEspecialidades = [
  {
    _id: 'esp-1',
    nombre: 'Electroterapia',
    duracionMinutos: 30,
  },
  {
    _id: 'esp-2',
    nombre: 'Masoterapia',
    duracionMinutos: 30,
  },
];

const mockDoctores = [
  {
    _id: 'doc-1',
    usuario: {
      nombre: 'Dra. María',
      email: 'maria@test.com',
      telefono: '300',
    },
    especialidades: [mockEspecialidades[0]],
    activo: true,
  },
];

describe('GestionarDoctoresComponent', () => {
  let component: GestionarDoctoresComponent;
  let fixture: ComponentFixture<GestionarDoctoresComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();

    adminMock.listarDoctores.mockReturnValue(
      of({ doctores: mockDoctores })
    );

    adminMock.listarEspecialidades.mockReturnValue(
      of({ especialidades: mockEspecialidades })
    );

    await TestBed.configureTestingModule({
      imports: [GestionarDoctoresComponent],
      providers: [
        {
          provide: AdminService,
          useValue: adminMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionarDoctoresComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  // ============================================================
  // Inicialización
  // ============================================================

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar doctores al iniciar', () => {
    expect(adminMock.listarDoctores).toHaveBeenCalled();
    expect(component.doctores.length).toBe(1);
  });

  it('debe cargar especialidades al iniciar', () => {
    expect(adminMock.listarEspecialidades).toHaveBeenCalled();
    expect(component.especialidades.length).toBe(2);
  });

  it('debe renderizar doctores en pantalla', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Dra. María');
  });

  // ============================================================
  // cargarDoctores()
  // ============================================================

  describe('cargarDoctores()', () => {
    it('debe actualizar doctores y quitar cargando', () => {
      component.cargarDoctores();

      expect(component.doctores.length).toBe(1);
      expect(component.cargando).toBe(false);
    });

    it('debe manejar error al cargar doctores', () => {
      adminMock.listarDoctores.mockReturnValue(
        throwError(() => new Error('Error backend'))
      );

      component.cargarDoctores();

      expect(component.cargando).toBe(false);
    });
  });

  // ============================================================
  // toggleEsp()
  // ============================================================

  describe('toggleEsp()', () => {
    it('debe agregar especialidad si no existe', () => {
      component.nuevoDoc.especialidades = [];

      component.toggleEsp('esp-1');

      expect(component.nuevoDoc.especialidades).toContain('esp-1');
    });

    it('debe remover especialidad si ya existe', () => {
      component.nuevoDoc.especialidades = ['esp-1'];

      component.toggleEsp('esp-1');

      expect(component.nuevoDoc.especialidades).not.toContain('esp-1');
    });
  });

  // ============================================================
  // registrarDoctor()
  // ============================================================

  describe('registrarDoctor()', () => {
    beforeEach(() => {
      component.nuevoDoc = {
        nombre: 'Doctor Test',
        email: 'doctor@test.com',
        password: 'Doctor123!',
        telefono: '3001234567',
        especialidades: ['esp-1'],
      };
    });

    it('debe validar campos obligatorios', () => {
      component.nuevoDoc.nombre = '';

      component.registrarDoctor();

      expect(component.error).toBe(
        'Nombre, email y contraseña son obligatorios.'
      );

      expect(adminMock.registrarDoctor).not.toHaveBeenCalled();
    });

    it('debe llamar registrarDoctor correctamente', () => {
      adminMock.registrarDoctor.mockReturnValue(
        of({
          mensaje: 'Doctor registrado',
        })
      );

      component.registrarDoctor();

      expect(adminMock.registrarDoctor).toHaveBeenCalled();

      const payload =
        adminMock.registrarDoctor.mock.calls[0][0];

      expect(payload.nombre).toBe('Doctor Test');
      expect(payload.email).toBe('doctor@test.com');

      expect(payload.horarios.length).toBeGreaterThan(0);
    });

    it('debe mostrar mensaje de éxito', () => {
      adminMock.registrarDoctor.mockReturnValue(
        of({ mensaje: 'OK' })
      );

      component.registrarDoctor();

      expect(component.exito).toBe(
        'Doctor registrado exitosamente'
      );
    });

    it('debe limpiar formulario tras registrar', () => {
      adminMock.registrarDoctor.mockReturnValue(
        of({ mensaje: 'OK' })
      );

      component.registrarDoctor();

      expect(component.nuevoDoc.nombre).toBe('');
      expect(component.nuevoDoc.email).toBe('');
      expect(component.nuevoDoc.password).toBe('');
    });

    it('debe manejar error del backend', () => {
      adminMock.registrarDoctor.mockReturnValue(
        throwError(() => ({
          error: {
            mensaje: 'Email ya existe',
          },
        }))
      );

      component.registrarDoctor();

      expect(component.error).toBe('Email ya existe');
      expect(component.procesando).toBe(false);
    });
  });
});
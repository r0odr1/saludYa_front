/**
 * gestionar-usuarios.component.spec.ts
 * Pruebas del componente Gestionar Usuarios (admin).
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { GestionarUsuariosComponent } from './gestionar-usuarios.component';
import { AdminService } from '../../../services/admin.service';

const adminMock = {
  listarUsuarios: jest.fn(),
  crearUsuario: jest.fn(),
  actualizarUsuario: jest.fn(),
  eliminarUsuario: jest.fn(),
  cambiarRol: jest.fn(),
};

const mockUsuarios = [
  { _id: 'u-1', nombre: 'Juan Pérez', email: 'juan@test.com', rol: 'paciente', cuentaVerificada: true, activo: true, telefono: '300' },
  { _id: 'u-2', nombre: 'Dra. María', email: 'maria@test.com', rol: 'doctor', cuentaVerificada: true, activo: true },
  { _id: 'u-3', nombre: 'Admin', email: 'admin@test.com', rol: 'admin', cuentaVerificada: true, activo: true },
];

describe('GestionarUsuariosComponent', () => {
  let component: GestionarUsuariosComponent;
  let fixture: ComponentFixture<GestionarUsuariosComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    adminMock.listarUsuarios.mockReturnValue(of({ usuarios: mockUsuarios }));

    await TestBed.configureTestingModule({
      imports: [GestionarUsuariosComponent, RouterTestingModule],
      providers: [{ provide: AdminService, useValue: adminMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionarUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Inicialización
  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar usuarios al iniciar', () => {
    expect(adminMock.listarUsuarios).toHaveBeenCalled();
    expect(component.usuarios.length).toBe(3);
  });

  it('debe mostrar los usuarios en el template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Juan Pérez');
  });

  // Búsqueda y filtros
  it('debe filtrar usuarios por rol', () => {
    component.filtroRol = 'paciente';
    component.cargar();
    expect(adminMock.listarUsuarios).toHaveBeenCalledWith('paciente', '');
  });

  it('debe buscar usuarios por texto', () => {
    component.busqueda = 'juan';
    component.cargar();
    expect(adminMock.listarUsuarios).toHaveBeenCalledWith('', 'juan');
  });

  // Modal Crear Usuario
  describe('Modal Crear', () => {
    it('debe abrir el modal de crear', () => {
      component.abrirCrear();
      expect(component.modalCrear).toBe(true);
    });

    it('debe limpiar el formulario al abrir crear', () => {
      component.nuevoUsuario.nombre = 'Previo';
      component.abrirCrear();
      expect(component.nuevoUsuario.nombre).toBe('');
    });

    it('debe llamar crearUsuario con los datos correctos', () => {
      adminMock.crearUsuario.mockReturnValue(of({ mensaje: 'Creado', usuario: mockUsuarios[0] }));
      adminMock.listarUsuarios.mockReturnValue(of({ usuarios: mockUsuarios }));

      component.nuevoUsuario = {
        nombre: 'Nuevo',
        email: 'nuevo@test.com',
        password: 'Test1234!',
        telefono: '300',
        rol: 'paciente',
      };
      component.crearUsuario();
      expect(adminMock.crearUsuario).toHaveBeenCalledWith(component.nuevoUsuario);
    });

    it('debe cerrar el modal tras crear exitosamente', () => {
      adminMock.crearUsuario.mockReturnValue(of({ mensaje: 'Creado', usuario: mockUsuarios[0] }));
      adminMock.listarUsuarios.mockReturnValue(of({ usuarios: mockUsuarios }));
      component.modalCrear = true;
      component.crearUsuario();
      expect(component.modalCrear).toBe(false);
    });

    it('debe mostrar error si falla', () => {
      adminMock.crearUsuario.mockReturnValue(
        throwError(() => ({ error: { mensaje: 'Email duplicado' } }))
      );
      component.crearUsuario();
      expect(component.error).toBe('Email duplicado');
    });
  });

  // Modal Editar
  describe('Modal Editar', () => {
    it('debe abrir el modal con datos precargados', () => {
      component.abrirEditar(mockUsuarios[0]);
      expect(component.modalEditar).toBe(true);
      expect(component.editarDatos.nombre).toBe('Juan Pérez');
      expect(component.editarDatos.telefono).toBe('300');
    });

    it('debe llamar actualizarUsuario al confirmar', () => {
      adminMock.actualizarUsuario.mockReturnValue(of({ usuario: mockUsuarios[0] }));
      adminMock.listarUsuarios.mockReturnValue(of({ usuarios: mockUsuarios }));
      component.usuarioSeleccionado = mockUsuarios[0];
      component.editarDatos = { nombre: 'Editado', telefono: '301' };
      component.confirmarEditar();
      expect(adminMock.actualizarUsuario).toHaveBeenCalledWith('u-1', {
        nombre: 'Editado',
        telefono: '301',
      });
    });
  });

  // Cambiar rol
  describe('Cambiar Rol', () => {
    it('debe abrir el modal de cambiar rol', () => {
      component.abrirCambiarRol(mockUsuarios[0]);
      expect(component.modalRol).toBe(true);
      expect(component.nuevoRol).toBe('paciente');
    });

    it('debe llamar cambiarRol con el nuevo rol', () => {
      adminMock.cambiarRol.mockReturnValue(of({ usuario: { rol: 'doctor' }, mensaje: 'Rol cambiado' }));
      adminMock.listarUsuarios.mockReturnValue(of({ usuarios: mockUsuarios }));
      component.usuarioSeleccionado = mockUsuarios[0];
      component.nuevoRol = 'doctor';
      component.confirmarCambioRol();
      expect(adminMock.cambiarRol).toHaveBeenCalledWith('u-1', { rol: 'doctor' });
    });

    it('no debe enviar si el rol es el mismo', () => {
      component.usuarioSeleccionado = mockUsuarios[0];
      component.nuevoRol = 'paciente';
      component.confirmarCambioRol();
      expect(adminMock.cambiarRol).not.toHaveBeenCalled();
    });
  });

  // Eliminar (desactivar)
  describe('Eliminar usuario', () => {
    it('debe abrir el modal de eliminar', () => {
      component.abrirEliminar(mockUsuarios[0]);
      expect(component.modalEliminar).toBe(true);
    });

    it('debe llamar eliminarUsuario al confirmar', () => {
      adminMock.eliminarUsuario.mockReturnValue(of({ mensaje: 'Desactivado' }));
      adminMock.listarUsuarios.mockReturnValue(of({ usuarios: mockUsuarios }));
      component.usuarioSeleccionado = mockUsuarios[0];
      component.confirmarEliminar();
      expect(adminMock.eliminarUsuario).toHaveBeenCalledWith('u-1');
    });
  });

  // Helpers
  it('getAvatarColor debe retornar color verde para paciente', () => {
    expect(component.getAvatarColor('paciente')).toBe('#047857');
  });

  it('getAvatarColor debe retornar color azul para doctor', () => {
    expect(component.getAvatarColor('doctor')).toBe('#2563EB');
  });

  it('getAvatarColor debe retornar color púrpura para admin', () => {
    expect(component.getAvatarColor('admin')).toBe('#4338CA');
  });

  it('limpiarMensajes debe vaciar error y mensaje', () => {
    component.error = 'X';
    component.mensaje = 'Y';
    component.limpiarMensajes();
    expect(component.error).toBe('');
    expect(component.mensaje).toBe('');
  });
});

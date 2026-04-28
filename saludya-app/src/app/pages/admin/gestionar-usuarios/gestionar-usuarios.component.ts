import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-gestionar-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-usuarios.component.html',
  styleUrls: ['./gestionar-usuarios.component.scss']
})
export class GestionarUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  cargando = true;
  busqueda = '';
  filtroRol = '';
  mensaje = '';
  error = '';
  procesando = false;

  /** Modales */
  modalCrear = false;
  modalEditar = false;
  modalRol = false;
  modalEliminar = false;

  usuarioSeleccionado: any = null;
  nuevoRol = '';

  nuevoUsuario = {
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'paciente'
  };

  editarDatos = {
    nombre: '',
    telefono: ''
  };

  filtros = [
    { label: 'Todos', value: '' },
    { label: 'Paciente', value: 'paciente' },
    { label: 'Doctor', value: 'doctor' },
    { label: 'Admin', value: 'admin' },
  ];

  rolesOpciones = [
    { value: 'paciente', icon: '🧑', label: 'Paciente' },
    { value: 'doctor', icon: '👨‍⚕️', label: 'Doctor' },
    { value: 'admin', icon: '⚙️', label: 'Admin' },
  ];

  private buscarTimeout: any;

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true;
    this.adminService.listarUsuarios(this.filtroRol, this.busqueda).subscribe({
      next: (res) => { this.usuarios = res.usuarios; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  buscar() {
    clearTimeout(this.buscarTimeout);
    this.buscarTimeout = setTimeout(() => this.cargar(), 400);
  }

  getAvatarColor(rol: string): string {
    return { paciente: '#047857', doctor: '#2563EB', admin: '#4338CA' }[rol] || '#6B7280';
  }

  limpiarMensajes() {
    this.error = '';
    this.mensaje = '';
  }

  mostrarMensaje(msg: string) {
    this.mensaje = msg;
    setTimeout(() => this.mensaje = '', 4000);
  }

  //** Crear */
  abrirCrear() {
    this.nuevoUsuario = { nombre: '', email: '', password: '', telefono: '', rol: 'paciente' };
    this.limpiarMensajes();
    this.modalCrear = true;
  }

  crearUsuario() {
    this.procesando = true;
    this.limpiarMensajes();

    this.adminService.crearUsuario(this.nuevoUsuario).subscribe({
      next: (res) => {
        this.procesando = false;
        this.modalCrear = false;
        this.mostrarMensaje(res.mensaje || 'Usuario creado exitosamente.');
        this.cargar();
      },
      error: (err) => {
        this.procesando = false;
        this.error = err.error?.mensaje || 'Error al crear usuario.';
      }
    });
  }

  /** Editar */
  abrirEditar(usuario: any) {
    this.usuarioSeleccionado = usuario;
    this.editarDatos = { nombre: usuario.nombre, telefono: usuario.telefono || '' };
    this.limpiarMensajes();
    this.modalEditar = true;
  }

  confirmarEditar() {
    this.procesando = true;
    this.limpiarMensajes();

    this.adminService.actualizarUsuario(this.usuarioSeleccionado._id, this.editarDatos).subscribe({
      next: (res) => {
        this.procesando = false;
        this.modalEditar = false;
        this.mostrarMensaje(res.mensaje || 'Usuario actualizado.');
        this.cargar();
      },
      error: (err) => {
        this.procesando = false;
        this.error = err.error?.mensaje || 'Error al actualizar usuario.';
      }
    });
  }

  /** Cambiar Rol */
  abrirCambiarRol(usuario: any) {
    this.usuarioSeleccionado = usuario;
    this.nuevoRol = usuario.rol;
    this.limpiarMensajes();
    this.modalRol = true;
  }

  confirmarCambioRol() {
    if (!this.nuevoRol || this.nuevoRol === this.usuarioSeleccionado.rol) return;
    this.procesando = true;
    this.limpiarMensajes();

    this.adminService.cambiarRol(this.usuarioSeleccionado._id, { rol: this.nuevoRol }).subscribe({
      next: (res) => {
        this.procesando = false;
        this.modalRol = false;
        this.mostrarMensaje(res.mensaje || 'Rol cambiado exitosamente.');
        this.cargar();
      },
      error: (err) => {
        this.procesando = false;
        this.error = err.error?.mensaje || 'Error al cambiar rol.';
      }
    });
  }

  /** Eliminar - Desactivar */
  abrirEliminar(usuario: any) {
    this.usuarioSeleccionado = usuario;
    this.limpiarMensajes();
    this.modalEliminar = true;
  }

  confirmarEliminar() {
    this.procesando = true;
    this.limpiarMensajes();

    this.adminService.eliminarUsuario(this.usuarioSeleccionado._id).subscribe({
      next: (res) => {
        this.procesando = false;
        this.modalEliminar = false;
        this.mostrarMensaje(res.mensaje || 'Usuario desactivado.');
        this.cargar();
      },
      error: (err) => {
        this.procesando = false;
        this.error = err.error?.mensaje || 'Error al desactivar usuario.';
      }
    });
  }
}

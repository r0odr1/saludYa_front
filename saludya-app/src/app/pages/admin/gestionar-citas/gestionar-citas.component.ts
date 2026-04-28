import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-gestionar-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-citas.component.html',
  styleUrls: ['./gestionar-citas.component.scss']
})

export class GestionarCitasComponent implements OnInit {
  citas: any[] = [];
  cargando = true;
  mensaje = '';
  error = '';
  procesando = false;

  filtroFecha = '';
  filtroEstado = '';

  modalEditar = false;
  modalEliminar = false;
  citaSeleccionada: any = null;
  editarCitaDatos = { fecha: '', horaInicio: '', estado: '' };

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true;
    const filtros: any = {};
    if (this.filtroFecha) filtros.fecha = this.filtroFecha;
    if (this.filtroEstado) filtros.estado = this.filtroEstado;

    this.adminService.listarCitas(filtros).subscribe({
      next: (res) => { this.citas = res.citas; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  limpiarFiltros() {
    this.filtroFecha = '';
    this.filtroEstado = '';
    this.cargar();
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${dias[d.getUTCDay()]} ${d.getUTCDate()} ${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }

  limpiarMensajes() { this.error = ''; this.mensaje = ''; }

  mostrarMensaje(msg: string) {
    this.mensaje = msg;
    setTimeout(() => this.mensaje = '', 4000);
  }

  /** Editar Cita */
  abrirEditar(cita: any) {
    this.citaSeleccionada = cita;
    const fechaStr = new Date(cita.fecha).toISOString().split('T')[0];
    this.editarCitaDatos = {
      fecha: fechaStr,
      horaInicio: cita.horaInicio,
      estado: cita.estado
    };
    this.limpiarMensajes();
    this.modalEditar = true;
  }

  confirmarEditarCita() {
    this.procesando = true;
    this.limpiarMensajes();

    this.adminService.actualizarCita(this.citaSeleccionada._id, this.editarCitaDatos).subscribe({
      next: (res) => {
        this.procesando = false;
        this.modalEditar = false;
        this.mostrarMensaje(res.mensaje || 'Cita actualizada.');
        this.cargar();
      },
      error: (err) => {
        this.procesando = false;
        this.error = err.error?.mensaje || 'Error al actualizar cita.';
      }
    });
  }

  /** Eliminar Cita */
  abrirEliminar(cita: any) {
    this.citaSeleccionada = cita;
    this.limpiarMensajes();
    this.modalEliminar = true;
  }

  confirmarEliminarCita() {
    this.procesando = true;
    this.limpiarMensajes();

    this.adminService.eliminarCita(this.citaSeleccionada._id).subscribe({
      next: (res) => {
        this.procesando = false;
        this.modalEliminar = false;
        this.mostrarMensaje(res.mensaje || 'Cita eliminada.');
        this.cargar();
      },
      error: (err) => {
        this.procesando = false;
        this.error = err.error?.mensaje || 'Error al eliminar cita.';
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-gestionar-especialidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-especialidades.component.html',
  styles: ['./gestionar-especialidades.component.scss']
})
export class GestionarEspecialidadesComponent implements OnInit {
  especialidades: any[] = [];
  cargando = true;
  procesando = false;
  mostrarForm = false;
  editandoId = '';
  mensaje = '';
  error = '';

  form = { nombre: '', descripcion: '', duracionMinutos: 30, color: '#4F46E5' };

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true;
    this.adminService.listarEspecialidades().subscribe({
      next: (res) => { this.especialidades = res.especialidades; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  guardar() {
    if (!this.form.nombre.trim()) { this.error = 'El nombre es obligatorio'; return; }
    this.error = '';
    this.mensaje = '';
    this.procesando = true;

    const obs = this.editandoId
      ? this.adminService.actualizarEspecialidad(this.editandoId, this.form)
      : this.adminService.crearEspecialidad(this.form);

    obs.subscribe({
      next: () => {
        this.mensaje = this.editandoId ? 'Especialidad actualizada' : 'Especialidad creada';
        this.procesando = false;
        this.cancelarEdicion();
        this.cargar();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        this.procesando = false;
        this.error = err.error?.mensaje || 'Error al guardar';
      }
    });
  }

  editar(esp: any) {
    this.editandoId = esp._id;
    this.form = { nombre: esp.nombre, descripcion: esp.descripcion || '', duracionMinutos: esp.duracionMinutos, color: esp.color };
    this.mostrarForm = true;
    this.error = '';
    this.mensaje = '';
  }

  eliminar(esp: any) {
    if (!confirm(`¿Desactivar la especialidad "${esp.nombre}"?`)) return;
    this.adminService.eliminarEspecialidad(esp._id).subscribe({
      next: () => { this.mensaje = 'Especialidad desactivada'; this.cargar(); setTimeout(() => this.mensaje = '', 3000); },
      error: (err) => { this.error = err.error?.mensaje || 'Error'; }
    });
  }

  cancelarEdicion() {
    this.editandoId = '';
    this.form = { nombre: '', descripcion: '', duracionMinutos: 30, color: '#4F46E5' };
    this.mostrarForm = false;
    this.error = '';
  }
}

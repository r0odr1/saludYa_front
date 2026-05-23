import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-gestionar-doctores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-doctores.component.html',
  styleUrls: ['./gestionar-doctores.component.scss']
})

export class GestionarDoctoresComponent implements OnInit {
  doctores: any[] = [];
  especialidades: any[] = [];
  mostrarFormulario = false;
  cargando = true;
  procesando = false;
  error = '';
  exito = '';

  nuevoDoc = { nombre: '', email: '', password: '', telefono: '', especialidades: [] as string[] };
  diasSemana = [
    { dia: 1, nombre: 'Lunes', activo: true, horaInicio: '08:00', horaFin: '17:00' },
    { dia: 2, nombre: 'Martes', activo: true, horaInicio: '08:00', horaFin: '17:00' },
    { dia: 3, nombre: 'Miércoles', activo: true, horaInicio: '08:00', horaFin: '17:00' },
    { dia: 4, nombre: 'Jueves', activo: true, horaInicio: '08:00', horaFin: '17:00' },
    { dia: 5, nombre: 'Viernes', activo: true, horaInicio: '08:00', horaFin: '17:00' },
    { dia: 6, nombre: 'Sábado', activo: false, horaInicio: '08:00', horaFin: '13:00' },
  ];

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDoctores();
    this.adminService.listarEspecialidades().subscribe({
      next: (res) => {
        this.especialidades = res.especialidades;
        this.cdr.detectChanges();
      }
    });
  }

  cargarDoctores() {
    this.cargando = true;
    this.adminService.listarDoctores().subscribe({
      next: (res) => {
        this.doctores = res.doctores;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleEsp(id: string) {
    const idx = this.nuevoDoc.especialidades.indexOf(id);
    if (idx >= 0) this.nuevoDoc.especialidades.splice(idx, 1);
    else this.nuevoDoc.especialidades.push(id);
  }

  registrarDoctor() {
    if (!this.nuevoDoc.nombre || !this.nuevoDoc.email || !this.nuevoDoc.password) {
      this.error = 'Nombre, email y contraseña son obligatorios.';
      return;
    }
    this.error = '';
    this.exito = '';
    this.procesando = true;

    const horarios = this.diasSemana.filter(d => d.activo).map(d => ({
      dia: d.dia, horaInicio: d.horaInicio, horaFin: d.horaFin, intervaloMinutos: 30
    }));

    this.adminService.registrarDoctor({ ...this.nuevoDoc, horarios }).subscribe({
      next: () => {
        this.procesando = false;
        this.exito = 'Doctor registrado exitosamente';
        this.nuevoDoc = { nombre: '', email: '', password: '', telefono: '', especialidades: [] };
        this.cargarDoctores();
      },
      error: (err) => {
        this.procesando = false;
        this.error = err.error?.mensaje || 'Error al registrar';
      }
    });
  }
}

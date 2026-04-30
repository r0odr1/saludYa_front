import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CitaService } from '../../../services/cita.service';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-citas.component.html',
  styleUrls: ['./mis-citas.component.scss']
})
export class MisCitasComponent implements OnInit {
  citas: any[] = [];
  filtro = 'todas';
  cargando = true;

  citaCancelar: any = null;
  citaEditar: any = null;
  procesando = false;

  fechasEdit: any[] = [];
  horariosEdit: any[] = [];
  nuevaFecha = '';
  nuevoHorario = '';
  cargandoHorariosEdit = false;
  errorEdit = '';

  constructor(
    private citaService: CitaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarCitas();
    this.generarFechasEdit();
  }

  get citasFiltradas() {
    if (this.filtro === 'todas') return this.citas;
    return this.citas.filter(c => c.estado === this.filtro);
  }

  cargarCitas() {
    this.cargando = true;
    this.citaService.getMisCitas().subscribe({
      next: (res) => {
        this.citas = Array.isArray(res.citas) ? res.citas : [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.citas = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarCancelar(cita: any) { this.citaCancelar = cita; }

  cancelarCita() {
    this.procesando = true;
    this.citaService.cancelarCita(this.citaCancelar._id).subscribe({
      next: () => {
        this.procesando = false;
        this.citaCancelar = null;
        this.cargarCitas();
      },
      error: (err) => {
        this.procesando = false;
        alert(err.error?.mensaje || 'Error al cancelar');
      }
    });
  }

  abrirEditar(cita: any) {
    this.citaEditar = cita;
    this.nuevaFecha = '';
    this.nuevoHorario = '';
    this.horariosEdit = [];
    this.errorEdit = '';
  }

  generarFechasEdit() {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    for (let i = 0; i < 14; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + i);
      if (fecha.getDay() === 0) continue;
      this.fechasEdit.push({
        valor: fecha.toISOString().split('T')[0],
        diaSemana: dias[fecha.getDay()],
        dia: fecha.getDate()
      });
    }
  }

  seleccionarNuevaFecha(fecha: string) {
    this.nuevaFecha = fecha;
    this.nuevoHorario = '';
    this.cargandoHorariosEdit = true;
    this.errorEdit = '';

    this.citaService.getDisponibilidad(this.citaEditar.doctor._id, fecha).subscribe({
      next: (res) => {
        this.horariosEdit = res.horarios || [];
        this.cargandoHorariosEdit = false;
      },
      error: () => {
        this.cargandoHorariosEdit = false;
        this.errorEdit = 'Error al cargar horarios';
      }
    });
  }

  guardarEdicion() {
    this.procesando = true;
    this.errorEdit = '';

    this.citaService.editarCita(this.citaEditar._id, {
      fecha: this.nuevaFecha,
      horaInicio: this.nuevoHorario
    }).subscribe({
      next: () => {
        this.procesando = false;
        this.citaEditar = null;
        this.cargarCitas();
      },
      error: (err) => {
        this.procesando = false;
        this.errorEdit = err.error?.mensaje || 'Error al reprogramar';
      }
    });
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatFechaCorta(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  }
}

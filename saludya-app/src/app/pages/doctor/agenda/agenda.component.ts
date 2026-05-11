import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CitaService } from '../../../services/cita.service';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.scss']
})
export class AgendaComponent implements OnInit {
  citas: any[] = [];
  fechaSeleccionada = '';
  fechaLabel = '';
  filtroEstado = '';
  cargando = true;

  citaNota: any = null;
  contenidoNota = '';

  citaReasignar: any = null;
  doctoresDisponibles: any[] = [];
  doctorReasignar = '';
  cargandoDoctores = false;
  errorReasignar = '';

  procesando = false;

  constructor(
    private citaService: CitaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fechaSeleccionada = new Date().toISOString().split('T')[0];
    this.actualizarLabel();
    this.cargarAgenda();
  }

  cargarAgenda() {
    this.cargando = true;
    this.citaService.getAgendaDoctor(this.fechaSeleccionada, this.filtroEstado || undefined).subscribe({
      next: (res) => { this.citas = res.citas; this.cargando = false; this.cdr.detectChanges(); },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }

  onFechaChange(event: Event) {
    this.fechaSeleccionada = (event.target as HTMLInputElement).value;
    this.actualizarLabel();
    this.cargarAgenda();
  }

  cambiarDia(delta: number) {
    const fecha = new Date(this.fechaSeleccionada + 'T12:00:00');
    fecha.setDate(fecha.getDate() + delta);
    this.fechaSeleccionada = fecha.toISOString().split('T')[0];
    this.actualizarLabel();
    this.cargarAgenda();
  }

  actualizarLabel() {
    const f = new Date(this.fechaSeleccionada + 'T12:00:00');
    this.fechaLabel = f.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  completarCita(cita: any) {
    this.citaService.completarCita(cita._id).subscribe({
      next: () => this.cargarAgenda(),
      error: (err) => alert(err.error?.mensaje || 'Error')
    });
  }

  abrirNotas(cita: any) {
    this.citaNota = cita;
    this.contenidoNota = '';
  }

  guardarNota() {
    this.procesando = true;
    this.citaService.agregarNota(this.citaNota._id, this.contenidoNota).subscribe({
      next: () => {
        this.procesando = false;
        this.citaNota = null;
        this.cargarAgenda();
      },
      error: (err) => {
        this.procesando = false;
        alert(err.error?.mensaje || 'Error');
      }
    });
  }

  abrirReasignar(cita: any) {
    this.citaReasignar = cita;
    this.doctorReasignar = '';
    this.errorReasignar = '';
    this.cargandoDoctores = true;

    this.citaService.getDoctores().subscribe({
      next: (res) => {
        // Filtrar el doctor actual
        this.doctoresDisponibles = res.doctores.filter((d: any) => d._id !== cita.doctor?._id);
        this.cargandoDoctores = false;
      },
      error: () => { this.cargandoDoctores = false; }
    });
  }

  confirmarReasignar() {
    this.procesando = true;
    this.errorReasignar = '';
    this.citaService.reasignarCita(this.citaReasignar._id, this.doctorReasignar).subscribe({
      next: () => {
        this.procesando = false;
        this.citaReasignar = null;
        this.cargarAgenda();
      },
      error: (err) => {
        this.procesando = false;
        this.errorReasignar = err.error?.mensaje || 'Error al reasignar';
      }
    });
  }

  formatFechaCorta(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CitaService } from '../../../services/cita.service';

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agendar-cita.component.html',
  styleUrls: ['./agendar-cita.component.scss']
})
export class AgendarCitaComponent implements OnInit {
  especialidadId = '';
  especialidad: any = null;
  paso = 1;
  error = '';
  exito = '';

  doctores: any[] = [];
  doctorSeleccionado: any = null;
  cargandoDoctores = true;

  fechasDisponibles: any[] = [];
  fechaSeleccionada = '';

  horarios: any[] = [];
  horarioSeleccionado = '';
  cargandoHorarios = false;
  mensajeDisponibilidad = '';

  agendando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citaService: CitaService
  ) {}

  ngOnInit() {
    this.especialidadId = this.route.snapshot.paramMap.get('especialidadId') || '';
    this.generarFechas();
    this.cargarDoctores();
  }

  cargarDoctores() {
    this.cargandoDoctores = true;
    this.citaService.getDoctoresPorEspecialidad(this.especialidadId).subscribe({
      next: (res) => {
        this.doctores = res.doctores;
        this.cargandoDoctores = false;
      },
      error: () => { this.cargandoDoctores = false; }
    });

    //** Cargar tambien informacion de especialidad */
    this.citaService.getEspecialidades().subscribe({
      next: (res) => {
        this.especialidad = res.especialidades.find((e: any) => e._id === this.especialidadId);
      }
    });
  }

  generarFechas() {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    for (let i = 0; i < 21; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + i);
      if (fecha.getDay() === 0) continue; // Excluir domingos

      this.fechasDisponibles.push({
        valor: fecha.toISOString().split('T')[0],
        diaSemana: dias[fecha.getDay()],
        dia: fecha.getDate(),
        mes: meses[fecha.getMonth()]
      });
    }
  }

  seleccionarDoctor(doctor: any) {
    this.doctorSeleccionado = doctor;
    this.paso = 2;
    this.error = '';
  }

  seleccionarFecha(fecha: string) {
    this.fechaSeleccionada = fecha;
    this.paso = 3;
    this.cargarHorarios();
  }

  cargarHorarios() {
    this.cargandoHorarios = true;
    this.horarios = [];
    this.mensajeDisponibilidad = '';

    this.citaService.getDisponibilidad(this.doctorSeleccionado._id, this.fechaSeleccionada).subscribe({
      next: (res) => {
        if (!res.disponible) {
          this.mensajeDisponibilidad = res.mensaje || 'No hay horarios disponibles';
        } else {
          this.horarios = res.horarios;
        }
        this.cargandoHorarios = false;
      },
      error: () => {
        this.mensajeDisponibilidad = 'Error al cargar horarios';
        this.cargandoHorarios = false;
      }
    });
  }

  seleccionarHorario(hora: string) {
    this.horarioSeleccionado = hora;
    this.paso = 4;
  }

  confirmarCita() {
    this.agendando = true;
    this.error = '';

    this.citaService.agendarCita({
      doctorId: this.doctorSeleccionado._id,
      especialidadId: this.especialidadId,
      fecha: this.fechaSeleccionada,
      horaInicio: this.horarioSeleccionado
    }).subscribe({
      next: () => {
        this.agendando = false;
        this.paso = 5;
      },
      error: (err) => {
        this.agendando = false;
        this.error = err.error?.mensaje || 'Error al agendar la cita. Intente con otro horario.';
        if (err.status === 409) {
          //** Horario tomado, recargar */
          this.paso = 3;
          this.cargarHorarios();
        }
      }
    });
  }

  formatFechaCompleta(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha + 'T12:00:00').toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}

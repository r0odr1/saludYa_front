import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CitaService } from '../../../services/cita.service';

@Component({
  selector: 'app-historial-paciente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './historial-paciente.component.html',
  styleUrls: ['./historial-paciente.component.scss']
})
export class HistorialPacienteComponent implements OnInit {
  historial: any[] = [];
  pacienteNombre = '';
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private citaService: CitaService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('pacienteId') || '';
    this.citaService.getHistorialPaciente(id).subscribe({
      next: (res) => {
        this.historial = res.historial;
        if (this.historial.length > 0) {
          this.pacienteNombre = this.historial[0].paciente?.nombre;
        }
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatFechaCorta(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  }
}

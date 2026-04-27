import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CitaService } from '../../../services/cita.service';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './especialidades.component.html',
  styleUrls: ['./especialidades.component.scss']
})
export class EspecialidadesComponent implements OnInit {
  especialidades: any[] = [];
  cargando = true;

  constructor(private citaService: CitaService) {}

  ngOnInit() {
    this.citaService.getEspecialidades().subscribe({
      next: (res) => { this.especialidades = res.especialidades; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  getIcon(nombre: string): string {
    const iconMap: Record<string, string> = {
      'Evaluación Fisioterapéutica': '🔍',
      'Masoterapia': '💆',
      'Electroterapia': '⚡',
      'Rehabilitación Deportiva': '🏃',
      'Terapia Respiratoria': '🫁'
    };
    return iconMap[nombre] || '🩺';
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  mesSeleccionado = new Date().getMonth() + 1;
  anioSeleccionado = new Date().getFullYear();
  cargando = true;

  reporte: any = { totalCitas: 0, porEspecialidad: [], porEstado: [] };

  private maxCitas = 1;

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.cargarReportes(); }

  cargarReportes() {
    this.cargando = true;
    this.adminService.getReportes(this.mesSeleccionado, this.anioSeleccionado).subscribe({
      next: (res) => {
        this.reporte = res;
        this.maxCitas = Math.max(...(res.porEspecialidad?.map((e: any) => e.total) || [1]), 1);
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  getBarWidth(total: number): number {
    return Math.max((total / this.maxCitas) * 100, 8);
  }

  getBarColor(nombre: string): string {
    const colors: Record<string, string> = {
      'Evaluación Fisioterapéutica': '#2563EB',
      'Masoterapia': '#059669',
      'Electroterapia': '#D97706',
      'Rehabilitación Deportiva': '#DC2626',
      'Terapia Respiratoria': '#7C3AED'
    };
    return colors[nombre] || '#6B7280';
  }

  getEstadoIcon(estado: string): string {
    const icons: Record<string, string> = { agendada: '📅', completada: '✅', cancelada: '❌', no_asistio: '🚫' };
    return icons[estado] || '📋';
  }

  getEstadoStyle(estado: string): Record<string, string> {
    const styles: Record<string, Record<string, string>> = {
      agendada: { background: '#cff4fc', color: '#055160' },
      completada: { background: '#d1e7dd', color: '#0f5132' },
      cancelada: { background: '#f8d7da', color: '#842029' },
      no_asistio: { background: '#fff3cd', color: '#664d03' }
    };
    return styles[estado] || { background: '#f3f4f6', color: '#6B7280' };
  }
}

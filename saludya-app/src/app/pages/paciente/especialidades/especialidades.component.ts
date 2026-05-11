import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CitaService } from '../../../services/cita.service';
import { AuthService } from '../../../services/auth.service';

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
  error = '';

  constructor(
    private citaService: CitaService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Esperar a que la autenticación esté lista
    if (this.authService.estaLogueado()) {
      this.cargarEspecialidades();
    } else {
      // Si no está logueado inmediatamente, esperar un poco y verificar de nuevo
      setTimeout(() => {
        if (this.authService.estaLogueado()) {
          this.cargarEspecialidades();
        } else {
          console.error('[Especialidades] Usuario no autenticado');
          this.error = 'Usuario no autenticado';
          this.cargando = false;
        }
      }, 100);
    }
  }

  private cargarEspecialidades() {
    this.citaService.getEspecialidades().subscribe({
      next: (especialidades) => {
        this.especialidades = especialidades;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Especialidades] error cargando especialidades:', err);
        this.error = err.error?.mensaje || 'No se pudieron cargar las especialidades.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
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

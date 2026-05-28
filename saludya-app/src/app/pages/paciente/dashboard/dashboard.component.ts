import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CitaService } from '../../../services/cita.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  proximasCitas: any[] = [];
  cargando = true;

  constructor(
    public auth: AuthService,
    private citaService: CitaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarCitas();
  }

  cargarCitas() {
    this.cargando = true;
    this.citaService.getMisCitas().subscribe({
      next: (res) => {
        this.proximasCitas = Array.isArray(res.citas) ? res.citas.filter((c: any) => c.estado === 'agendada') : [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.proximasCitas = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get nombreUsuario(): string {
    return this.auth.usuario()!.nombre!.split(' ')[0];
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }
}

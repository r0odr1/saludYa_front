import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CitaService } from '../../../services/cita.service';

@Component({
  selector: 'app-dashboard-doctor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-doctor.component.html',
  styleUrls: ['./dashboard-doctor.component.scss']
})
export class DashboardDoctorComponent implements OnInit {
  citasDelDia: any[] = [];
  citasHoy = 0;
  completadas = 0;
  pendientes = 0;
  cargando = true;
  hoy = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  constructor(
    public auth: AuthService,
    private citaService: CitaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const hoyStr = new Date().toISOString().split('T')[0];
    this.citaService.getAgendaDoctor(hoyStr).subscribe({
      next: (res) => {
        this.citasDelDia = res.citas;
        this.citasHoy = res.citas.length;
        this.completadas = res.citas.filter((c: any) => c.estado === 'completada').length;
        this.pendientes = res.citas.filter((c: any) => c.estado === 'agendada').length;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });
  }
}

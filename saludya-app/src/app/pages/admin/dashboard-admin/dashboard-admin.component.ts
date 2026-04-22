import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss'],
})
export class DashboardAdminComponent implements OnInit {
  totalDoctores = 0;
  totalEspecialidades = 0;

  constructor(public auth: AuthService, private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.listarDoctores().subscribe({ next: r => this.totalDoctores = r.doctores?.length || 0 });
    this.adminService.listarEspecialidades().subscribe({ next: r => this.totalEspecialidades = r.especialidades?.length || 0 });
  }
}

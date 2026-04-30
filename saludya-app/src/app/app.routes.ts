import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  /** Autenticacion */
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro/registro.component').then((m) => m.RegistroComponent),
  },
  {
    path: 'verificar-cuenta',
    loadComponent: () =>
      import('./pages/verificar-cuenta/verificar-cuenta.component').then(
        (m) => m.VerificarCuentaComponent,
      ),
  },
  {
    path: 'solicitar-reset',
    loadComponent: () =>
      import('./pages/solicitar-reset/solicitar-reset.component').then(
        (m) => m.SolicitarResetComponent,
      ),
  },
  {
    path: 'verificar-reset',
    loadComponent: () =>
      import('./pages/verificar-reset/verificar-reset.component').then(
        (m) => m.VerificarResetComponent,
      ),
  },
  {
    path: 'nueva-contrasena',
    loadComponent: () =>
      import('./pages/nueva-contrasena/nueva-contrasena.component').then(
        (m) => m.NuevaContrasenaComponent,
      ),
  },

  /** Perfil */

  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/perfil/perfil.component').then((m) => m.PerfilComponent),
  },

  /** Paciente */
  {
    path: 'paciente/dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/paciente/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'paciente/especialidades',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/paciente/especialidades/especialidades.component').then(m => m.EspecialidadesComponent)
  },
  {
    path: 'paciente/agendar/:especialidadId',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/paciente/agendar-cita/agendar-cita.component').then(m => m.AgendarCitaComponent)
  },
  {
    path: 'paciente/mis-citas',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/paciente/mis-citas/mis-citas.component').then(m => m.MisCitasComponent)
  },

  /** Doctor */
  {
    path: 'doctor/dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/doctor/dashboard-doctor/dashboard-doctor.component').then(m => m.DashboardDoctorComponent)
  },
  {
    path: 'doctor/agenda',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/doctor/agenda/agenda.component').then(m => m.AgendaComponent)
  },

  /** Administrador */
  {
    path: 'admin/dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/dashboard-admin/dashboard-admin.component').then(m => m.DashboardAdminComponent)
  },
  {
    path: 'admin/doctores',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/gestionar-doctores/gestionar-doctores.component').then(m => m.GestionarDoctoresComponent)
  },
  {
    path: 'admin/especialidades',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/gestionar-especialidades/gestionar-especialidades.component').then(m => m.GestionarEspecialidadesComponent)
  },
  {
    path: 'admin/reportes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/reportes/reportes.component').then(m => m.ReportesComponent)
  },
  {
    path: 'admin/usuarios',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/gestionar-usuarios/gestionar-usuarios.component').then(m => m.GestionarUsuariosComponent)
  },
  {
    path: 'admin/citas',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/gestionar-citas/gestionar-citas.component').then(m => m.GestionarCitasComponent)
  },

  { path: '**', redirectTo: '/login' },
];

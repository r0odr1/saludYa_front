import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // ===== AUTH =====
  {
    path: 'login',
    loadComponent: () => import('../pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('../pages/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'verificar-cuenta',
    loadComponent: () => import('../pages/verificar-cuenta/verificar-cuenta.component').then(m => m.VerificarCuentaComponent)
  },
  {
    path: 'solicitar-reset',
    loadComponent: () => import('../pages/solicitar-reset/solicitar-reset.component').then(m => m.SolicitarResetComponent)
  },
  {
    path: 'verificar-reset',
    loadComponent: () => import('../pages/verificar-reset/verificar-reset.component').then(m => m.VerificarResetComponent)
  },
  {
    path: 'nueva-contrasena',
    loadComponent: () => import('../pages/nueva-contrasena/nueva-contrasena.component').then(m => m.NuevaContrasenaComponent)
  },

  { path: '**', redirectTo: '/login' }
];
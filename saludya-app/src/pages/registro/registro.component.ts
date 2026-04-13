import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="auth-left-content">
          <div class="auth-brand">
            <span>🏥</span>
            <h1>Salud<span>Ya</span></h1>
          </div>
          <p class="auth-tagline">Crea tu cuenta y comienza a gestionar tus citas de fisioterapia hoy mismo.</p>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form-wrapper">
          <h2>Crear Cuenta</h2>
          <p class="auth-subtitle">Completa tus datos para registrarte</p>

          <div class="alert alert-danger" *ngIf="error">⚠️ {{ error }}</div>

          <form (ngSubmit)="onRegistro()">
            <div class="form-group">
              <label>Nombre completo</label>
              <input type="text" class="form-control" [(ngModel)]="datos.nombre" name="nombre" placeholder="Ej: Juan Pérez" required>
            </div>
            <div class="form-group">
              <label>Correo electrónico</label>
              <input type="email" class="form-control" [(ngModel)]="datos.email" name="email" placeholder="tu@correo.com" required>
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input type="tel" class="form-control" [(ngModel)]="datos.telefono" name="telefono" placeholder="300 123 4567">
            </div>
            <div class="form-group">
              <label>Contraseña</label>
              <input type="password" class="form-control" [(ngModel)]="datos.password" name="password" placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número" required>
              <p class="hint">Mínimo 8 caracteres, una mayúscula y un número</p>
            </div>
            <div class="form-group">
              <label>Confirmar contraseña</label>
              <input type="password" class="form-control" [(ngModel)]="confirmarPassword" name="confirmar" placeholder="Repite tu contraseña" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="cargando">
              {{ cargando ? 'Registrando...' : 'Crear cuenta' }}
            </button>
          </form>

          <p class="auth-link">
            ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
    .auth-left {
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
      display: flex; align-items: center; justify-content: center; padding: 60px; color: white;
    }
    .auth-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .auth-brand span:first-child { font-size: 2.5rem; }
    .auth-brand h1 { font-family: var(--font-display); font-size: 2.8rem; font-weight: 700; }
    .auth-brand h1 span { color: var(--color-accent); }
    .auth-tagline { font-size: 1.15rem; line-height: 1.7; opacity: 0.9; max-width: 380px; }
    .auth-right { display: flex; align-items: center; justify-content: center; padding: 60px; background: var(--color-bg); }
    .auth-form-wrapper { max-width: 420px; width: 100%; }
    .auth-form-wrapper h2 { font-family: var(--font-display); font-size: 2rem; color: var(--color-primary-dark); margin-bottom: 8px; }
    .auth-subtitle { color: var(--color-text-light); margin-bottom: 32px; }
    .hint { font-size: 0.78rem; color: var(--color-text-muted); margin-top: 4px; }
    .auth-link { text-align: center; margin-top: 24px; color: var(--color-text-light); font-size: 0.9rem; }
    .auth-link a { color: var(--color-primary); font-weight: 600; }
    @media (max-width: 768px) {
      .auth-page { grid-template-columns: 1fr; }
      .auth-left { display: none; }
      .auth-right { padding: 32px 20px; }
    }
  `]
})
export class RegistroComponent {
  datos = { nombre: '', email: '', password: '', telefono: '' };
  confirmarPassword = '';
  error = '';
  cargando = false;

  constructor(private auth: AuthService, private router: Router) {}

  onRegistro() {
    if (!this.datos.nombre || !this.datos.email || !this.datos.password) {
      this.error = 'Todos los campos son obligatorios.';
      return;
    }
    if (this.datos.password !== this.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }
    if (this.datos.password.length < 8 || !/[A-Z]/.test(this.datos.password) || !/[0-9]/.test(this.datos.password)) {
      this.error = 'La contraseña debe tener mín. 8 caracteres, una mayúscula y un número.';
      return;
    }
    this.error = '';
    this.cargando = true;

    this.auth.registro(this.datos).subscribe({
      next: (res) => {
        this.cargando = false;
        // Redirigir a pantalla de verificación
        this.router.navigate(['/verificar-cuenta']);
      },
      error: (err) => {
        this.cargando = false;
        if (err.error?.requiereVerificacion) {
          // Ya existía sin verificar, se reenvió código
          this.auth.setEmailPendiente(err.error.email || this.datos.email);
          this.router.navigate(['/verificar-cuenta']);
        } else {
          this.error = err.error?.mensaje || 'Error en el registro.';
        }
      }
    });
  }
}

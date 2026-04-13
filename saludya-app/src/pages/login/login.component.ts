import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-login',
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
          <p class="auth-tagline">Tu salud, nuestra prioridad.<br>Gestiona tus citas de fisioterapia de forma rápida y sencilla.</p>
          <div class="auth-features">
            <div class="feature"><span>✓</span> Agenda en segundos</div>
            <div class="feature"><span>✓</span> Recordatorios automáticos</div>
            <div class="feature"><span>✓</span> Historial completo</div>
            <div class="feature"><span>✓</span> Disponible 24/7</div>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form-wrapper">
          <h2>Iniciar Sesión</h2>
          <p class="auth-subtitle">Ingresa tus credenciales para continuar</p>

          <div class="alert alert-danger" *ngIf="error">⚠️ {{ error }}</div>

          <form (ngSubmit)="onLogin()">
            <div class="form-group">
              <label for="email">Correo electrónico</label>
              <input type="email" id="email" class="form-control" [(ngModel)]="email"
                name="email" placeholder="tu@correo.com" required>
            </div>

            <div class="form-group">
              <label for="password">Contraseña</label>
              <div class="password-wrapper">
                <input [type]="mostrarPassword ? 'text' : 'password'" id="password"
                  class="form-control" [(ngModel)]="password" name="password"
                  placeholder="••••••••" required>
                <button type="button" class="toggle-pass" (click)="mostrarPassword = !mostrarPassword">
                  {{ mostrarPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <div class="forgot-link">
              <a routerLink="/solicitar-reset">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="cargando">
              {{ cargando ? 'Ingresando...' : 'Iniciar Sesión' }}
            </button>
          </form>

          <p class="auth-link">
            ¿No tienes cuenta?
            <a routerLink="/registro">Regístrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
    .auth-left {
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, #1a7a4c 100%);
      display: flex; align-items: center; justify-content: center; padding: 60px;
      position: relative; overflow: hidden;
    }
    .auth-left::before {
      content: ''; position: absolute; top: -50%; right: -30%;
      width: 600px; height: 600px; border-radius: 50%; background: rgba(232, 168, 56, 0.08);
    }
    .auth-left-content { position: relative; z-index: 1; color: white; }
    .auth-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .auth-brand span:first-child { font-size: 2.5rem; }
    .auth-brand h1 { font-family: var(--font-display); font-size: 2.8rem; font-weight: 700; }
    .auth-brand h1 span { color: var(--color-accent); }
    .auth-tagline { font-size: 1.15rem; line-height: 1.7; opacity: 0.9; margin-bottom: 40px; max-width: 380px; }
    .auth-features { display: flex; flex-direction: column; gap: 14px; }
    .feature { display: flex; align-items: center; gap: 12px; font-size: 0.95rem; opacity: 0.85; }
    .feature span {
      width: 28px; height: 28px; background: rgba(255,255,255,0.15); border-radius: 50%;
      display: flex; align-items: center; justify-content: center; font-size: 0.8rem; flex-shrink: 0;
    }
    .auth-right { display: flex; align-items: center; justify-content: center; padding: 60px; background: var(--color-bg); }
    .auth-form-wrapper { max-width: 400px; width: 100%; }
    .auth-form-wrapper h2 { font-family: var(--font-display); font-size: 2rem; color: var(--color-primary-dark); margin-bottom: 8px; }
    .auth-subtitle { color: var(--color-text-light); margin-bottom: 32px; }
    .password-wrapper { position: relative; }
    .toggle-pass {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; font-size: 1.1rem; cursor: pointer;
    }
    .forgot-link { text-align: right; margin-bottom: 20px; }
    .forgot-link a { color: var(--color-primary); font-size: 0.85rem; font-weight: 500; }
    .forgot-link a:hover { text-decoration: underline; }
    .auth-link { text-align: center; margin-top: 24px; color: var(--color-text-light); font-size: 0.9rem; }
    .auth-link a { color: var(--color-primary); font-weight: 600; }
    .auth-link a:hover { text-decoration: underline; }
    @media (max-width: 768px) {
      .auth-page { grid-template-columns: 1fr; }
      .auth-left { display: none; }
      .auth-right { padding: 32px 20px; }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  cargando = false;
  mostrarPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.error = 'Ingresa tu correo y contraseña.';
      return;
    }
    this.error = '';
    this.cargando = true;

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.requiereVerificacion) {
          // Cuenta no verificada, redirigir a verificación
          this.router.navigate(['/verificar-cuenta']);
        } else {
          this.auth.redirigirPorRol();
        }
      },
      error: (err) => {
        this.cargando = false;
        if (err.status === 403 && err.error?.requiereVerificacion) {
          // El backend envió un nuevo código, redirigir a verificación
          this.auth.setEmailPendiente(err.error.email);
          this.router.navigate(['/verificar-cuenta']);
        } else {
          this.error = err.error?.mensaje || 'Error al iniciar sesión.';
        }
      }
    });
  }
}

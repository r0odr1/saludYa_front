import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-solicitar-reset',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="reset-page">
      <div class="reset-card animate-in">
        <div class="reset-icon">🔑</div>
        <h2>¿Olvidaste tu contraseña?</h2>
        <p class="reset-subtitle">
          Ingresa tu correo electrónico y te enviaremos un código para restablecerla.
        </p>

        <div class="alert alert-danger" *ngIf="error">⚠️ {{ error }}</div>

        <form (ngSubmit)="solicitar()">
          <div class="form-group">
            <label>Correo electrónico</label>
            <input type="email" class="form-control" [(ngModel)]="email"
              name="email" placeholder="tu@correo.com" required>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="cargando || !email">
            {{ cargando ? 'Enviando...' : 'Enviar código' }}
          </button>
        </form>

        <a routerLink="/login" class="back-link">← Volver al inicio de sesión</a>
      </div>
    </div>
  `,
  styles: [`
    .reset-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: var(--color-bg); padding: 20px;
    }
    .reset-card {
      max-width: 420px; width: 100%; background: white; border-radius: var(--radius-lg);
      padding: 48px 40px; text-align: center; box-shadow: var(--shadow-md);
      border: 1px solid var(--color-border);
    }
    .reset-icon { font-size: 3.5rem; margin-bottom: 16px; }
    .reset-card h2 {
      font-family: var(--font-display); font-size: 1.6rem;
      color: var(--color-primary-dark); margin-bottom: 8px;
    }
    .reset-subtitle {
      color: var(--color-text-light); font-size: 0.9rem;
      margin-bottom: 28px; line-height: 1.5;
    }
    .reset-card .form-group { text-align: left; }
    .back-link {
      display: inline-block; margin-top: 24px; color: var(--color-text-light); font-size: 0.85rem;
    }
    .back-link:hover { color: var(--color-primary); }
    @media (max-width: 480px) { .reset-card { padding: 32px 20px; } }
  `]
})
export class SolicitarResetComponent {
  email = '';
  error = '';
  cargando = false;

  constructor(private auth: AuthService, private router: Router) {}

  solicitar() {
    if (!this.email) {
      this.error = 'Ingresa tu correo electrónico.';
      return;
    }
    this.error = '';
    this.cargando = true;

    this.auth.solicitarReset(this.email).subscribe({
      next: () => {
        this.cargando = false;
        this.auth.setEmailPendiente(this.email);
        this.router.navigate(['/verificar-reset']);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.mensaje || 'Error al enviar código.';
      }
    });
  }
}

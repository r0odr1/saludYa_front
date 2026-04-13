import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-nueva-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="reset-page">
      <!-- Formulario de nueva contraseña -->
      <div class="reset-card animate-in" *ngIf="!exitoso">
        <div class="reset-icon">🔒</div>
        <h2>Nueva contraseña</h2>
        <p class="reset-subtitle">Establece tu nueva contraseña para acceder a tu cuenta.</p>

        <div class="alert alert-danger" *ngIf="error">⚠️ {{ error }}</div>

        <form (ngSubmit)="cambiarContrasena()">
          <div class="form-group" style="text-align:left">
            <label>Nueva contraseña</label>
            <input type="password" class="form-control" [(ngModel)]="nuevaPassword"
              name="password" placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número" required>
            <p class="hint">Mínimo 8 caracteres, una mayúscula y un número</p>
          </div>

          <div class="form-group" style="text-align:left">
            <label>Confirmar contraseña</label>
            <input type="password" class="form-control" [(ngModel)]="confirmarPassword"
              name="confirmar" placeholder="Repite tu nueva contraseña" required>
          </div>

          <!-- Indicadores de fuerza -->
          <div class="password-rules">
            <div class="rule" [class.valid]="nuevaPassword.length >= 8">
              {{ nuevaPassword.length >= 8 ? '✅' : '○' }} Mínimo 8 caracteres
            </div>
            <div class="rule" [class.valid]="tieneUpper">
              {{ tieneUpper ? '✅' : '○' }} Una letra mayúscula
            </div>
            <div class="rule" [class.valid]="tieneNumero">
              {{ tieneNumero ? '✅' : '○' }} Un número
            </div>
            <div class="rule" [class.valid]="passwordsCoinciden && nuevaPassword.length > 0">
              {{ passwordsCoinciden && nuevaPassword.length > 0 ? '✅' : '○' }} Las contraseñas coinciden
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg"
            [disabled]="cargando || !formularioValido">
            {{ cargando ? 'Guardando...' : 'Establecer nueva contraseña' }}
          </button>
        </form>
      </div>

      <!-- Pantalla de éxito -->
      <div class="reset-card animate-in" *ngIf="exitoso">
        <div class="reset-icon">🎉</div>
        <h2>¡Contraseña restablecida!</h2>
        <p class="reset-subtitle">Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <a routerLink="/login" class="btn btn-primary btn-lg" style="display:inline-flex">
          Ir a iniciar sesión
        </a>
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
    .hint { font-size: 0.78rem; color: var(--color-text-muted); margin-top: 4px; }

    .password-rules {
      display: flex; flex-direction: column; gap: 6px; margin-bottom: 24px;
      text-align: left; padding: 14px 16px; background: var(--color-bg);
      border-radius: var(--radius-sm);
    }
    .rule { font-size: 0.82rem; color: var(--color-text-muted); transition: var(--transition); }
    .rule.valid { color: var(--color-success); }

    @media (max-width: 480px) { .reset-card { padding: 32px 20px; } }
  `]
})
export class NuevaContrasenaComponent implements OnInit {
  resetToken = '';
  nuevaPassword = '';
  confirmarPassword = '';
  error = '';
  cargando = false;
  exitoso = false;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'] || '';
      if (!this.resetToken) {
        this.router.navigate(['/solicitar-reset']);
      }
    });
  }

  get tieneUpper(): boolean {
    return /[A-Z]/.test(this.nuevaPassword);
  }

  get tieneNumero(): boolean {
    return /[0-9]/.test(this.nuevaPassword);
  }

  get passwordsCoinciden(): boolean {
    return this.nuevaPassword === this.confirmarPassword;
  }

  get formularioValido(): boolean {
    return this.nuevaPassword.length >= 8
      && this.tieneUpper
      && this.tieneNumero
      && this.passwordsCoinciden;
  }

  cambiarContrasena() {
    if (!this.formularioValido) return;

    this.error = '';
    this.cargando = true;

    this.auth.nuevaContrasena(this.resetToken, this.nuevaPassword).subscribe({
      next: () => {
        this.cargando = false;
        this.exitoso = true;
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.mensaje || 'Error al cambiar contraseña. El enlace puede haber expirado.';
      }
    });
  }
}

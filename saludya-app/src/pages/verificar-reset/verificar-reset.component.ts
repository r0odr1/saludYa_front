import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-verificar-reset',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="verify-page">
      <div class="verify-card animate-in">
        <div class="verify-icon">🔐</div>
        <h2>Código de restablecimiento</h2>
        <p class="verify-subtitle">
          Ingresa el código de 6 dígitos que enviamos a
          <strong>{{ email }}</strong>
        </p>

        <div class="alert alert-danger" *ngIf="error">⚠️ {{ error }}</div>

        <div class="code-inputs">
          <input
            *ngFor="let d of digitos; let i = index"
            #digitInput
            type="text"
            maxlength="1"
            class="code-digit"
            [value]="digitos[i]"
            (input)="onDigitInput($event, i)"
            (keydown)="onKeyDown($event, i)"
            (paste)="onPaste($event)"
            inputmode="numeric"
          >
        </div>

        <button
          class="btn btn-primary btn-block btn-lg"
          (click)="verificar()"
          [disabled]="cargando || codigoCompleto.length !== 6"
        >
          {{ cargando ? 'Verificando...' : 'Verificar código' }}
        </button>

        <div class="resend-section">
          <p>¿No recibiste el código?</p>
          <button class="btn btn-ghost" (click)="reenviar()" [disabled]="reenviando || cooldown > 0">
            {{ reenviando ? 'Enviando...' : cooldown > 0 ? 'Reenviar en ' + cooldown + 's' : 'Reenviar código' }}
          </button>
        </div>

        <a routerLink="/login" class="back-link">← Volver al inicio de sesión</a>
      </div>
    </div>
  `,
  styles: [`
    .verify-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: var(--color-bg); padding: 20px;
    }
    .verify-card {
      max-width: 440px; width: 100%; background: white; border-radius: var(--radius-lg);
      padding: 48px 40px; text-align: center; box-shadow: var(--shadow-md);
      border: 1px solid var(--color-border);
    }
    .verify-icon { font-size: 3.5rem; margin-bottom: 16px; }
    .verify-card h2 {
      font-family: var(--font-display); font-size: 1.6rem;
      color: var(--color-primary-dark); margin-bottom: 8px;
    }
    .verify-subtitle { color: var(--color-text-light); font-size: 0.9rem; margin-bottom: 32px; line-height: 1.5; }
    .verify-subtitle strong { color: var(--color-text); }
    .code-inputs { display: flex; gap: 10px; justify-content: center; margin-bottom: 28px; }
    .code-digit {
      width: 52px; height: 60px; border: 2px solid var(--color-border);
      border-radius: var(--radius-sm); text-align: center;
      font-size: 1.6rem; font-weight: 700; font-family: var(--font-body);
      color: var(--color-primary-dark); transition: var(--transition); outline: none;
    }
    .code-digit:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(15, 81, 50, 0.15); }
    .resend-section { margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--color-border); }
    .resend-section p { color: var(--color-text-muted); font-size: 0.85rem; margin-bottom: 8px; }
    .back-link { display: inline-block; margin-top: 20px; color: var(--color-text-light); font-size: 0.85rem; }
    .back-link:hover { color: var(--color-primary); }
    @media (max-width: 480px) {
      .verify-card { padding: 32px 20px; }
      .code-digit { width: 44px; height: 52px; font-size: 1.3rem; }
      .code-inputs { gap: 6px; }
    }
  `]
})
export class VerificarResetComponent implements OnInit {
  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef>;

  email = '';
  digitos: string[] = ['', '', '', '', '', ''];
  error = '';
  cargando = false;
  reenviando = false;
  cooldown = 0;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.email = this.auth.emailPendiente();
    if (!this.email) {
      this.router.navigate(['/solicitar-reset']);
    }
  }

  get codigoCompleto(): string {
    return this.digitos.join('');
  }

  onDigitInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    this.digitos[index] = value;
    input.value = value;
    if (value && index < 5) {
      const inputs = this.digitInputs.toArray();
      inputs[index + 1]?.nativeElement.focus();
    }
    if (this.codigoCompleto.length === 6) {
      this.verificar();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.digitos[index] && index > 0) {
      const inputs = this.digitInputs.toArray();
      inputs[index - 1]?.nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text')?.replace(/\D/g, '') || '';
    if (paste.length >= 6) {
      for (let i = 0; i < 6; i++) this.digitos[i] = paste[i];
      setTimeout(() => {
        const inputs = this.digitInputs.toArray();
        inputs.forEach((input, i) => input.nativeElement.value = this.digitos[i]);
        inputs[5]?.nativeElement.focus();
        this.verificar();
      });
    }
  }

  verificar() {
    if (this.codigoCompleto.length !== 6) return;
    this.error = '';
    this.cargando = true;

    this.auth.verificarReset(this.email, this.codigoCompleto).subscribe({
      next: (res) => {
        this.cargando = false;
        // Guardar resetToken y navegar a nueva contraseña
        this.router.navigate(['/nueva-contrasena'], {
          queryParams: { token: res.resetToken }
        });
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.mensaje || 'Código incorrecto.';
        this.digitos = ['', '', '', '', '', ''];
        setTimeout(() => {
          const inputs = this.digitInputs.toArray();
          inputs[0]?.nativeElement.focus();
        });
      }
    });
  }

  reenviar() {
    this.reenviando = true;
    this.error = '';

    this.auth.solicitarReset(this.email).subscribe({
      next: () => {
        this.reenviando = false;
        this.cooldown = 60;
        const interval = setInterval(() => {
          this.cooldown--;
          if (this.cooldown <= 0) clearInterval(interval);
        }, 1000);
      },
      error: (err) => {
        this.reenviando = false;
        this.error = err.error?.mensaje || 'Error al reenviar.';
      }
    });
  }
}

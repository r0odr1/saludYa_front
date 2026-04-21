import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verificar-reset',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './verificar-reset.component.html',
  styleUrls: ['./verificar-reset.component.scss'],
})
export class VerificarResetComponent implements OnInit {
  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef>;

  email = '';
  digitos: string[] = ['', '', '', '', '', ''];
  error = '';
  cargando = false;
  reenviando = false;
  cooldown = 0;
  mostrarError = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

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

  trackByIndex(index: number): number {
    return index;
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text')?.replace(/\D/g, '') || '';

    if (paste.length > 0) {
      // Llenar los inputs con el texto pegado
      for (let i = 0; i < Math.min(6, paste.length); i++) {
        this.digitos[i] = paste[i];
      }

      // Actualizar los inputs visualmente
      setTimeout(() => {
        const inputs = this.digitInputs.toArray();
        inputs.forEach((input, i) => {
          input.nativeElement.value = this.digitos[i];
        });

        // Enfocar el último input lleno o el siguiente vacío
        const nextIndex = Math.min(5, paste.length);
        inputs[nextIndex]?.nativeElement.focus();

        // Auto-verificar si se completaron los 6 dígitos
        if (this.codigoCompleto.length === 6) {
          this.verificar();
        }
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
          queryParams: { token: res.resetToken },
        });
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.mensaje || 'Código incorrecto.';
        this.mostrarError = true;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.digitos = ['', '', '', '', '', ''];
          const inputs = this.digitInputs.toArray();
          inputs.forEach((input) => (input.nativeElement.value = ''));
          inputs[0]?.nativeElement.focus();
          this.mostrarError = false;
          this.cdr.markForCheck();
        }, 600);
      },
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
      },
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-verificar-cuenta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './verificar-cuenta.component.html',
  styleUrls: ['./verificar-cuenta.component.scss'],
})
export class VerificarCuentaComponent implements OnInit {
  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef>;

  email = '';
  digitos: string[] = ['', '', '', '', '', ''];
  error = '';
  exito = '';
  cargando = false;
  reenviando = false;
  cooldown = 0;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.email = this.auth.emailPendiente();
    if (!this.email) {
      this.router.navigate(['/login']);
    }
  }

  get codigoCompleto(): string {
    return this.digitos.join('');
  }

  private focusInput(index: number) {
    const inputs = this.digitInputs.toArray();
    inputs[index]?.nativeElement.focus();
  }

  private updateInputValues() {
    const inputs = this.digitInputs.toArray();
    inputs.forEach((input, i) => {
      input.nativeElement.value = this.digitos[i] || '';
    });
  }

  onDigitInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, ''); // Solo números

    if (!value) {
      this.digitos[index] = '';
      input.value = '';
      return;
    }

    // Si entran varios caracteres, distribuirlos en los siguientes campos
    if (value.length > 1) {
      for (let i = 0; i < Math.min(6 - index, value.length); i++) {
        this.digitos[index + i] = value[i];
      }
      this.updateInputValues();
      const nextIndex = Math.min(5, index + value.length);
      setTimeout(() => this.focusInput(nextIndex));
      return;
    }

    this.digitos[index] = value;
    input.value = value;
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      this.digitos[index] = event.key;
      input.value = event.key;
      if (index < 5) {
        setTimeout(() => this.focusInput(index + 1));
      }
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      if (this.digitos[index]) {
        this.digitos[index] = '';
        input.value = '';
        return;
      }
      if (index > 0) {
        this.digitos[index - 1] = '';
        setTimeout(() => this.focusInput(index - 1));
      }
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      setTimeout(() => this.focusInput(index - 1));
      return;
    }

    if (event.key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      setTimeout(() => this.focusInput(index + 1));
      return;
    }
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
      });
    }
  }

  verificar() {
    if (this.codigoCompleto.length !== 6) return;

    this.error = '';
    this.exito = '';
    this.cargando = true;

    this.auth.verificarCuenta(this.email, this.codigoCompleto).subscribe({
      next: () => {
        this.cargando = false;
        this.exito = '¡Cuenta verificada!';
        setTimeout(() => this.auth.redirigirPorRol(), 1000);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.mensaje || 'Código incorrecto.';

        // Limpiar inputs en caso de error
        this.digitos = ['', '', '', '', '', ''];
        setTimeout(() => {
          const inputs = this.digitInputs.toArray();
          inputs.forEach((input) => (input.nativeElement.value = ''));
          inputs[0]?.nativeElement.focus();
        });
      },
    });
  }

  reenviar() {
    this.reenviando = true;
    this.error = '';

    this.auth.reenviarCodigo(this.email).subscribe({
      next: () => {
        this.reenviando = false;
        this.exito = 'Nuevo código enviado a tu correo.';

        // Cooldown de 60 segundos
        this.cooldown = 60;
        const interval = setInterval(() => {
          this.cooldown--;
          if (this.cooldown <= 0) clearInterval(interval);
        }, 1000);

        setTimeout(() => (this.exito = ''), 4000);
      },
      error: (err) => {
        this.reenviando = false;
        this.error = err.error?.mensaje || 'Error al reenviar código.';
      },
    });
  }
}

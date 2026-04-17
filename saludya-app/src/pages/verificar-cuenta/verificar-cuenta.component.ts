import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChildren, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
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
export class VerificarCuentaComponent implements OnInit, OnDestroy {
  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef>;

  email = '';
  digitos: string[] = ['', '', '', '', '', ''];
  error = '';
  exito = '';
  cargando = false;
  reenviando = false;
  cooldown = 0;

  // Pantalla de exito
  verificado = false;
  contadorRedireccion = 10;
  progresoRedireccion = 0;
  private redireccionInterval: any;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
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

    // Tomar solo el último dígito ingresado
    const digit = value.slice(-1);
    this.digitos[index] = digit;
    input.value = digit;

    // Avanzar al siguiente
    if (index < 5) {
      setTimeout(() => this.focusInput(index + 1));
    }

    // Auto-verificar al completar
    if (this.codigoCompleto.length === 6) {
      setTimeout(() => this.verificar(), 100);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (this.digitos[index]) {
        this.digitos[index] = '';
        (event.target as HTMLInputElement).value = '';
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

    // Bloquear letras y caracteres especiales
    if (event.key.length === 1 && !/^[0-9]$/.test(event.key)) {
      event.preventDefault();
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
        this.verificado = true;
        this.iniciarRedireccion();
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

  private iniciarRedireccion() {
    this.contadorRedireccion = 10;
    this.progresoRedireccion = 0;

    this.ngZone.runOutsideAngular(() => {
      this.redireccionInterval = setInterval(() => {
        this.ngZone.run(() => {
          this.contadorRedireccion--;
          this.progresoRedireccion = ((10 - this.contadorRedireccion) / 10) * 100;
          this.cdr.markForCheck();

          if (this.contadorRedireccion <= 0) {
            clearInterval(this.redireccionInterval);
            this.irAlInicio();
          }
        });
      }, 1000);
    });
  }

  irAlInicio() {
    if (this.redireccionInterval) {
      clearInterval(this.redireccionInterval);
    }
    // Limpiar sesión para que no redirija al dashboard
    this.auth.logout();
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

  ngOnDestroy() {
    if (this.redireccionInterval) {
      clearInterval(this.redireccionInterval);
    }
  }
}

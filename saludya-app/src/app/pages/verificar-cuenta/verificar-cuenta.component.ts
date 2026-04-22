import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
  mostrarError = false;

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

  onPaste(event: ClipboardEvent, index: number = 0) {
    event.preventDefault();
    const paste = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    
    if (paste.length > 0) {
      // Limpiar array primero
      this.digitos = ['', '', '', '', '', ''];
      
      // Llenar el array desde la posición actual
      for (let i = 0; i < paste.length && i < 6; i++) {
        this.digitos[i] = paste[i];
      }
      
      // Enfocar el siguiente input vacío
      const nextIndex = Math.min(5, paste.length);
      setTimeout(() => this.focusInput(nextIndex));
      
      if (this.digitos.every(d => d !== '')) {
        this.verificar();
      }
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
        this.mostrarError = true;
        this.cdr.markForCheck();

        // Limpiar inputs después de la animación
        setTimeout(() => {
          this.digitos = ['', '', '', '', '', ''];
          const inputs = this.digitInputs.toArray();
          inputs[0]?.nativeElement.focus();
          this.mostrarError = false;
          this.cdr.markForCheck();
        }, 600);
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
    if (this.cooldown > 0) return;
    
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


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

  onDigitChange(index: number) {
    // Si el usuario escribió un dígito, avanzar al siguiente
    if (this.digitos[index] && index < 5) {
      setTimeout(() => this.focusInput(index + 1));
    }
    
    // Si completó los 6 dígitos
    if (this.digitos.every(d => d !== '')) {
      this.verificar();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    // Permitir solo números, backspace y flechas
    if (/^[0-9]$/.test(event.key)) {
      if (index < 5) {
        setTimeout(() => this.focusInput(index + 1));
      }
      return;
    }

    // Manejar Backspace para retroceder al input anterior si está vacío
    if (event.key === 'Backspace') {
      if (!this.digitos[index] && index > 0) {
        setTimeout(() => this.focusInput(index - 1));
      }
      return;
    }

    // Permitir navegación con flechas
    if (event.key === 'ArrowLeft' && index > 0) {
      setTimeout(() => this.focusInput(index - 1));
      return;
    }
    if (event.key === 'ArrowRight' && index < 5) {
      setTimeout(() => this.focusInput(index + 1));
      return;
    }

    // Prevenir entrada de caracteres no numéricos
    if (!['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'].includes(event.key)) {
      event.preventDefault();
    }
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
          inputs[0]?.nativeElement.focus();
        });
      },
    });
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
}
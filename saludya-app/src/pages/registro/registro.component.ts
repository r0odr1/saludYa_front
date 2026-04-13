import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent {
  datos = { nombre: '', email: '', password: '', telefono: '' };
  confirmarPassword = '';
  error = '';
  cargando = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  onRegistro() {
    if (!this.datos.nombre || !this.datos.email || !this.datos.password) {
      this.error = 'Todos los campos son obligatorios.';
      return;
    }
    if (this.datos.password !== this.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }
    if (
      this.datos.password.length < 8 ||
      !/[A-Z]/.test(this.datos.password) ||
      !/[0-9]/.test(this.datos.password)
    ) {
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
      },
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  cargando = false;
  mostrarPassword = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

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
      },
    });
  }
}

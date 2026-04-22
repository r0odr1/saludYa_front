import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  nombre = '';
  telefono = '';
  contrasenaActual = '';
  nuevaContrasena = '';
  confirmarContrasena = '';

  mensajePerfil = '';
  errorPerfil = '';
  guardandoPerfil = false;

  mensajePassword = '';
  errorPassword = '';
  guardandoPassword = false;

  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.nombre = this.auth.usuario()?.nombre || '';
    this.telefono = (this.auth.usuario() as any)?.telefono || '';
  }

  get tieneUpper(): boolean {
    return /[A-Z]/.test(this.nuevaContrasena);
  }
  get tieneNumero(): boolean {
    return /[0-9]/.test(this.nuevaContrasena);
  }
  get passwordsCoinciden(): boolean {
    return this.nuevaContrasena === this.confirmarContrasena && this.nuevaContrasena.length > 0;
  }

  get passwordFormValido(): boolean {
    return (
      this.contrasenaActual.length > 0 &&
      this.nuevaContrasena.length >= 8 &&
      this.tieneUpper &&
      this.tieneNumero &&
      this.passwordsCoinciden
    );
  }

  guardarPerfil() {
    this.errorPerfil = '';
    this.mensajePerfil = '';
    this.guardandoPerfil = true;

    this.auth.actualizarPerfil({ nombre: this.nombre, telefono: this.telefono }).subscribe({
      next: () => {
        this.guardandoPerfil = false;
        this.mensajePerfil = 'Perfil actualizado correctamente.';
        setTimeout(() => (this.mensajePerfil = ''), 4000);
      },
      error: (err) => {
        this.guardandoPerfil = false;
        this.errorPerfil = err.error?.mensaje || 'Error al actualizar perfil.';
      },
    });
  }

  cambiarContrasena() {
    if (!this.passwordFormValido) return;

    this.errorPassword = '';
    this.mensajePassword = '';
    this.guardandoPassword = true;

    this.auth.cambiarContrasena(this.contrasenaActual, this.nuevaContrasena).subscribe({
      next: () => {
        this.guardandoPassword = false;
        this.mensajePassword = 'Contraseña cambiada exitosamente.';
        this.contrasenaActual = '';
        this.nuevaContrasena = '';
        this.confirmarContrasena = '';
        setTimeout(() => (this.mensajePassword = ''), 4000);
      },
      error: (err) => {
        this.guardandoPassword = false;
        this.errorPassword = err.error?.mensaje || 'Error al cambiar contraseña.';
      },
    });
  }
}

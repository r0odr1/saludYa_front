import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class RegistroComponent implements OnInit {
  datos = { 
    nombre: '', 
    email: '', 
    password: '', 
    telefono: '',
    confirmarPassword: ''
  };
  
  // Flags para controlar cuándo mostrar errores
  submitted = false;
  error = '';
  cargando = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (this.auth.estaLogueado()) {
      this.auth.redirigirPorRol();
    }
  }

  //VALIDADORES INDIVIDUALES
  
  get nombreInvalido(): boolean {
    return this.submitted && (!this.datos.nombre || this.datos.nombre.trim().length < 3);
  }

  get emailInvalido(): boolean {
    return this.submitted && (!this.datos.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.datos.email));
  }

  get telefonoInvalido(): boolean {
    return this.submitted && (!this.datos.telefono || !/^[0-9]{10}$/.test(this.datos.telefono));
  }

  get passwordInvalido(): boolean {
    const pwd = this.datos.password;
    return this.submitted && (
      !pwd || 
      pwd.length < 8 || 
      !/[A-Z]/.test(pwd) || 
      !/[0-9]/.test(pwd)
    );
  }

  get confirmarPasswordInvalido(): boolean {
    return this.submitted && (
      !this.datos.confirmarPassword || 
      this.datos.password !== this.datos.confirmarPassword
    );
  }

  get formularioValido(): boolean {
    return (
      this.datos.nombre.trim().length >= 3 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.datos.email) &&
      /^[0-9]{10}$/.test(this.datos.telefono) &&
      this.datos.password.length >= 8 &&
      /[A-Z]/.test(this.datos.password) &&
      /[0-9]/.test(this.datos.password) &&
      this.datos.password === this.datos.confirmarPassword
    );
  }

  onNombreChange() {
    if (this.submitted) this.nombreInvalido;
  }

  onEmailChange() {
    if (this.submitted) this.emailInvalido;
  }

  onTelefonoInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Solo permitir números
    input.value = input.value.replace(/\D/g, '').slice(0, 10);
    this.datos.telefono = input.value;
    if (this.submitted) this.telefonoInvalido;
  }

  onPasswordChange() {
    if (this.submitted) this.passwordInvalido;
  }

  onConfirmarPasswordChange() {
    if (this.submitted) this.confirmarPasswordInvalido;
  }

  onRegistro() {
    this.submitted = true;
    this.error = '';

    // Validar todos los campos
    if (!this.formularioValido) {
      if (this.nombreInvalido) {
        this.error = 'El nombre debe tener al menos 3 caracteres.';
      } else if (this.emailInvalido) {
        this.error = 'Ingrese un correo electrónico válido.';
      } else if (this.telefonoInvalido) {
        this.error = 'El teléfono debe tener 10 dígitos numéricos.';
      } else if (this.passwordInvalido) {
        this.error = 'La contraseña debe tener mín. 8 caracteres, una mayúscula y un número.';
      } else if (this.confirmarPasswordInvalido) {
        this.error = 'Las contraseñas no coinciden.';
      }
      return;
    }

    this.cargando = true;

    this.auth.registro(this.datos).subscribe({
      next: (res) => {
        this.cargando = false;
        // Redirigir a pantalla de verificación
        this.auth.setEmailPendiente(this.datos.email);
        this.router.navigate(['/verificar-cuenta']);
      },
      error: (err) => {
        this.cargando = false;
        if (err.error?.requiereVerificacion) {
          // Ya existía sin verificar, se reenvió código
          this.auth.setEmailPendiente(this.datos.email);
          this.router.navigate(['/verificar-cuenta']);
        } else {
          this.error = err.error?.mensaje || 'Error en el registro.';
        }
      },
    });
  }
}
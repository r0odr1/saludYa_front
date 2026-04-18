import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-nueva-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './nueva-contrasena.component.html',
  styleUrls: ['./nueva-contrasena.component.scss'],
})
export class NuevaContrasenaComponent implements OnInit, OnDestroy {
  resetToken = '';
  nuevaPassword = '';
  confirmarPassword = '';
  error = '';
  cargando = false;
  exitoso = false;

  // Pantalla de éxito con redirección
  contadorRedireccion = 10;
  progresoRedireccion = 0;
  private redireccionInterval: any;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'] || '';
      if (!this.resetToken) {
        this.router.navigate(['/solicitar-reset']);
      }
    });
  }

  get tieneUpper(): boolean {
    return /[A-Z]/.test(this.nuevaPassword);
  }

  get tieneNumero(): boolean {
    return /[0-9]/.test(this.nuevaPassword);
  }

  get passwordsCoinciden(): boolean {
    return this.nuevaPassword === this.confirmarPassword;
  }

  get formularioValido(): boolean {
    return this.nuevaPassword.length >= 8
      && this.tieneUpper
      && this.tieneNumero
      && this.passwordsCoinciden;
  }

  cambiarContrasena() {
    if (!this.formularioValido) return;

    this.error = '';
    this.cargando = true;

    this.auth.nuevaContrasena(this.resetToken, this.nuevaPassword).subscribe({
      next: () => {
        this.cargando = false;
        this.exitoso = true;
        this.iniciarRedireccion();
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.mensaje || 'Error al cambiar contraseña. El enlace puede haber expirado.';
      }
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
            this.irAlLogin();
          }
        });
      }, 1000);
    });
  }

  irAlLogin() {
    if (this.redireccionInterval) {
      clearInterval(this.redireccionInterval);
    }
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    if (this.redireccionInterval) {
      clearInterval(this.redireccionInterval);
    }
  }
}

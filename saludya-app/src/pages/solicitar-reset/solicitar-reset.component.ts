import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-solicitar-reset',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './solicitar-reset.component.html',
  styleUrls: ['./solicitar-reset.component.scss']
})
export class SolicitarResetComponent {
  email = '';
  error = '';
  cargando = false;

  constructor(private auth: AuthService, private router: Router) {}

  solicitar() {
    if (!this.email) {
      this.error = 'Ingresa tu correo electrónico.';
      return;
    }
    this.error = '';
    this.cargando = true;

    this.auth.solicitarReset(this.email).subscribe({
      next: () => {
        this.cargando = false;
        this.auth.setEmailPendiente(this.email);
        this.router.navigate(['/verificar-reset']);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.mensaje || 'Error al enviar código.';
      }
    });
  }
}

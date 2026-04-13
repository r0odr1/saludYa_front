import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: 'paciente' | 'doctor' | 'admin';
  cuentaVerificada: boolean;
}

interface AuthResponse {
  mensaje: string;
  token?: string;
  usuario?: Usuario;
  requiereVerificacion?: boolean;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private _usuario = signal<Usuario | null>(null);
  private _token = signal<string | null>(null);

  // Email pendiente de verificación para pasar entre pantallas
  private _emailPendiente = signal<string>('');

  usuario = this._usuario.asReadonly();
  token = this._token.asReadonly();
  emailPendiente = this._emailPendiente.asReadonly();
  estaLogueado = computed(() => !!this._token());
  esAdmin = computed(() => this._usuario()?.rol === 'admin');
  esDoctor = computed(() => this._usuario()?.rol === 'doctor');
  esPaciente = computed(() => this._usuario()?.rol === 'paciente');
  rol = computed(() => this._usuario()?.rol || '');

  constructor(private http: HttpClient, private router: Router) {
    this.cargarSesion();
  }

  private cargarSesion() {
    const token = localStorage.getItem('sy_token');
    const usuario = localStorage.getItem('sy_usuario');
    if (token && usuario) {
      try {
        this._token.set(token);
        this._usuario.set(JSON.parse(usuario));
      } catch {
        this.logout();
      }
    }
  }

  // ===== REGISTRO =====
  registro(datos: { nombre: string; email: string; password: string; telefono: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/registro`, datos).pipe(
      tap(res => {
        if (res.email) {
          this._emailPendiente.set(res.email);
        }
      })
    );
  }

  // ===== VERIFICAR CUENTA =====
  verificarCuenta(email: string, codigo: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/verificar-cuenta`, { email, codigo }).pipe(
      tap(res => {
        if (res.token && res.usuario) {
          this.guardarSesion(res.token, res.usuario);
          this._emailPendiente.set('');
        }
      })
    );
  }

  // ===== REENVIAR CÓDIGO =====
  reenviarCodigo(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/reenviar-codigo`, { email });
  }

  // ===== LOGIN =====
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        if (res.requiereVerificacion && res.email) {
          this._emailPendiente.set(res.email);
        } else if (res.token && res.usuario) {
          this.guardarSesion(res.token, res.usuario);
        }
      })
    );
  }

  // ===== SOLICITAR RESET DE CONTRASEÑA =====
  solicitarReset(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/solicitar-reset`, { email }).pipe(
      tap(res => {
        if (res.email) {
          this._emailPendiente.set(res.email);
        }
      })
    );
  }

  // ===== VERIFICAR CÓDIGO DE RESET =====
  verificarReset(email: string, codigo: string): Observable<{ mensaje: string; resetToken: string }> {
    return this.http.post<{ mensaje: string; resetToken: string }>(`${this.apiUrl}/verificar-reset`, { email, codigo });
  }

  // ===== NUEVA CONTRASEÑA =====
  nuevaContrasena(resetToken: string, nuevaPassword: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/nueva-contrasena`, { resetToken, nuevaPassword });
  }

  // ===== PERFIL =====
  actualizarPerfil(datos: { nombre: string; telefono: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/perfil`, datos).pipe(
      tap(res => {
        if (res.usuario) {
          const token = this._token();
          if (token) {
            this.guardarSesion(token, res.usuario);
          }
        }
      })
    );
  }

  cambiarContrasena(contrasenaActual: string, nuevaContrasena: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cambiar-contrasena`, { contrasenaActual, nuevaContrasena });
  }

  // ===== SESIÓN =====
  logout() {
    localStorage.removeItem('sy_token');
    localStorage.removeItem('sy_usuario');
    this._token.set(null);
    this._usuario.set(null);
    this._emailPendiente.set('');
    this.router.navigate(['/login']);
  }

  setEmailPendiente(email: string) {
    this._emailPendiente.set(email);
  }

  private guardarSesion(token: string, usuario: Usuario) {
    localStorage.setItem('sy_token', token);
    localStorage.setItem('sy_usuario', JSON.stringify(usuario));
    this._token.set(token);
    this._usuario.set(usuario);
  }

  obtenerToken(): string | null {
    return this._token();
  }

  redirigirPorRol() {
    const rol = this._usuario()?.rol;
    switch (rol) {
      case 'paciente': this.router.navigate(['/paciente/dashboard']); break;
      case 'doctor': this.router.navigate(['/doctor/dashboard']); break;
      case 'admin': this.router.navigate(['/admin/dashboard']); break;
      default: this.router.navigate(['/login']);
    }
  }
}

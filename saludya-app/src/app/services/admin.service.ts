import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  /** Doctores */
  registrarDoctor(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/doctores`, datos);
  }

  listarDoctores(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/doctores`);
  }

  actualizarDoctor(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/doctores/${id}`, datos);
  }

  /** Especialidades */
  crearEspecialidad(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/especialidades`, datos);
  }

  listarEspecialidades(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/especialidades`);
  }

  actualizarEspecialidad(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/especialidades/${id}`, datos);
  }

  eliminarEspecialidad(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/especialidades/${id}`);
  }

  /** Usuarios */
  listarUsuarios(rol?: string, buscar?: string): Observable<any> {
    const params: string[] = [];
    if (rol) params.push(`rol=${rol}`);
    if (buscar) params.push(`buscar=${buscar}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<any>(`${this.apiUrl}/usuarios${query}`);
  }

  crearUsuario(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios`, datos);
  }

  actualizarUsuario(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/usuarios/${id}`, datos);
  }

  cambiarRol(userId: string, datos: { rol: string; especialidades?: string[]; horarios?: any[] }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/usuarios/${userId}/rol`, datos);
  }

  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/usuarios/${id}`);
  }

  /** Citas - Administrador*/
  listarCitas(filtros?: { pacienteId?: string; doctorId?: string; estado?: string; fecha?: string }): Observable<any> {
    const params: string[] = [];
    if (filtros?.pacienteId) params.push(`pacienteId=${filtros.pacienteId}`);
    if (filtros?.doctorId) params.push(`doctorId=${filtros.doctorId}`);
    if (filtros?.estado) params.push(`estado=${filtros.estado}`);
    if (filtros?.fecha) params.push(`fecha=${filtros.fecha}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<any>(`${this.apiUrl}/citas${query}`);
  }

  obtenerCita(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/citas/${id}`);
  }

  actualizarCita(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/citas/${id}`, datos);
  }

  eliminarCita(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/citas/${id}`);
  }

  /** Reportes */
  getReportes(mes?: number, anio?: number): Observable<any> {
    const params: string[] = [];
    if (mes) params.push(`mes=${mes}`);
    if (anio) params.push(`anio=${anio}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<any>(`${this.apiUrl}/reportes${query}`);
  }
}

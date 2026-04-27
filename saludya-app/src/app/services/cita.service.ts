import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CitaService {
  private apiUrl = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  /** Listar todos los doctores - accesible para doctor y admin */
  getDoctores(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/doctores`);
  }

  getEspecialidades(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/especialidades`);
  }

  getDoctoresPorEspecialidad(especialidadId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/doctores-por-especialidad/${especialidadId}`);
  }

  getDisponibilidad(doctorId: string, fecha: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/disponibilidad/${doctorId}/${fecha}`);
  }

  agendarCita(datos: { doctorId: string; especialidadId: string; fecha: string; horaInicio: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, datos);
  }

  getMisCitas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mis-citas`);
  }

  editarCita(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, datos);
  }

  cancelarCita(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  //** Doctor */
  getAgendaDoctor(fecha?: string, estado?: string): Observable<any> {
    const params: string[] = [];
    if (fecha) params.push(`fecha=${fecha}`);
    if (estado) params.push(`estado=${estado}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<any>(`${this.apiUrl}/doctor/agenda${query}`);
  }

  reasignarCita(citaId: string, nuevoDoctorId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${citaId}/reasignar`, { nuevoDoctorId });
  }

  agregarNota(citaId: string, contenido: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${citaId}/notas`, { contenido });
  }

  completarCita(citaId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${citaId}/completar`, {});
  }

  getHistorialPaciente(pacienteId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/historial/${pacienteId}`);
  }
}

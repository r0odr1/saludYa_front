import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CitaService {
  private apiUrl = `${environment.apiUrl}/citas`;
  private especialidadesCache$?: Observable<any[]>;

  constructor(private http: HttpClient) {}

  /** Listar todos los doctores - accesible para doctor y admin */
  getDoctores(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/doctores`);
  }

  getEspecialidades(): Observable<any[]> {
    // Limpiar caché para debugging
    this.especialidadesCache$ = undefined;

    if (!this.especialidadesCache$) {
      this.especialidadesCache$ = this.http.get<any>(`${this.apiUrl}/especialidades`).pipe(
        catchError((err) => {
          if (err.status === 404) {
            return this.http.get<any>(`${environment.apiUrl}/especialidades`);
          }
          return throwError(() => err);
        }),
        map((res) => {
          const normalized = this.normalizeEspecialidadesResponse(res);
          return normalized;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.especialidadesCache$;
  }

  private normalizeEspecialidadesResponse(res: any): any[] {
    if (Array.isArray(res)) {
      return res;
    }
    if (res && Array.isArray(res.especialidades)) {
      return res.especialidades;
    }
    if (res && Array.isArray(res.data)) {
      return res.data;
    }
    if (res && typeof res === 'object') {
      return [res];
    }
    return [];
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

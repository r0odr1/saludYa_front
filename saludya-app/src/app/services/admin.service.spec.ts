/**
 * admin.service.spec.ts
 * Pruebas del servicio de administración.
 * Cubre todos los métodos: doctores, especialidades,
 * usuarios, citas admin y reportes.
 */

import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AdminService } from './admin.service';
import { environment } from '../../environments/environment';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/admin`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica que no queden peticiones HTTP sin resolver
    httpMock.verify();
  });

  // Doctores
  describe('registrarDoctor()', () => {
    it('debe hacer POST a /admin/doctores', () => {
      const datos = {
        nombre: 'Dr. Test',
        email: 'drtest@test.com',
        password: 'Doctor123!',
        telefono: '3001112233',
        especialidades: ['esp-id-1'],
        horarios: [{ dia: 1, horaInicio: '08:00', horaFin: '17:00', intervaloMinutos: 30 }],
      };

      service.registrarDoctor(datos).subscribe(res => {
        expect(res.doctor).toBeDefined();
        expect(res.mensaje).toBe('Doctor registrado exitosamente');
      });

      const req = httpMock.expectOne(`${apiUrl}/doctores`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(datos);
      req.flush({
        mensaje: 'Doctor registrado exitosamente',
        doctor: { _id: 'doc-1', usuario: { nombre: 'Dr. Test' } },
      });
    });
  });

  describe('listarDoctores()', () => {
    it('debe hacer GET a /admin/doctores', () => {
      service.listarDoctores().subscribe(res => {
        expect(Array.isArray(res.doctores)).toBe(true);
        expect(res.doctores.length).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/doctores`);
      expect(req.request.method).toBe('GET');
      req.flush({
        doctores: [
          { _id: 'doc-1', usuario: { nombre: 'Dr. María' } },
          { _id: 'doc-2', usuario: { nombre: 'Dr. Carlos' } },
        ],
      });
    });
  });

  describe('actualizarDoctor()', () => {
    it('debe hacer PUT a /admin/doctores/:id', () => {
      const datos = { activo: false };

      service.actualizarDoctor('doc-1', datos).subscribe(res => {
        expect(res.doctor.activo).toBe(false);
      });

      const req = httpMock.expectOne(`${apiUrl}/doctores/doc-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(datos);
      req.flush({ mensaje: 'Doctor actualizado', doctor: { _id: 'doc-1', activo: false } });
    });
  });

  // Especialidades
  describe('crearEspecialidad()', () => {
    it('debe hacer POST a /admin/especialidades', () => {
      const datos = {
        nombre: 'Electroterapia',
        descripcion: 'Terapia con ultrasonido',
        duracionMinutos: 30,
        color: '#D97706',
      };

      service.crearEspecialidad(datos).subscribe(res => {
        expect(res.especialidad.nombre).toBe('Electroterapia');
      });

      const req = httpMock.expectOne(`${apiUrl}/especialidades`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(datos);
      req.flush({
        mensaje: 'Especialidad creada',
        especialidad: { _id: 'esp-1', nombre: 'Electroterapia', duracionMinutos: 30 },
      });
    });
  });

  describe('listarEspecialidades()', () => {
    it('debe hacer GET a /admin/especialidades', () => {
      service.listarEspecialidades().subscribe(res => {
        expect(Array.isArray(res.especialidades)).toBe(true);
        expect(res.especialidades.length).toBe(3);
      });

      const req = httpMock.expectOne(`${apiUrl}/especialidades`);
      expect(req.request.method).toBe('GET');
      req.flush({
        especialidades: [
          { _id: 'esp-1', nombre: 'Electroterapia', activa: true },
          { _id: 'esp-2', nombre: 'Masoterapia', activa: true },
          { _id: 'esp-3', nombre: 'Evaluación', activa: true },
        ],
      });
    });
  });

  describe('actualizarEspecialidad()', () => {
    it('debe hacer PUT a /admin/especialidades/:id', () => {
      const datos = { duracionMinutos: 45, descripcion: 'Actualizada' };

      service.actualizarEspecialidad('esp-1', datos).subscribe(res => {
        expect(res.especialidad.duracionMinutos).toBe(45);
      });

      const req = httpMock.expectOne(`${apiUrl}/especialidades/esp-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(datos);
      req.flush({
        mensaje: 'Especialidad actualizada',
        especialidad: { _id: 'esp-1', duracionMinutos: 45 },
      });
    });
  });

  describe('eliminarEspecialidad()', () => {
    it('debe hacer DELETE a /admin/especialidades/:id', () => {
      service.eliminarEspecialidad('esp-1').subscribe(res => {
        expect(res.especialidad.activa).toBe(false);
      });

      const req = httpMock.expectOne(`${apiUrl}/especialidades/esp-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({
        mensaje: 'Especialidad desactivada',
        especialidad: { _id: 'esp-1', activa: false },
      });
    });
  });

  // Usuarios
  describe('listarUsuarios()', () => {
    it('debe hacer GET a /admin/usuarios sin filtros', () => {
      service.listarUsuarios().subscribe(res => {
        expect(Array.isArray(res.usuarios)).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/usuarios`);
      expect(req.request.method).toBe('GET');
      req.flush({ usuarios: [] });
    });

    it('debe incluir el parámetro rol si se proporciona', () => {
      service.listarUsuarios('paciente').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/usuarios?rol=paciente`);
      expect(req.request.method).toBe('GET');
      req.flush({ usuarios: [] });
    });

    it('debe incluir el parámetro buscar si se proporciona', () => {
      service.listarUsuarios(undefined, 'juan').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/usuarios?buscar=juan`);
      expect(req.request.method).toBe('GET');
      req.flush({ usuarios: [] });
    });

    it('debe incluir rol y buscar juntos si se proporcionan ambos', () => {
      service.listarUsuarios('doctor', 'maria').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/usuarios?rol=doctor&buscar=maria`);
      expect(req.request.method).toBe('GET');
      req.flush({ usuarios: [] });
    });
  });

  describe('crearUsuario()', () => {
    it('debe hacer POST a /admin/usuarios', () => {
      const datos = {
        nombre: 'Usuario Nuevo',
        email: 'nuevo@test.com',
        password: 'Test1234!',
        rol: 'paciente',
      };

      service.crearUsuario(datos).subscribe(res => {
        expect(res.usuario.cuentaVerificada).toBe(true);
        expect(res.usuario.rol).toBe('paciente');
      });

      const req = httpMock.expectOne(`${apiUrl}/usuarios`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(datos);
      req.flush({
        mensaje: 'Usuario creado exitosamente',
        usuario: { _id: 'u-1', ...datos, cuentaVerificada: true },
      });
    });
  });

  describe('actualizarUsuario()', () => {
    it('debe hacer PUT a /admin/usuarios/:id', () => {
      const datos = { nombre: 'Nombre Editado', telefono: '3119876543' };

      service.actualizarUsuario('u-1', datos).subscribe(res => {
        expect(res.usuario.nombre).toBe('Nombre Editado');
      });

      const req = httpMock.expectOne(`${apiUrl}/usuarios/u-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(datos);
      req.flush({
        mensaje: 'Usuario actualizado',
        usuario: { _id: 'u-1', nombre: 'Nombre Editado', telefono: '3119876543' },
      });
    });
  });

  describe('cambiarRol()', () => {
    it('debe hacer PUT a /admin/usuarios/:id/rol', () => {
      service.cambiarRol('u-1', { rol: 'doctor' }).subscribe(res => {
        expect(res.usuario.rol).toBe('doctor');
        expect(res.mensaje).toContain('doctor');
      });

      const req = httpMock.expectOne(`${apiUrl}/usuarios/u-1/rol`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ rol: 'doctor' });
      req.flush({
        mensaje: 'Rol cambiado de paciente a doctor exitosamente.',
        usuario: { _id: 'u-1', rol: 'doctor' },
      });
    });

    it('debe enviar especialidades y horarios al cambiar a doctor', () => {
      const datos = {
        rol: 'doctor',
        especialidades: ['esp-1'],
        horarios: [{ dia: 1, horaInicio: '08:00', horaFin: '17:00', intervaloMinutos: 30 }],
      };

      service.cambiarRol('u-1', datos).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/usuarios/u-1/rol`);
      expect(req.request.body).toEqual(datos);
      req.flush({ mensaje: 'Rol cambiado', usuario: { rol: 'doctor' } });
    });
  });

  describe('eliminarUsuario()', () => {
    it('debe hacer DELETE a /admin/usuarios/:id', () => {
      service.eliminarUsuario('u-1').subscribe(res => {
        expect(res.mensaje).toContain('desactivado');
      });

      const req = httpMock.expectOne(`${apiUrl}/usuarios/u-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ mensaje: 'Usuario desactivado exitosamente.' });
    });
  });

  // Citas Admin
  describe('listarCitas()', () => {
    it('debe hacer GET a /admin/citas sin filtros', () => {
      service.listarCitas().subscribe(res => {
        expect(Array.isArray(res.citas)).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/citas`);
      expect(req.request.method).toBe('GET');
      req.flush({ citas: [] });
    });

    it('debe incluir filtro de estado', () => {
      service.listarCitas({ estado: 'agendada' }).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/citas?estado=agendada`);
      expect(req.request.method).toBe('GET');
      req.flush({ citas: [] });
    });

    it('debe incluir filtro de fecha', () => {
      service.listarCitas({ fecha: '2026-04-16' }).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/citas?fecha=2026-04-16`);
      expect(req.request.method).toBe('GET');
      req.flush({ citas: [] });
    });

    it('debe incluir filtro de pacienteId', () => {
      service.listarCitas({ pacienteId: 'pac-1' }).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/citas?pacienteId=pac-1`);
      expect(req.request.method).toBe('GET');
      req.flush({ citas: [] });
    });

    it('debe combinar múltiples filtros', () => {
      service.listarCitas({ estado: 'agendada', fecha: '2026-04-16' }).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/citas?estado=agendada&fecha=2026-04-16`);
      expect(req.request.method).toBe('GET');
      req.flush({ citas: [] });
    });
  });

  describe('obtenerCita()', () => {
    it('debe hacer GET a /admin/citas/:id', () => {
      service.obtenerCita('cita-1').subscribe(res => {
        expect(res.cita._id).toBe('cita-1');
        expect(res.cita).toHaveProperty('paciente');
        expect(res.cita).toHaveProperty('doctor');
        expect(res.cita).toHaveProperty('especialidad');
      });

      const req = httpMock.expectOne(`${apiUrl}/citas/cita-1`);
      expect(req.request.method).toBe('GET');
      req.flush({
        cita: {
          _id: 'cita-1',
          paciente: { nombre: 'Juan' },
          doctor: { usuario: { nombre: 'Dr. María' } },
          especialidad: { nombre: 'Electroterapia' },
          estado: 'agendada',
        },
      });
    });
  });

  describe('actualizarCita()', () => {
    it('debe hacer PUT a /admin/citas/:id con fecha y hora', () => {
      const datos = { fecha: '2026-04-18', horaInicio: '15:00' };

      service.actualizarCita('cita-1', datos).subscribe(res => {
        expect(res.cita.horaInicio).toBe('15:00');
      });

      const req = httpMock.expectOne(`${apiUrl}/citas/cita-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(datos);
      req.flush({
        mensaje: 'Cita actualizada',
        cita: { _id: 'cita-1', horaInicio: '15:00', estado: 'agendada' },
      });
    });

    it('debe hacer PUT con solo el estado', () => {
      const datos = { estado: 'completada' };

      service.actualizarCita('cita-1', datos).subscribe(res => {
        expect(res.cita.estado).toBe('completada');
      });

      const req = httpMock.expectOne(`${apiUrl}/citas/cita-1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ mensaje: 'Cita actualizada', cita: { _id: 'cita-1', estado: 'completada' } });
    });
  });

  describe('eliminarCita()', () => {
    it('debe hacer DELETE a /admin/citas/:id', () => {
      service.eliminarCita('cita-1').subscribe(res => {
        expect(res.mensaje).toContain('eliminada');
      });

      const req = httpMock.expectOne(`${apiUrl}/citas/cita-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ mensaje: 'Cita eliminada por el administrador.' });
    });
  });

  // Reportes
  describe('getReportes()', () => {
    it('debe hacer GET a /admin/reportes sin parámetros', () => {
      service.getReportes().subscribe(res => {
        expect(res).toHaveProperty('totalCitas');
        expect(res).toHaveProperty('porEspecialidad');
        expect(res).toHaveProperty('porEstado');
        expect(res).toHaveProperty('periodo');
      });

      const req = httpMock.expectOne(`${apiUrl}/reportes`);
      expect(req.request.method).toBe('GET');
      req.flush({
        periodo: { inicio: '2026-04-01', fin: '2026-04-30' },
        totalCitas: 24,
        porEspecialidad: [{ especialidad: 'Electroterapia', total: 8 }],
        porEstado: [{ _id: 'completada', total: 18 }],
      });
    });

    it('debe incluir mes y año como parámetros', () => {
      service.getReportes(4, 2026).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/reportes?mes=4&anio=2026`);
      expect(req.request.method).toBe('GET');
      req.flush({ periodo: {}, totalCitas: 0, porEspecialidad: [], porEstado: [] });
    });

    it('debe incluir solo el mes si no se proporciona año', () => {
      service.getReportes(4).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/reportes?mes=4`);
      expect(req.request.method).toBe('GET');
      req.flush({ periodo: {}, totalCitas: 0, porEspecialidad: [], porEstado: [] });
    });
  });
});

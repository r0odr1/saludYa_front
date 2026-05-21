/**
 * cita.service.spec.ts
 * Pruebas del servicio de citas.
 */

import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CitaService } from './cita.service';
import { environment } from '../../environments/environment';

describe('CitaService', () => {
  let service: CitaService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/citas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CitaService],
    });
    service = TestBed.inject(CitaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { httpMock.verify(); });

  // Especialidades y doctores
  describe('obtenerEspecialidades()', () => {
    it('debe hacer GET a /citas/especialidades', () => {
      service.getEspecialidades().subscribe(res => {
        expect(res.length).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/especialidades`);
      expect(req.request.method).toBe('GET');
      req.flush({
        especialidades: [
          { _id: '1', nombre: 'Electroterapia', duracionMinutos: 30 },
          { _id: '2', nombre: 'Masoterapia', duracionMinutos: 30 },
        ],
      });
    });
  });

  describe('doctoresPorEspecialidad()', () => {
    it('debe hacer GET a /citas/doctores-por-especialidad/:id', () => {
      service.getDoctoresPorEspecialidad('esp-id-1').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/doctores-por-especialidad/esp-id-1`);
      expect(req.request.method).toBe('GET');
      req.flush({ doctores: [] });
    });
  });

  describe('obtenerDisponibilidad()', () => {
    it('debe hacer GET con doctorId y fecha en la URL', () => {
      service.getDisponibilidad('doc-id-1', '2026-04-16').subscribe(res => {
        expect(res.disponible).toBe(true);
        expect(res.horarios.length).toBeGreaterThan(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/disponibilidad/doc-id-1/2026-04-16`);
      expect(req.request.method).toBe('GET');
      req.flush({
        disponible: true,
        horarios: [{ inicio: '08:00', fin: '08:30', disponible: true }],
      });
    });
  });

  // Agendar cita
  describe('agendarCita()', () => {
    it('debe hacer POST a /citas con los datos correctos', () => {
      const datos = {
        doctorId: 'doc-1',
        especialidadId: 'esp-1',
        fecha: '2026-04-16',
        horaInicio: '10:00',
      };

      service.agendarCita(datos).subscribe(res => {
        expect(res.cita.estado).toBe('agendada');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(datos);
      req.flush({
        mensaje: 'Cita agendada',
        cita: {
          _id: 'cita-1',
          estado: 'agendada',
          horaInicio: '10:00',
          horaFin: '10:30',
        },
      });
    });
  });

  // Mis citas
  describe('misCitas()', () => {
    it('debe hacer GET a /citas/mis-citas', () => {
      service.getMisCitas().subscribe(res => {
        expect(Array.isArray(res.citas)).toBe(true);
        expect(res.citas.length).toBe(1);
        // El flag esCancelable debe estar presente
        expect(res.citas[0]).toHaveProperty('esCancelable');
      });

      const req = httpMock.expectOne(`${apiUrl}/mis-citas`);
      expect(req.request.method).toBe('GET');
      req.flush({
        citas: [{ _id: 'c1', estado: 'agendada', esCancelable: true }],
      });
    });
  });

  // Editar cita
  describe('editarCita()', () => {
    it('debe hacer PUT a /citas/:id', () => {
      service.editarCita('cita-1', { fecha: '2026-04-17', horaInicio: '14:00' }).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/cita-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ fecha: '2026-04-17', horaInicio: '14:00' });
      req.flush({ mensaje: 'Cita actualizada', cita: {} });
    });
  });

  // Cancelar cita
  describe('cancelarCita()', () => {
    it('debe hacer DELETE a /citas/:id', () => {
      service.cancelarCita('cita-1').subscribe(res => {
        expect(res.mensaje).toContain('cancelada');
      });

      const req = httpMock.expectOne(`${apiUrl}/cita-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ mensaje: 'Cita cancelada.' });
    });
  });

  // Agenda del doctor
  describe('agendaDoctor()', () => {
    it('debe hacer GET a /citas/doctor/agenda sin filtros', () => {
      service.getAgendaDoctor().subscribe();

      const req = httpMock.expectOne(`${apiUrl}/doctor/agenda`);
      expect(req.request.method).toBe('GET');
      req.flush({ citas: [] });
    });

    it('debe incluir el parámetro fecha si se proporciona', () => {
      service.getAgendaDoctor('2026-04-16').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/doctor/agenda?fecha=2026-04-16`);
      expect(req.request.method).toBe('GET');
      req.flush({ citas: [] });
    });
  });

  // Notas medicas
  describe('agregarNota()', () => {
    it('debe hacer POST a /citas/:id/notas', () => {
      const contenido = 'Paciente con dolor lumbar leve.';
      service.agregarNota('cita-1', contenido).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/cita-1/notas`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ contenido });
      req.flush({ mensaje: 'Nota agregada', cita: {} });
    });
  });

  // Completar cita
  describe('completarCita()', () => {
    it('debe hacer PUT a /citas/:id/completar', () => {
      service.completarCita('cita-1').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/cita-1/completar`);
      expect(req.request.method).toBe('PUT');
      req.flush({ mensaje: 'Cita completada' });
    });
  });

  // Reasignar cita
  describe('reasignarCita()', () => {
    it('debe hacer PUT a /citas/:id/reasignar', () => {
      service.reasignarCita('cita-1', 'doc-2').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/cita-1/reasignar`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ nuevoDoctorId: 'doc-2' });
      req.flush({ mensaje: 'Cita reasignada', cita: {} });
    });
  });

  // Historial del paciente
  describe('historialPaciente()', () => {
    it('debe hacer GET a /citas/historial/:pacienteId', () => {
      service.getHistorialPaciente('pac-1').subscribe(res => {
        expect(Array.isArray(res.historial)).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/historial/pac-1`);
      expect(req.request.method).toBe('GET');
      req.flush({ historial: [] });
    });
  });

  // getDoctores
  describe('getDoctores()', () => {
    it('debe hacer GET a /citas/doctores', () => {
      service.getDoctores().subscribe(res => {
        expect(res.doctores.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/doctores`);

      expect(req.request.method).toBe('GET');

      req.flush({
        doctores: [
          {
            _id: '1',
            nombre: 'Dr Juan',
          },
        ],
      });
    });
  });

  // getEspecialidades - normalize response
  describe('getEspecialidades() normalize', () => {

    it('debe retornar array directamente si la respuesta ya es un array', () => {
      const mockArray = [
        { _id: '1', nombre: 'Fisioterapia' },
      ];

      service.getEspecialidades().subscribe(res => {
        expect(Array.isArray(res)).toBe(true);
        expect(res.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/especialidades`);

      req.flush(mockArray);
    });

    it('debe retornar res.data si existe data[]', () => {
      service.getEspecialidades().subscribe(res => {
        expect(res.length).toBe(1);
        expect(res[0].nombre).toBe('Neurología');
      });

      const req = httpMock.expectOne(`${apiUrl}/especialidades`);

      req.flush({
        data: [
          {
            _id: '1',
            nombre: 'Neurología',
          },
        ],
      });
    });

    it('debe retornar objeto convertido en array', () => {
      service.getEspecialidades().subscribe(res => {
        expect(res.length).toBe(1);
        expect(res[0].nombre).toBe('Única');
      });

      const req = httpMock.expectOne(`${apiUrl}/especialidades`);

      req.flush({
        _id: '1',
        nombre: 'Única',
      });
    });

    it('debe retornar array vacío si la respuesta no es válida', () => {
      service.getEspecialidades().subscribe(res => {
        expect(res).toEqual([]);
      });

      const req = httpMock.expectOne(`${apiUrl}/especialidades`);

      req.flush(null);
    });
  });

  // catchError
  describe('getEspecialidades() errores', () => {

    it('debe intentar endpoint alternativo si recibe 404', () => {

      service.getEspecialidades().subscribe(res => {
        expect(res.length).toBe(1);
      });

      // Primer request
      const req1 = httpMock.expectOne(`${apiUrl}/especialidades`);

      req1.flush(
        {},
        {
          status: 404,
          statusText: 'Not Found',
        }
      );

      // Segundo request - fallback
      const req2 = httpMock.expectOne(
        `${environment.apiUrl}/especialidades`
      );

      expect(req2.request.method).toBe('GET');

      req2.flush([
        {
          _id: '1',
          nombre: 'Fallback',
        },
      ]);
    });

    it('debe lanzar error si no es 404', () => {

      let errorResponse: any;

      service.getEspecialidades().subscribe({
        next: () => fail('debió fallar'),
        error: (err) => {
          errorResponse = err;
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/especialidades`);

      req.flush(
        { mensaje: 'Error interno' },
        {
          status: 500,
          statusText: 'Server Error',
        }
      );

      expect(errorResponse.status).toBe(500);
    });
  });
});

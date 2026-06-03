/**
 * mis-citas.component.spec.ts
 * Pruebas unitarias para MisCitasComponent
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MisCitasComponent } from './mis-citas.component';
import { CitaService } from '../../../services/cita.service';

describe('MisCitasComponent', () => {
  let component: MisCitasComponent;
  let fixture: ComponentFixture<MisCitasComponent>;

  let citaServiceMock: {
    getMisCitas: jest.Mock;
    cancelarCita: jest.Mock;
    getDisponibilidad: jest.Mock;
    editarCita: jest.Mock;
  };

  beforeEach(async () => {
    citaServiceMock = {
      getMisCitas: jest.fn().mockReturnValue(
        of({
          citas: []
        })
      ),

      cancelarCita: jest.fn(),

      getDisponibilidad: jest.fn(),

      editarCita: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MisCitasComponent],
      providers: [
        {
          provide: CitaService,
          useValue: citaServiceMock
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MisCitasComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ngOnInit()', () => {
    it('debe cargar citas y generar fechas', () => {
      const cargarSpy = jest.spyOn(component, 'cargarCitas');
      const fechasSpy = jest.spyOn(component, 'generarFechasEdit');

      component.ngOnInit();

      expect(cargarSpy).toHaveBeenCalled();
      expect(fechasSpy).toHaveBeenCalled();
    });

    it('debe obtener citaId desde queryParams', () => {
      component.ngOnInit();

      expect(component.citaSeleccionadaId)
        .toBeNull();
    });
  });

  // Getter Citas Filtradas
  describe('citasFiltradas', () => {
    beforeEach(() => {
      component.citas = [
        { estado: 'pendiente' },
        { estado: 'cancelada' },
        { estado: 'pendiente' }
      ];
    });

    it('debe retornar todas las citas', () => {
      component.filtro = 'todas';

      expect(component.citasFiltradas.length)
        .toBe(3);
    });

    it('debe filtrar citas por estado', () => {
      component.filtro = 'pendiente';

      expect(component.citasFiltradas.length)
        .toBe(2);
    });
  });

  // Cargar Citar
  describe('cargarCitas()', () => {
    it('debe cargar citas correctamente', () => {
      const citasMock = [
        { _id: '1' },
        { _id: '2' }
      ];

      citaServiceMock.getMisCitas.mockReturnValue(
        of({
          citas: citasMock
        })
      );

      const scrollSpy = jest.spyOn(component, 'scrollToSelected');

      component.cargarCitas();

      expect(component.citas)
        .toEqual(citasMock);

      expect(component.cargando)
        .toBe(false);

      expect(scrollSpy)
        .toHaveBeenCalled();
    });

    it('debe manejar error al cargar citas', () => {
      citaServiceMock.getMisCitas.mockReturnValue(
        throwError(() => new Error('Error'))
      );

      component.cargarCitas();

      expect(component.citas)
        .toEqual([]);

      expect(component.cargando)
        .toBe(false);
    });
  });


  // Scroll
  describe('scrollToSelected()', () => {
    it('debe hacer scroll si encuentra el elemento', () => {
      const mockElement = {
        scrollIntoView: jest.fn()
      };

      jest.spyOn(document, 'querySelector')
        .mockReturnValue(mockElement as unknown as Element);

      component.scrollToSelected();

      expect(mockElement.scrollIntoView)
        .toHaveBeenCalled();
    });

    it('no debe fallar si no encuentra el elemento', () => {
      jest.spyOn(document, 'querySelector')
        .mockReturnValue(null);

      expect(() => component.scrollToSelected())
        .not.toThrow();
    });
  });

  // Cancelar Cita
  describe('confirmarCancelar()', () => {
    it('debe asignar la cita a cancelar', () => {
      const cita = { _id: '1' };

      component.confirmarCancelar(cita);

      expect(component.citaCancelar)
        .toEqual(cita);
    });
  });

  describe('cancelarCita()', () => {
    beforeEach(() => {
      component.citaCancelar = {
        _id: '123'
      };
    });

    it('debe cancelar cita correctamente', () => {
      citaServiceMock.cancelarCita.mockReturnValue(
        of({})
      );

      const cargarSpy = jest.spyOn(component, 'cargarCitas');

      component.cancelarCita();

      expect(component.procesando)
        .toBe(false);

      expect(component.citaCancelar)
        .toBeNull();

      expect(cargarSpy)
        .toHaveBeenCalled();
    });

    it('debe manejar error al cancelar cita', () => {
      const alertSpy = jest.spyOn(window, 'alert')
        .mockImplementation(() => {});

      citaServiceMock.cancelarCita.mockReturnValue(
        throwError(() => ({
          error: {
            mensaje: 'Error cancelando'
          }
        }))
      );

      component.cancelarCita();

      expect(component.procesando)
        .toBe(false);

      expect(alertSpy)
        .toHaveBeenCalledWith('Error cancelando');
    });
  });

  // Editar Cita
  describe('abrirEditar()', () => {
    it('debe inicializar variables de edición', () => {
      const cita = { _id: '1' };

      component.abrirEditar(cita);

      expect(component.citaEditar)
        .toEqual(cita);

      expect(component.nuevaFecha)
        .toBe('');

      expect(component.nuevoHorario)
        .toBe('');

      expect(component.horariosEdit)
        .toEqual([]);

      expect(component.errorEdit)
        .toBe('');
    });
  });

  describe('generarFechasEdit()', () => {
    it('debe generar fechas disponibles', () => {
      component.fechasEdit = [];

      component.generarFechasEdit();

      expect(component.fechasEdit.length)
        .toBeGreaterThan(0);
    });
  });

  describe('seleccionarNuevaFecha()', () => {
    beforeEach(() => {
      component.citaEditar = {
        doctor: {
          _id: 'doctor1'
        }
      };
    });

    it('debe cargar horarios disponibles', () => {
      citaServiceMock.getDisponibilidad.mockReturnValue(
        of({
          horarios: ['08:00', '09:00']
        })
      );

      component.seleccionarNuevaFecha('2026-01-01');

      expect(component.nuevaFecha)
        .toBe('2026-01-01');

      expect(component.horariosEdit)
        .toEqual(['08:00', '09:00']);

      expect(component.cargandoHorariosEdit)
        .toBe(false);
    });

    it('debe manejar error cargando horarios', () => {
      citaServiceMock.getDisponibilidad.mockReturnValue(
        throwError(() => new Error('Error'))
      );

      component.seleccionarNuevaFecha('2026-01-01');

      expect(component.errorEdit)
        .toBe('Error al cargar horarios');

      expect(component.cargandoHorariosEdit)
        .toBe(false);
    });
  });

  describe('guardarEdicion()', () => {
    beforeEach(() => {
      component.citaEditar = {
        _id: 'cita1'
      };

      component.nuevaFecha = '2026-01-01';
      component.nuevoHorario = '08:00';
    });

    it('debe editar cita correctamente', () => {
      citaServiceMock.editarCita.mockReturnValue(
        of({})
      );

      const cargarSpy = jest.spyOn(component, 'cargarCitas');

      component.guardarEdicion();

      expect(component.procesando)
        .toBe(false);

      expect(component.citaEditar)
        .toBeNull();

      expect(cargarSpy)
        .toHaveBeenCalled();
    });

    it('debe manejar error al editar cita', () => {
      citaServiceMock.editarCita.mockReturnValue(
        throwError(() => ({
          error: {
            mensaje: 'Error editando'
          }
        }))
      );

      component.guardarEdicion();

      expect(component.procesando)
        .toBe(false);

      expect(component.errorEdit)
        .toBe('Error editando');
    });
  });

  // Formato Fecha
  describe('formatFecha()', () => {
    it('debe formatear fecha larga', () => {
      const resultado = component.formatFecha(
        '2026-06-10T00:00:00'
      );

      expect(resultado)
        .toContain('2026');
    });
  });

  describe('formatFechaCorta()', () => {
    it('debe formatear fecha corta', () => {
      const resultado = component.formatFechaCorta(
        '2026-06-10T00:00:00'
      );

      expect(resultado.length)
        .toBeGreaterThan(0);
    });
  });
    // Tests adicionales para cobertura de branches - CORREGIDOS

  describe('Template branches - Estados de carga y vacío', () => {
    
    
    it('should show empty state with filter text', () => {
      citaServiceMock.getMisCitas.mockReturnValue(of({ citas: [] }));
      
      fixture = TestBed.createComponent(MisCitasComponent);
      component = fixture.componentInstance;
      component.filtro = 'agendada';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const emptyText = compiled.querySelector('h3')?.textContent;
      expect(emptyText).toContain('agendadas');
    });

    it('should show citas list when has data', () => {
      const mockCita = {
        _id: '1',
        estado: 'agendada',
        especialidad: { nombre: 'Test', color: '#000' },
        doctor: { usuario: { nombre: 'Dr. Test' } },
        fecha: '2024-01-15',
        horaInicio: '09:00',
        horaFin: '09:30',
        esCancelable: true
      };
      
      citaServiceMock.getMisCitas.mockReturnValue(of({ citas: [mockCita] }));
      
      fixture = TestBed.createComponent(MisCitasComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.citas-list')).toBeTruthy();
      expect(compiled.querySelectorAll('.cita-item').length).toBe(1);
    });
  });

  describe('Template branches - Filtros activos', () => {
    it('should apply active class to todas filter', () => {
      component.filtro = 'todas';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('.filtro-btn');
      expect(buttons[0].classList).toContain('active');
    });

    it('should apply active class to agendada filter', () => {
      component.filtro = 'agendada';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('.filtro-btn');
      expect(buttons[1].classList).toContain('active');
    });

    it('should apply active class to completada filter', () => {
      component.filtro = 'completada';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('.filtro-btn');
      expect(buttons[2].classList).toContain('active');
    });

    it('should apply active class to cancelada filter', () => {
      component.filtro = 'cancelada';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('.filtro-btn');
      expect(buttons[3].classList).toContain('active');
    });
  });

  describe('Template branches - Badge states', () => {
    it('should apply badge-success for agendada', () => {
      const mockCita = {
        _id: '1',
        estado: 'agendada',
        especialidad: { nombre: 'Test', color: '#000' },
        doctor: { usuario: { nombre: 'Dr. Test' } },
        fecha: '2024-01-15',
        horaInicio: '09:00',
        horaFin: '09:30'
      };
      
      citaServiceMock.getMisCitas.mockReturnValue(of({ citas: [mockCita] }));
      
      fixture = TestBed.createComponent(MisCitasComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const badge = compiled.querySelector('.badge');
      expect(badge?.classList).toContain('badge-success');
    });

    it('should apply badge-info for completada', () => {
      const mockCita = {
        _id: '1',
        estado: 'completada',
        especialidad: { nombre: 'Test', color: '#000' },
        doctor: { usuario: { nombre: 'Dr. Test' } },
        fecha: '2024-01-15',
        horaInicio: '09:00',
        horaFin: '09:30'
      };
      
      citaServiceMock.getMisCitas.mockReturnValue(of({ citas: [mockCita] }));
      
      fixture = TestBed.createComponent(MisCitasComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const badge = compiled.querySelector('.badge');
      expect(badge?.classList).toContain('badge-info');
    });

    it('should apply badge-danger for cancelada', () => {
      const mockCita = {
        _id: '1',
        estado: 'cancelada',
        especialidad: { nombre: 'Test', color: '#000' },
        doctor: { usuario: { nombre: 'Dr. Test' } },
        fecha: '2024-01-15',
        horaInicio: '09:00',
        horaFin: '09:30'
      };
      
      citaServiceMock.getMisCitas.mockReturnValue(of({ citas: [mockCita] }));
      
      fixture = TestBed.createComponent(MisCitasComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const badge = compiled.querySelector('.badge');
      expect(badge?.classList).toContain('badge-danger');
    });

    it('should apply badge-warning for no_asistio', () => {
      const mockCita = {
        _id: '1',
        estado: 'no_asistio',
        especialidad: { nombre: 'Test', color: '#000' },
        doctor: { usuario: { nombre: 'Dr. Test' } },
        fecha: '2024-01-15',
        horaInicio: '09:00',
        horaFin: '09:30'
      };
      
      citaServiceMock.getMisCitas.mockReturnValue(of({ citas: [mockCita] }));
      
      fixture = TestBed.createComponent(MisCitasComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const badge = compiled.querySelector('.badge');
      expect(badge?.classList).toContain('badge-warning');
    });
  });

  describe('Template branches - Notas y acciones', () => {
    it('should show notas section when cita has notes', () => {
      const mockCita = {
        _id: '1',
        estado: 'agendada',
        especialidad: { nombre: 'Test', color: '#000' },
        doctor: { usuario: { nombre: 'Dr. Test' } },
        fecha: '2024-01-15',
        horaInicio: '09:00',
        horaFin: '09:30',
        notas: [{ contenido: 'Nota', doctor: { nombre: 'Dr. Test' }, fecha: '2024-01-15' }]
      };
      
      citaServiceMock.getMisCitas.mockReturnValue(of({ citas: [mockCita] }));
      
      fixture = TestBed.createComponent(MisCitasComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.cita-notas')).toBeTruthy();
      expect(compiled.querySelectorAll('.nota').length).toBe(1);
    });

    it('should NOT show notas section when cita has no notes', () => {
      const mockCita = {
        _id: '1',
        estado: 'agendada',
        especialidad: { nombre: 'Test', color: '#000' },
        doctor: { usuario: { nombre: 'Dr. Test' } },
        fecha: '2024-01-15',
        horaInicio: '09:00',
        horaFin: '09:30',
        notas: []
      };
      
      citaServiceMock.getMisCitas.mockReturnValue(of({ citas: [mockCita] }));
      
      fixture = TestBed.createComponent(MisCitasComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.cita-notas')).toBeFalsy();
    });

    it('should show actions for agendada cita', () => {
      const mockCita = {
        _id: '1',
        estado: 'agendada',
        esCancelable: true,
        especialidad: { nombre: 'Test', color: '#000' },
        doctor: { usuario: { nombre: 'Dr. Test' } },
        fecha: '2024-01-15',
        horaInicio: '09:00',
        horaFin: '09:30'
      };
      
      citaServiceMock.getMisCitas.mockReturnValue(of({ citas: [mockCita] }));
      
      fixture = TestBed.createComponent(MisCitasComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.cita-actions')).toBeTruthy();
      expect(compiled.querySelector('.btn-outline')).toBeTruthy();
      expect(compiled.querySelector('.btn-danger')).toBeTruthy();
    });

    it('should NOT show actions for non-agendada cita', () => {
      const mockCita = {
        _id: '1',
        estado: 'completada',
        especialidad: { nombre: 'Test', color: '#000' },
        doctor: { usuario: { nombre: 'Dr. Test' } },
        fecha: '2024-01-15',
        horaInicio: '09:00',
        horaFin: '09:30'
      };
      
      citaServiceMock.getMisCitas.mockReturnValue(of({ citas: [mockCita] }));
      
      fixture = TestBed.createComponent(MisCitasComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.cita-actions')).toBeFalsy();
    });

    it('should show restriction message when not cancelable', () => {
      const mockCita = {
        _id: '1',
        estado: 'agendada',
        esCancelable: false,
        especialidad: { nombre: 'Test', color: '#000' },
        doctor: { usuario: { nombre: 'Dr. Test' } },
        fecha: '2024-01-15',
        horaInicio: '09:00',
        horaFin: '09:30'
      };
      
      citaServiceMock.getMisCitas.mockReturnValue(of({ citas: [mockCita] }));
      
      fixture = TestBed.createComponent(MisCitasComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.restriccion-aviso')).toBeTruthy();
      expect(compiled.querySelector('.btn-outline')).toBeFalsy();
      expect(compiled.querySelector('.btn-danger')).toBeFalsy();
    });
  });

  describe('Template branches - Modal cancelar', () => {
    it('should show cancel modal', () => {
      component.citaCancelar = {
        _id: '1',
        especialidad: { nombre: 'Test' },
        fecha: '2024-01-15',
        horaInicio: '09:00'
      };
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.modal-backdrop')).toBeTruthy();
      expect(compiled.querySelector('.modal-header h3')?.textContent).toContain('Cancelar');
    });

    it('should close cancel modal', () => {
      component.citaCancelar = { _id: '1' };
      fixture.detectChanges();

      const modal = fixture.nativeElement.querySelector('.modal-backdrop');
      modal.click();
      fixture.detectChanges();

      expect(component.citaCancelar).toBeNull();
    });

    it('should disable cancel button when processing', () => {
      component.citaCancelar = { _id: '1' };
      component.procesando = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('.modal-footer button.btn-danger') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });
  });

  describe('Template branches - Modal editar', () => {
    it('should show edit modal', () => {
      component.citaEditar = {
        _id: '1',
        especialidad: { nombre: 'Test' },
        doctor: { _id: 'doc1' }
      };
      component.fechasEdit = [
        { valor: '2024-01-15', diaSemana: 'Lun', dia: 15 }
      ];
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelectorAll('.modal-backdrop').length).toBeGreaterThan(0);
      expect(compiled.querySelector('.modal-header h3')?.textContent).toContain('Reprogramar');
    });

    it('should show loading when loading horarios', () => {
      component.citaEditar = {
        _id: '1',
        especialidad: { nombre: 'Test' },
        doctor: { _id: 'doc1' }
      };
      component.cargandoHorariosEdit = true;
      component.fechasEdit = [];
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.loading-wrapper')).toBeTruthy();
    });

    it('should show horarios when available', () => {
      component.citaEditar = {
        _id: '1',
        especialidad: { nombre: 'Test' },
        doctor: { _id: 'doc1' }
      };
      component.horariosEdit = [
        { inicio: '08:00' },
        { inicio: '09:00' }
      ];
      component.fechasEdit = [];
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.edit-horarios')).toBeTruthy();
      expect(compiled.querySelectorAll('.horario-mini').length).toBe(2);
    });

    it('should show error message', () => {
      component.citaEditar = {
        _id: '1',
        especialidad: { nombre: 'Test' },
        doctor: { _id: 'doc1' }
      };
      component.errorEdit = 'Error al reprogramar';
      component.fechasEdit = [];
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.alert-danger')).toBeTruthy();
      expect(compiled.querySelector('.alert-danger')?.textContent).toContain('Error al reprogramar');
    });

    it('should disable save button when no horario selected', () => {
      component.citaEditar = { _id: '1' };
      component.nuevoHorario = '';
      component.fechasEdit = [];
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('.modal-footer button.btn-primary') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it('should disable save button when processing', () => {
      component.citaEditar = { _id: '1' };
      component.nuevoHorario = '08:00';
      component.procesando = true;
      component.fechasEdit = [];
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('.modal-footer button.btn-primary') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });
  });

  describe('Template branches - Highlight and colors', () => {
    

    it('should use default color when especialidad is null', () => {
      const mockCita = {
        _id: '1',
        estado: 'agendada',
        especialidad: null,
        doctor: { usuario: { nombre: 'Dr. Test' } },
        fecha: '2024-01-15',
        horaInicio: '09:00',
        horaFin: '09:30'
      };
      
      citaServiceMock.getMisCitas.mockReturnValue(of({ citas: [mockCita] }));
      
      fixture = TestBed.createComponent(MisCitasComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const bar = compiled.querySelector('.cita-bar') as HTMLElement;
      expect(bar.style.background).toBe('rgb(79, 70, 229)');
    });

    it('should apply selected class to date', () => {
      component.citaEditar = { _id: '1' };
      component.nuevaFecha = '2024-01-15';
      component.fechasEdit = [
        { valor: '2024-01-15', diaSemana: 'Lun', dia: 15 }
      ];
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const fechaEl = compiled.querySelector('.fecha-mini');
      expect(fechaEl?.classList).toContain('selected');
    });

    it('should apply selected class to horario', () => {
      component.citaEditar = { _id: '1' };
      component.nuevoHorario = '08:00';
      component.horariosEdit = [{ inicio: '08:00' }];
      component.fechasEdit = [];
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const horarioEl = compiled.querySelector('.horario-mini');
      expect(horarioEl?.classList).toContain('selected');
    });
  });

  describe('citasFiltradas edge cases', () => {
    it('should handle empty citas array', () => {
      component.citas = [];
      component.filtro = 'todas';

      expect(component.citasFiltradas).toEqual([]);
    });

    it('should filter by all states', () => {
      component.citas = [
        { estado: 'agendada' },
        { estado: 'completada' },
        { estado: 'cancelada' },
        { estado: 'no_asistio' }
      ];

      component.filtro = 'agendada';
      expect(component.citasFiltradas.length).toBe(1);

      component.filtro = 'completada';
      expect(component.citasFiltradas.length).toBe(1);

      component.filtro = 'cancelada';
      expect(component.citasFiltradas.length).toBe(1);
    });
  });

  describe('Scroll to selected', () => {
    it('should not fail when element not found', () => {
      jest.spyOn(document, 'querySelector').mockReturnValue(null);
      
      expect(() => component.scrollToSelected()).not.toThrow();
    });
  });
});
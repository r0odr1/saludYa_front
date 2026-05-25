/**
 * dashboard-admin.component.spec.ts
 * Pruebas del Dashboard del Administrador.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { DashboardAdminComponent } from './dashboard-admin.component';
import { AuthService } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';

const authMock = {
  usuario: jest.fn().mockReturnValue({ nombre: 'Admin', rol: 'admin' }),
  esAdmin: jest.fn().mockReturnValue(true),
};

const adminMock = {
  listarUsuarios: jest.fn().mockReturnValue(of({ usuarios: [] })),
  listarDoctores: jest.fn().mockReturnValue(of({ doctores: [] })),
  listarEspecialidades: jest.fn().mockReturnValue(of({ especialidades: [] })),
};

describe('DashboardAdminComponent', () => {
  let component: DashboardAdminComponent;
  let fixture: ComponentFixture<DashboardAdminComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DashboardAdminComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: AdminService, useValue: adminMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el nombre del admin', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Admin');
  });

  it('debe mostrar las cards de acceso a las secciones', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.admin-card, [routerLink]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('debe tener enlace a gestionar doctores', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Doctores');
  });

  it('debe tener enlace a gestionar especialidades', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Especialidades');
  });

  it('debe tener enlace a gestionar usuarios', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Usuarios');
  });

  it('debe tener enlace a reportes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Reportes');
  });
});

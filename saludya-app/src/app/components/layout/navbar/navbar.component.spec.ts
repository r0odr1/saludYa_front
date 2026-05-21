/**
 * navbar.component.spec.ts
 * Pruebas del componente Navbar con dropdown de perfil.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../../services/auth.service';
import { signal } from '@angular/core';

// Mock del AuthService con signals
const mockUsuarioPaciente = { _id: '1', nombre: 'Juan Pérez', email: 'juan@test.com', rol: 'paciente' };
const mockUsuarioDoctor = { _id: '2', nombre: 'Dra. María', email: 'maria@test.com', rol: 'doctor' };
const mockUsuarioAdmin = { _id: '3', nombre: 'Admin', email: 'admin@test.com', rol: 'admin' };

function crearAuthMock(usuario: any, logueado = true) {
  return {
    usuario: jest.fn().mockReturnValue(usuario),
    estaLogueado: jest.fn().mockReturnValue(logueado),
    esPaciente: jest.fn().mockReturnValue(usuario?.rol === 'paciente'),
    esDoctor: jest.fn().mockReturnValue(usuario?.rol === 'doctor'),
    esAdmin: jest.fn().mockReturnValue(usuario?.rol === 'admin'),
    logout: jest.fn(),
  };
}

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authMock: ReturnType<typeof crearAuthMock>;

  async function setup(usuario = mockUsuarioPaciente) {
    authMock = crearAuthMock(usuario);
    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  // Creacion
  describe('Creación', () => {
    beforeEach(async () => setup());

    it('debe crearse correctamente', () => expect(component).toBeTruthy());

    it('el dropdown debe estar cerrado al inicio', () => {
      expect(component.dropdownOpen).toBe(false);
    });
  });

  // Dropdown
  describe('Dropdown de perfil', () => {
    beforeEach(async () => setup());

    it('toggleDropdown() debe abrir el dropdown', () => {
      const event = { stopPropagation: jest.fn() } as unknown as Event;
      component.toggleDropdown(event);
      expect(component.dropdownOpen).toBe(true);
    });

    it('toggleDropdown() debe cerrar el dropdown si ya estaba abierto', () => {
      const event = { stopPropagation: jest.fn() } as unknown as Event;
      component.dropdownOpen = true;
      component.toggleDropdown(event);
      expect(component.dropdownOpen).toBe(false);
    });

    it('closeDropdown() debe cerrar el dropdown', () => {
      component.dropdownOpen = true;
      component.closeDropdown();
      expect(component.dropdownOpen).toBe(false);
    });

    it('onDocumentClick() debe cerrar el dropdown', () => {
      component.dropdownOpen = true;
      component.onDocumentClick();
      expect(component.dropdownOpen).toBe(false);
    });
  });

  // Logout
  describe('Logout', () => {
    beforeEach(async () => setup());

    it('onLogout() debe llamar a auth.logout()', () => {
      component.dropdownOpen = true;
      component.onLogout();
      expect(authMock.logout).toHaveBeenCalled();
    });

    it('onLogout() debe cerrar el dropdown', () => {
      component.dropdownOpen = true;
      component.onLogout();
      expect(component.dropdownOpen).toBe(false);
    });
  });

  // Renderizado condicional por rol
  describe('Paciente — links de navegación', () => {
    beforeEach(async () => setup(mockUsuarioPaciente));

    it('debe mostrar enlace a Especialidades', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = compiled.querySelectorAll('a');
      const textos = Array.from(links).map(l => l.textContent?.trim());
      expect(textos.some(t => t?.includes('Especialidades'))).toBe(true);
    });

    it('debe mostrar enlace a Mis Citas', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = compiled.querySelectorAll('a');
      const textos = Array.from(links).map(l => l.textContent?.trim());
      expect(textos.some(t => t?.includes('Citas'))).toBe(true);
    });

    it('no debe mostrar enlace a Mi Agenda (solo doctor)', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = Array.from(compiled.querySelectorAll('a'));
      const textos = links.map(l => l.textContent?.trim());
      expect(textos.some(t => t === 'Mi Agenda')).toBe(false);
    });
  });

  describe('Doctor — links de navegación', () => {
    beforeEach(async () => setup(mockUsuarioDoctor));

    it('debe mostrar enlace a Mi Agenda', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = compiled.querySelectorAll('a');
      const textos = Array.from(links).map(l => l.textContent?.trim());
      expect(textos.some(t => t?.includes('Agenda'))).toBe(true);
    });
  });

  describe('Admin — links de navegación', () => {
    beforeEach(async () => setup(mockUsuarioAdmin));

    it('debe mostrar enlace a Panel', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = compiled.querySelectorAll('a');
      const textos = Array.from(links).map(l => l.textContent?.trim());
      expect(textos.some(t => t?.includes('Panel'))).toBe(true);
    });

    it('debe mostrar enlace a Usuarios', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = compiled.querySelectorAll('a');
      const textos = Array.from(links).map(l => l.textContent?.trim());
      expect(textos.some(t => t?.includes('Usuarios'))).toBe(true);
    });
  });

  // No logueado
  describe('Sin sesión activa', () => {
    beforeEach(async () => {
      authMock = crearAuthMock(null, false);
      await TestBed.configureTestingModule({
        imports: [NavbarComponent, RouterTestingModule],
        providers: [{ provide: AuthService, useValue: authMock }],
      }).compileComponents();

      fixture = TestBed.createComponent(NavbarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('no debe mostrar la navbar si el usuario no está logueado', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const nav = compiled.querySelector('nav');
      expect(nav).toBeNull();
    });
  });
});

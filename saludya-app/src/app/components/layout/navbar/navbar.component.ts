import { Component, HostListener, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar" *ngIf="auth.estaLogueado()">
      <div class="nav-inner">
        <a class="nav-brand" routerLink="/">
          <span class="brand-icon">🏥</span>
          <span class="brand-text">Salud<span class="brand-accent">Ya</span></span>
        </a>

        <div class="nav-links" [class.open]="menuOpen">
          <!-- Paciente -->
          <ng-container *ngIf="auth.esPaciente()">
            <a routerLink="/paciente/dashboard" routerLinkActive="active" (click)="menuOpen=false">Inicio</a>
            <a routerLink="/paciente/especialidades" routerLinkActive="active" (click)="menuOpen=false">Especialidades</a>
            <a routerLink="/paciente/mis-citas" routerLinkActive="active" (click)="menuOpen=false">Mis Citas</a>
          </ng-container>

          <!-- Doctor -->
          <ng-container *ngIf="auth.esDoctor()">
            <a routerLink="/doctor/dashboard" routerLinkActive="active" (click)="menuOpen=false">Inicio</a>
            <a routerLink="/doctor/agenda" routerLinkActive="active" (click)="menuOpen=false">Mi Agenda</a>
          </ng-container>

          <!-- Admin -->
          <ng-container *ngIf="auth.esAdmin()">
            <a routerLink="/admin/dashboard" routerLinkActive="active" (click)="menuOpen=false">Panel</a>
            <a routerLink="/admin/doctores" routerLinkActive="active" (click)="menuOpen=false">Doctores</a>
            <a routerLink="/admin/especialidades" routerLinkActive="active" (click)="menuOpen=false">Especialidades</a>
            <a routerLink="/admin/usuarios" routerLinkActive="active" (click)="menuOpen=false">Usuarios</a>
            <a routerLink="/admin/reportes" routerLinkActive="active" (click)="menuOpen=false">Reportes</a>
          </ng-container>
        </div>

        <div class="nav-right">
          <!-- Perfil + dropdown -->
          <div class="profile-wrapper">
            <div class="user-pill" (click)="toggleDropdown($event)" [class.active]="dropdownOpen">
              <span class="user-avatar">{{ auth.usuario()?.nombre?.charAt(0) }}</span>
              <div class="user-info">
                <span class="user-name">{{ auth.usuario()?.nombre }}</span>
                <span class="user-role">{{ auth.usuario()?.rol | titlecase }}</span>
              </div>
              <span class="dropdown-arrow">{{ dropdownOpen ? '▲' : '▼' }}</span>
            </div>

            <!-- Dropdown menu -->
            <div class="profile-dropdown" *ngIf="dropdownOpen" (click)="$event.stopPropagation()">
              <div class="dropdown-header">
                <span class="dropdown-avatar">{{ auth.usuario()?.nombre?.charAt(0) }}</span>
                <div class="dropdown-user-info">
                  <span class="dropdown-welcome">Bienvenido</span>
                  <span class="dropdown-name">{{ auth.usuario()?.nombre }}</span>
                  <span class="dropdown-role">{{ auth.usuario()?.rol | titlecase }}</span>
                </div>
              </div>

              <div class="dropdown-divider"></div>

              <a class="dropdown-item" routerLink="/perfil" (click)="closeDropdown()">
                <span class="dropdown-icon">👤</span> Mi Perfil
              </a>

              <a *ngIf="auth.esPaciente()" class="dropdown-item" routerLink="/paciente/mis-citas" (click)="closeDropdown()">
                <span class="dropdown-icon">📅</span> Mis Citas
              </a>

              <a *ngIf="auth.esDoctor()" class="dropdown-item" routerLink="/doctor/agenda" (click)="closeDropdown()">
                <span class="dropdown-icon">📅</span> Mi Agenda
              </a>

              <a *ngIf="auth.esAdmin()" class="dropdown-item" routerLink="/admin/usuarios" (click)="closeDropdown()">
                <span class="dropdown-icon">👥</span> Usuarios
              </a>

              <div class="dropdown-divider"></div>

              <a class="dropdown-item logout" (click)="onLogout()">
                <span class="dropdown-icon">⏻</span> Cerrar Sesión
              </a>
            </div>
          </div>

          <button class="hamburger" (click)="menuOpen = !menuOpen" [class.active]="menuOpen">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: white;
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
      background: rgba(255,255,255,0.95);
    }
    .nav-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      height: 68px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-display);
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--color-primary-dark);
    }
    .brand-icon { font-size: 1.6rem; }
    .brand-accent { color: var(--color-accent); }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .nav-links a {
      padding: 8px 18px;
      border-radius: var(--radius-full);
      font-size: 0.88rem;
      font-weight: 500;
      color: var(--color-text-light);
      transition: var(--transition);
    }
    .nav-links a:hover {
      background: var(--color-primary-lighter);
      color: var(--color-primary);
    }
    .nav-links a.active {
      background: var(--color-primary);
      color: white;
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Profile pill */
    .profile-wrapper {
      position: relative;
    }
    .user-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 14px 6px 6px;
      background: var(--color-bg);
      border-radius: var(--radius-full);
      cursor: pointer;
      border: 2px solid transparent;
      transition: var(--transition);
    }
    .user-pill:hover,
    .user-pill.active {
      border-color: var(--color-primary);
    }
    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-size: 0.82rem; font-weight: 600; line-height: 1.2; }
    .user-role { font-size: 0.7rem; color: var(--color-text-light); }
    .dropdown-arrow { font-size: 0.6rem; color: var(--color-text-light); margin-left: 4px; }

    /* Dropdown */
    .profile-dropdown {
      position: absolute;
      top: 54px;
      right: 0;
      width: 280px;
      background: linear-gradient(145deg, #374151 0%, #1F2937 100%);
      border-radius: var(--radius-md);
      box-shadow: 0 12px 40px rgba(0,0,0,0.25);
      padding: 20px 16px;
      z-index: 200;
      color: #fff;
      animation: dropdownIn 0.2s ease;
    }

    @keyframes dropdownIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dropdown-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 16px;
    }
    .dropdown-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .dropdown-user-info {
      display: flex;
      flex-direction: column;
    }
    .dropdown-welcome {
      font-size: 0.68rem;
      color: var(--color-primary-light);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 2px;
    }
    .dropdown-name {
      font-size: 0.95rem;
      font-weight: 600;
    }
    .dropdown-role {
      font-size: 0.75rem;
      color: #9CA3AF;
    }

    .dropdown-divider {
      height: 1px;
      background: rgba(255,255,255,0.1);
      margin: 8px 0;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      border-radius: var(--radius-sm);
      font-size: 0.9rem;
      font-weight: 500;
      color: rgba(255,255,255,0.85);
      cursor: pointer;
      transition: background 0.15s;
    }
    .dropdown-item:hover {
      background: rgba(255,255,255,0.08);
    }
    .dropdown-item.logout {
      color: #F87171;
    }
    .dropdown-item.logout:hover {
      background: rgba(248,113,113,0.1);
    }
    .dropdown-icon {
      font-size: 1rem;
      width: 20px;
      text-align: center;
    }

    .hamburger { display: none; background: none; border: none; padding: 6px; flex-direction: column; gap: 4px; }
    .hamburger span { display: block; width: 22px; height: 2px; background: var(--color-text); border-radius: 2px; transition: var(--transition); }

    @media (max-width: 768px) {
      .hamburger { display: flex; }
      .user-info { display: none; }
      .dropdown-arrow { display: none; }
      .nav-links {
        display: none;
        position: absolute;
        top: 68px;
        left: 0;
        right: 0;
        background: white;
        border-bottom: 1px solid var(--color-border);
        flex-direction: column;
        padding: 16px;
        box-shadow: var(--shadow-md);
      }
      .nav-links.open { display: flex; }
      .nav-links a { width: 100%; padding: 12px 16px; }
    }
  `]
})
export class NavbarComponent {
  menuOpen = false;
  dropdownOpen = false;

  constructor(@Inject(AuthService) public auth: AuthService) {}

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  onLogout() {
    this.dropdownOpen = false;
    this.auth.logout();
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.dropdownOpen = false;
  }
}

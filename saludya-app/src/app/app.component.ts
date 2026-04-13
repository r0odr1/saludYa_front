import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/layout/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <app-navbar *ngIf="showNavbar" />
    <main>
      <router-outlet />
    </main>
  `,
  styles: [
    `
      main {
        min-height: calc(100vh - 68px);
      }
    `,
  ],
})
export class AppComponent {
  title = 'SaludYa';
  showNavbar = true;
  private publicRoutes = [
    '/login',
    '/registro',
    '/verificar-cuenta',
    '/solicitar-reset',
    '/verificar-reset',
    '/nueva-contrasena',
  ];

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.showNavbar = !this.publicRoutes.some((route) =>
          event.urlAfterRedirects.startsWith(route),
        );
      });
  }
}

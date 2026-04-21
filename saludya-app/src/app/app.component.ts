import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/layout/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
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

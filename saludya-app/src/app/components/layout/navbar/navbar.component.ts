import { Component, HostListener, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
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
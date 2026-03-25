import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  menuOpen = false;
  constructor(public auth: AuthService) {}
  toggleMenu() { this.menuOpen = !this.menuOpen; }
  logout() { this.auth.logout(); this.menuOpen = false; }
}

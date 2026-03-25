import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isLoggedIn) router.navigate(['/admin']);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    this.error = '';
    if (!this.email || !this.password) { this.error = 'Please enter email and password.'; return; }
    this.loading = true;
    setTimeout(() => {
      const ok = this.auth.login(this.email, this.password);
      this.loading = false;
      if (ok) {
        if (this.auth.isAdmin) {
          this.router.navigate(['/admin']);
        } else {
          this.auth.logout();
          this.error = 'Access denied. Only admin accounts can log in.';
        }
      } else {
        this.error = 'Invalid credentials. Try admin@mca.edu / admin123';
      }
    }, 400);
  }
}

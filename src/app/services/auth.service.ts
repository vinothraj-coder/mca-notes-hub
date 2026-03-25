import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/models';
import { DataService } from './data.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private data: DataService, private router: Router) {
    const stored = localStorage.getItem('mca_current_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        // Validate that the user exists in the data
        const validUser = this.data.validateUser(user);
        if (validUser) {
          this.currentUserSubject.next(validUser);
        } else {
          // Clear invalid user data
          localStorage.removeItem('mca_current_user');
        }
      } catch (e) {
        // Clear corrupted data
        localStorage.removeItem('mca_current_user');
      }
    }
  }

  get currentUser(): User | null { return this.currentUserSubject.value; }
  get isAdmin(): boolean { return this.currentUser?.role === 'admin'; }
  get isLoggedIn(): boolean { return !!this.currentUser; }

  login(email: string, password: string): boolean {
    const user = this.data.authenticate(email, password);
    if (user) {
      localStorage.setItem('mca_current_user', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('mca_current_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }
}

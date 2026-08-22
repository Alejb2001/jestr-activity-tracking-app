import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginPayload } from '../models/auth.model';

export interface StoredUser {
  username: string;
  role: string;
  companyId?: number;
  companyName?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';

  login(payload: LoginPayload) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify({
          username: response.username,
          role: response.role,
          companyId: response.companyId,
          companyName: response.companyName
        }));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  getCurrentUser(): StoredUser | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  isGlobalAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin';
  }

  isCompanyAdmin(): boolean {
    return this.getCurrentUser()?.role === 'company_admin';
  }

  isViewer(): boolean {
    const role = this.getCurrentUser()?.role;
    return role === 'viewer' || role === 'company_viewer';
  }

  hasCompanyModuleAccess(): boolean {
    return this.isGlobalAdmin() || this.isCompanyAdmin();
  }
}

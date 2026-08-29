import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginPayload } from '../models/auth.model';

export interface StoredUser {
  username: string;
  name?: string;
  role: string;
  companyId?: number;
  companyName?: string;
  permissions: string[];
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
          name: response.name,
          role: response.role,
          companyId: response.companyId,
          companyName: response.companyName,
          permissions: response.permissions ?? []
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

  hasPermission(key: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === 'admin') return true;
    const perms = user.permissions ?? [];
    if (perms.length > 0) return perms.includes(key);
    // Defaults cuando no hay rol personalizado
    if (user.role === 'company_admin') return true;
    if (user.role === 'viewer' || user.role === 'company_viewer')
      return ['activities.view', 'planning.view'].includes(key);
    return false;
  }
}

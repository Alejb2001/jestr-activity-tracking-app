import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div class="container">

        <!-- Brand: empresa + usuario logueado -->
        <a class="navbar-brand lh-1 py-1" routerLink="/activities">
          <span class="fw-bold d-block" style="font-size:1rem;line-height:1.2">{{ brandName }}</span>
          <span class="d-block" style="font-size:11px;font-weight:400;opacity:0.85;line-height:1.3">{{ currentUser?.username }}</span>
        </a>

        <!-- Links de navegación -->
        <div class="d-flex align-items-center gap-2 me-3">
          <a routerLink="/activities"
             routerLinkActive="btn-light text-primary"
             [routerLinkActiveOptions]="{ exact: true }"
             class="btn btn-outline-light btn-sm">
            Actividades
          </a>

          @if (!isViewer) {
            <a routerLink="/planning"
               routerLinkActive="btn-light text-primary"
               class="btn btn-outline-light btn-sm">
              Planificaci&oacute;n
            </a>
          }

          @if (hasCompanyAccess) {
            <a [routerLink]="companiesLink"
               routerLinkActive="btn-light text-primary"
               class="btn btn-outline-light btn-sm">
              Empresas
            </a>
          }
        </div>

        <!-- Dropdown de usuario -->
        <div class="ms-auto position-relative">
          <button
            class="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
            (click)="toggleDropdown($event)"
            type="button">
            <!-- Avatar con iniciales -->
            <span class="rounded-circle bg-white text-primary fw-bold d-flex align-items-center justify-content-center"
                  style="width:28px;height:28px;font-size:12px;flex-shrink:0">
              {{ initials }}
            </span>
            <span class="d-none d-md-inline">{{ currentUser?.username }}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="1,1 5,5 9,1"/>
            </svg>
          </button>

          @if (showDropdown) {
            <div class="dropdown-menu dropdown-menu-end show shadow"
                 style="min-width:220px;margin-top:6px;right:0;left:auto;position:absolute;top:100%">

              <!-- Info del usuario -->
              <div class="px-3 py-2 border-bottom bg-light">
                <div class="fw-semibold" style="font-size:14px">{{ currentUser?.username }}</div>
                <div class="text-muted" style="font-size:12px">{{ roleLabel }}</div>
                @if (currentUser?.companyName) {
                  <div class="text-primary" style="font-size:12px">{{ currentUser?.companyName }}</div>
                }
              </div>

              <!-- Perfil -->
              <a class="dropdown-item d-flex align-items-center gap-2 py-2"
                 routerLink="/profile"
                 (click)="showDropdown = false">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                Mi Perfil
              </a>

              <div class="dropdown-divider my-1"></div>

              <!-- Cerrar sesión -->
              <button class="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                      (click)="logout()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Cerrar sesi&oacute;n
              </button>

            </div>
          }
        </div>

      </div>
    </nav>
  `
})
export class NavbarComponent {

  showDropdown = false;

  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  get currentUser()     { return this.auth.getCurrentUser(); }
  get isViewer()        { return this.auth.isViewer(); }
  get hasCompanyAccess(){ return this.auth.hasCompanyModuleAccess(); }

  get brandName(): string {
    return this.auth.getCurrentUser()?.companyName || 'Activity Tracker';
  }

  get initials(): string {
    return this.auth.getCurrentUser()?.username?.charAt(0).toUpperCase() ?? '?';
  }

  get roleLabel(): string {
    const map: Record<string, string> = {
      admin:          'Administrador Global',
      viewer:         'Observador Global',
      company_admin:  'Administrador de Empresa',
      company_viewer: 'Usuario (Solo lectura)',
    };
    return map[this.auth.getCurrentUser()?.role ?? ''] ?? '';
  }

  get companiesLink(): string[] {
    if (this.auth.isCompanyAdmin()) {
      const id = this.auth.getCurrentUser()?.companyId;
      if (id) return ['/companies', id.toString()];
    }
    return ['/companies'];
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.showDropdown = false;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}

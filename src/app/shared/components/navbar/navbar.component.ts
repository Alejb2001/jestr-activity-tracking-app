import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .sidebar-link {
      transition: background 0.15s;
      border-left: 3px solid transparent;
      color: #212529;
      text-decoration: none;
    }
    .sidebar-link:hover {
      background: #f1f5f9;
      color: #212529;
    }
    .sidebar-link.active {
      background: #eff6ff;
      color: #1d4ed8 !important;
      border-left-color: #1d4ed8;
      font-weight: 600;
    }
    .sidebar-panel {
      position: fixed;
      top: 0;
      right: 0;
      height: 100%;
      width: 280px;
      background: #fff;
      z-index: 1050;
      box-shadow: -4px 0 24px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      transition: transform 0.28s cubic-bezier(.4,0,.2,1);
    }
  `],
  template: `
    <!-- Navbar -->
    <nav class="navbar navbar-dark bg-primary mb-4" style="padding-top:14px;padding-bottom:14px">
      <div class="container d-flex align-items-center justify-content-between">

        <!-- Brand: empresa + usuario logueado -->
        <a class="navbar-brand p-0 m-0" routerLink="/activities" style="white-space:normal;line-height:1">
          <span style="display:block;font-size:1.25rem;font-weight:700;line-height:1.25">{{ brandName }}</span>
          <span style="display:block;font-size:13px;font-weight:400;opacity:0.85;line-height:1.4">{{ currentUser?.username }}</span>
        </a>

        <!-- Botón hamburger (extremo derecho) -->
        <button class="btn btn-outline-light d-flex align-items-center justify-content-center flex-shrink-0"
                style="width:46px;height:46px;padding:0"
                (click)="openSidebar($event)"
                type="button"
                aria-label="Abrir menú">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

      </div>
    </nav>

    <!-- Backdrop -->
    @if (showSidebar) {
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1040;transition:opacity 0.28s"
           (click)="closeSidebar()">
      </div>
    }

    <!-- Panel lateral -->
    <div class="sidebar-panel" [style.transform]="showSidebar ? 'translateX(0)' : 'translateX(100%)'">

      <!-- Cabecera con info de usuario -->
      <div class="bg-primary text-white p-3">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div class="d-flex align-items-center gap-2">
            <span class="rounded-circle bg-white text-primary fw-bold d-flex align-items-center justify-content-center"
                  style="width:38px;height:38px;font-size:15px;flex-shrink:0">
              {{ initials }}
            </span>
            <div>
              <div class="fw-semibold" style="font-size:14px">{{ currentUser?.username }}</div>
              <div style="font-size:11px;opacity:0.85">{{ roleLabel }}</div>
            </div>
          </div>
          <button class="btn btn-sm btn-outline-light d-flex align-items-center justify-content-center"
                  style="width:30px;height:30px;padding:0"
                  (click)="closeSidebar()"
                  type="button"
                  aria-label="Cerrar menú">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6"  x2="6"  y2="18"/>
              <line x1="6"  y1="6"  x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        @if (currentUser?.companyName) {
          <div style="font-size:12px;opacity:0.8;margin-top:2px">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            {{ currentUser?.companyName }}
          </div>
        }
      </div>

      <!-- Links de navegación -->
      <nav class="flex-grow-1 py-2 overflow-auto">

        <a routerLink="/dashboard"
           routerLinkActive="active"
           class="sidebar-link d-flex align-items-center gap-3 px-4 py-3"
           (click)="closeSidebar()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="12" width="4" height="9" rx="1"/>
            <rect x="10" y="7" width="4" height="14" rx="1"/>
            <rect x="17" y="3" width="4" height="18" rx="1"/>
          </svg>
          Dashboard
        </a>

        <a routerLink="/activities"
           routerLinkActive="active"
           [routerLinkActiveOptions]="{ exact: true }"
           class="sidebar-link d-flex align-items-center gap-3 px-4 py-3"
           (click)="closeSidebar()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          Actividades
        </a>

        @if (!isViewer) {
          <a routerLink="/planning"
             routerLinkActive="active"
             class="sidebar-link d-flex align-items-center gap-3 px-4 py-3"
             (click)="closeSidebar()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
            </svg>
            Planificaci&oacute;n
          </a>
        }

        @if (isGlobalAdmin) {
          <a [routerLink]="companiesLink"
             routerLinkActive="active"
             class="sidebar-link d-flex align-items-center gap-3 px-4 py-3"
             (click)="closeSidebar()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Empresas
          </a>
        }

        @if (hasCompanyAccess) {
          <a [routerLink]="usersLink"
             routerLinkActive="active"
             class="sidebar-link d-flex align-items-center gap-3 px-4 py-3"
             (click)="closeSidebar()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9"  cy="7" r="4"/>
              <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
              <line x1="17" y1="11" x2="17" y2="17"/>
              <line x1="14" y1="14" x2="20" y2="14"/>
            </svg>
            Usuarios
          </a>
        }

        <div class="border-top mx-3 my-2"></div>

        <a routerLink="/profile"
           routerLinkActive="active"
           class="sidebar-link d-flex align-items-center gap-3 px-4 py-3"
           (click)="closeSidebar()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          Mi Perfil
        </a>

      </nav>

      <!-- Cerrar sesión -->
      <div class="p-3 border-top">
        <button class="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
                (click)="requestLogout()"
                type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar sesi&oacute;n
        </button>
      </div>

    </div>

    <!-- Modal de confirmación de cierre de sesión -->
    @if (showLogoutConfirm) {
      <div style="position:fixed;inset:0;z-index:1060;display:flex;align-items:center;justify-content:center">
        <!-- Fondo oscuro -->
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.55)"
             (click)="cancelLogout()">
        </div>
        <!-- Tarjeta de confirmación -->
        <div style="position:relative;background:#fff;border-radius:14px;padding:28px 24px;width:320px;max-width:90vw;box-shadow:0 12px 40px rgba(0,0,0,0.25);text-align:center">
          <!-- Icono -->
          <div style="width:60px;height:60px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <h5 class="mb-1 fw-semibold">¿Cerrar sesión?</h5>
          <p class="text-muted mb-0" style="font-size:14px">Tu sesión actual se cerrará. ¿Deseas continuar?</p>
          <div class="d-flex gap-2 mt-4">
            <button class="btn btn-outline-secondary flex-fill"
                    (click)="cancelLogout()"
                    type="button">
              Cancelar
            </button>
            <button class="btn btn-danger flex-fill"
                    (click)="confirmLogout()"
                    type="button">
              Cerrar sesi&oacute;n
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class NavbarComponent {

  showSidebar      = false;
  showLogoutConfirm = false;

  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  get currentUser()     { return this.auth.getCurrentUser(); }
  get isViewer()        { return this.auth.isViewer(); }
  get isGlobalAdmin()   { return this.auth.isGlobalAdmin(); }
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

  get usersLink(): string[] {
    const id = this.auth.getCurrentUser()?.companyId;
    if (id) return ['/companies', id.toString()];
    return ['/companies'];
  }

  openSidebar(event: Event): void {
    event.stopPropagation();
    this.showSidebar = true;
  }

  closeSidebar(): void {
    this.showSidebar = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showLogoutConfirm) {
      this.cancelLogout();
    } else {
      this.closeSidebar();
    }
  }

  requestLogout(): void {
    this.showLogoutConfirm = true;
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  confirmLogout(): void {
    this.showLogoutConfirm = false;
    this.showSidebar = false;
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}

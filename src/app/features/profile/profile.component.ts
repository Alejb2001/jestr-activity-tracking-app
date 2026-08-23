import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {

  private readonly auth = inject(AuthService);
  readonly currentUser  = this.auth.getCurrentUser();

  get roleLabel(): string {
    const map: Record<string, string> = {
      admin:          'Administrador Global',
      viewer:         'Observador Global',
      company_admin:  'Administrador de Empresa',
      company_viewer: 'Usuario (Solo lectura)',
    };
    return map[this.currentUser?.role ?? ''] ?? this.currentUser?.role ?? '';
  }
}

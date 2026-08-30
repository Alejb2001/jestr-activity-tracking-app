import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { RegistrationService } from '../../core/services/registration.service';
import { Registration, RegistrationStatus, RegistrationStatusLabel } from '../../core/models/registration.model';

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './registrations.component.html'
})
export class RegistrationsComponent implements OnInit {
  private readonly svc = inject(RegistrationService);

  registrations: Registration[] = [];
  loading  = false;
  error    = '';
  activeFilter: string = '';

  rejectTarget: Registration | null = null;
  rejectReason = '';
  rejectSubmitting = false;

  readonly statusLabel = RegistrationStatusLabel;
  readonly filters = [
    { value: '',         label: 'Todas' },
    { value: 'Pending',  label: 'Pendientes' },
    { value: 'Approved', label: 'Aprobadas' },
    { value: 'Rejected', label: 'Rechazadas' }
  ];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error   = '';
    this.svc.getAll(this.activeFilter || undefined).subscribe({
      next: (data) => { this.registrations = data; this.loading = false; },
      error: () => { this.error = 'Error al cargar las solicitudes.'; this.loading = false; }
    });
  }

  setFilter(value: string): void {
    this.activeFilter = value;
    this.load();
  }

  approve(reg: Registration): void {
    if (!confirm(`¿Aprobar la solicitud de "${reg.companyName}"? Se creará la empresa y el usuario administrador.`)) return;
    this.svc.approve(reg.id).subscribe({
      next: () => this.load(),
      error: (err) => { this.error = err?.error?.message ?? 'Error al aprobar.'; }
    });
  }

  openReject(reg: Registration): void {
    this.rejectTarget = reg;
    this.rejectReason = '';
  }

  cancelReject(): void {
    this.rejectTarget = null;
    this.rejectReason = '';
  }

  confirmReject(): void {
    if (!this.rejectTarget || !this.rejectReason.trim()) return;
    this.rejectSubmitting = true;
    this.svc.reject(this.rejectTarget.id, this.rejectReason).subscribe({
      next: () => { this.rejectTarget = null; this.rejectSubmitting = false; this.load(); },
      error: (err) => { this.error = err?.error?.message ?? 'Error al rechazar.'; this.rejectSubmitting = false; }
    });
  }

  badgeClass(status: RegistrationStatus): string {
    return { Pending: 'bg-warning text-dark', Approved: 'bg-success', Rejected: 'bg-danger' }[status] ?? 'bg-secondary';
  }
}

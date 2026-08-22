import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ActivityService } from '../../../core/services/activity.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Activity, ActivityStatus, ActivityStatusLabels } from '../../../core/models/activity.model';
import { User } from '../../../core/models/user.model';

function dateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('scheduledStart')?.value;
  const end   = group.get('scheduledEnd')?.value;
  return start && end && new Date(end) <= new Date(start) ? { dateRange: true } : null;
}

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './activity-list.component.html'
})
export class ActivityListComponent implements OnInit {
  activities: Activity[] = [];
  loading = false;
  error = '';

  // Paginación
  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  // Filtros
  filterStatus: ActivityStatus | '' = '';
  filterUser = '';
  filterStart = '';
  filterEnd = '';

  readonly statusLabels = ActivityStatusLabels;
  readonly ActivityStatus = ActivityStatus;

  readonly statusOptions = [
    { value: ActivityStatus.Pending,    label: 'Pendiente'   },
    { value: ActivityStatus.InProgress, label: 'En Progreso' },
    { value: ActivityStatus.Completed,  label: 'Completada'  },
    { value: ActivityStatus.Cancelled,  label: 'Cancelada'   }
  ];

  // Modal de creación
  showModal = false;
  modalSubmitting = false;
  modalError = '';
  modalUsers: User[] = [];
  modalUsersLoading = false;

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  readonly currentUser = this.auth.getCurrentUser();

  createForm = this.fb.group({
    title:          ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description:    ['', [Validators.required, Validators.maxLength(500)]],
    scheduledStart: ['', Validators.required],
    scheduledEnd:   ['', Validators.required],
    assignedUserId: ['', Validators.required]
  }, { validators: dateRangeValidator });

  get isViewer(): boolean {
    return this.auth.isViewer();
  }

  get hasCompanyModuleAccess(): boolean {
    return this.auth.hasCompanyModuleAccess();
  }

  get companiesLink(): string[] {
    if (this.auth.isCompanyAdmin() && this.currentUser?.companyId) {
      return ['/companies', this.currentUser.companyId.toString()];
    }
    return ['/companies'];
  }

  hasModalError(field: string, error: string): boolean {
    const ctrl = this.createForm.get(field);
    return !!(ctrl?.hasError(error) && ctrl.touched);
  }

  constructor(private activityService: ActivityService) {}

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.activityService.getAll({
      status:         this.filterStatus !== '' ? this.filterStatus : null,
      assignedUserId: this.filterUser   || undefined,
      startDate:      this.filterStart  || undefined,
      endDate:        this.filterEnd    || undefined,
      page:           this.page,
      pageSize:       this.pageSize
    }).subscribe({
      next: (result) => {
        this.activities = result.items;
        this.totalCount = result.totalCount;
        this.totalPages = result.totalPages;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar actividades.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.load();
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterUser   = '';
    this.filterStart  = '';
    this.filterEnd    = '';
    this.page = 1;
    this.load();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.load();
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar esta actividad?')) return;
    this.activityService.delete(id).subscribe({
      next:  () => { this.load(); },
      error: () => { this.error = 'Error al eliminar.'; }
    });
  }

  // ── Modal ──────────────────────────────────────────────────────────────────

  openModal(): void {
    this.createForm.reset();
    this.modalError = '';
    this.showModal = true;
    this.modalUsersLoading = true;
    this.userService.getAll().subscribe({
      next:  (users) => { this.modalUsers = users; this.modalUsersLoading = false; },
      error: ()      => { this.modalUsersLoading = false; }
    });
  }

  closeModal(): void {
    this.showModal = false;
  }

  submitModal(): void {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    this.modalSubmitting = true;
    this.modalError = '';
    const { title, description, scheduledStart, scheduledEnd, assignedUserId } = this.createForm.value;
    this.activityService.create({ title: title!, description: description!, scheduledStart: scheduledStart!, scheduledEnd: scheduledEnd!, assignedUserId: assignedUserId! }).subscribe({
      next: () => {
        this.showModal = false;
        this.modalSubmitting = false;
        this.load();
      },
      error: () => {
        this.modalError = 'Error al crear la actividad.';
        this.modalSubmitting = false;
      }
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  statusClass(status: ActivityStatus): string {
    const map: Record<ActivityStatus, string> = {
      [ActivityStatus.Pending]:    'badge bg-secondary',
      [ActivityStatus.InProgress]: 'badge bg-primary',
      [ActivityStatus.Completed]:  'badge bg-success',
      [ActivityStatus.Cancelled]:  'badge bg-danger'
    };
    return map[status];
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.page - 2);
    const end   = Math.min(this.totalPages, this.page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    if (pages[0] > 1) pages.unshift(1);
    if (pages[pages.length - 1] < this.totalPages) pages.push(this.totalPages);
    return pages;
  }
}

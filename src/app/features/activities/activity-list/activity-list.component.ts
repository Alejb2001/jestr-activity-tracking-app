import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ActivityService } from '../../../core/services/activity.service';
import { AuthService } from '../../../core/services/auth.service';
import { Activity, ActivityStatus, ActivityStatusLabels } from '../../../core/models/activity.model';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.getCurrentUser();

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
      status:        this.filterStatus !== '' ? this.filterStatus : null,
      assignedUserId: this.filterUser   || undefined,
      startDate:     this.filterStart   || undefined,
      endDate:       this.filterEnd     || undefined,
      page:          this.page,
      pageSize:      this.pageSize
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

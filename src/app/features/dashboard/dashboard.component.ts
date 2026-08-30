import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../core/services/dashboard.service';
import { ActivityService } from '../../core/services/activity.service';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { DashboardStats, DashboardUserStats } from '../../core/models/dashboard.model';
import { Activity, ActivityStatusLabels } from '../../core/models/activity.model';

type QuickRange = 'today' | 'week' | 'month' | 'year' | 'custom';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly dashSvc  = inject(DashboardService);
  private readonly actSvc   = inject(ActivityService);
  private readonly auth     = inject(AuthService);

  stats: DashboardStats | null = null;
  loading  = false;
  error    = '';

  activeRange: QuickRange = 'month';
  customFrom = '';
  customTo   = '';

  // Derived from active range
  private fromDate = '';
  private toDate   = '';

  // User table expand
  expandedUser: string | null = null;
  userActivities: Activity[]  = [];
  userActivitiesLoading       = false;

  readonly statusLabels = ActivityStatusLabels;

  get isManager(): boolean {
    return this.auth.isGlobalAdmin() || this.auth.isCompanyAdmin();
  }

  ngOnInit(): void {
    this.setRange('month');
  }

  setRange(range: QuickRange): void {
    this.activeRange = range;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (range) {
      case 'today':
        this.fromDate = this.fmt(today);
        this.toDate   = this.fmt(today);
        break;
      case 'week': {
        const mon = new Date(today);
        mon.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        this.fromDate = this.fmt(mon);
        this.toDate   = this.fmt(today);
        break;
      }
      case 'month':
        this.fromDate = this.fmt(new Date(today.getFullYear(), today.getMonth(), 1));
        this.toDate   = this.fmt(today);
        break;
      case 'year':
        this.fromDate = this.fmt(new Date(today.getFullYear(), 0, 1));
        this.toDate   = this.fmt(today);
        break;
    }
    this.load();
  }

  applyCustomRange(): void {
    if (!this.customFrom || !this.customTo) return;
    this.activeRange = 'custom';
    this.fromDate = this.customFrom;
    this.toDate   = this.customTo;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error   = '';
    this.expandedUser = null;
    this.userActivities = [];
    this.dashSvc.getStats(this.fromDate, this.toDate).subscribe({
      next: (data) => { this.stats = data; this.loading = false; },
      error: ()    => { this.error = 'Error al cargar las estadísticas.'; this.loading = false; }
    });
  }

  toggleUser(user: DashboardUserStats): void {
    if (this.expandedUser === user.userId) {
      this.expandedUser   = null;
      this.userActivities = [];
      return;
    }
    this.expandedUser        = user.userId;
    this.userActivities      = [];
    this.userActivitiesLoading = true;
    this.actSvc.getAll({
      assignedUserId: user.userId,
      startDate: this.fromDate,
      endDate:   this.toDate,
      pageSize:  50
    }).subscribe({
      next: (r) => { this.userActivities = r.items; this.userActivitiesLoading = false; },
      error: ()  => { this.userActivitiesLoading = false; }
    });
  }

  barPct(value: number, total: number): number {
    return total > 0 ? Math.round(value / total * 100) : 0;
  }

  statusBadgeClass(label: string): string {
    const map: Record<string, string> = {
      'Pendiente':   'bg-warning text-dark',
      'En Progreso': 'bg-primary',
      'Completada':  'bg-success',
      'Cancelada':   'bg-secondary'
    };
    return map[label] ?? 'bg-secondary';
  }

  initial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  private fmt(d: Date): string {
    return d.toISOString().slice(0, 10);
  }
}

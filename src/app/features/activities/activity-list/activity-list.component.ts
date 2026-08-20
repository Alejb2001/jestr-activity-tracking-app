import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivityService } from '../../../core/services/activity.service';
import { Activity, ActivityStatus, ActivityStatusLabels } from '../../../core/models/activity.model';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './activity-list.component.html'
})
export class ActivityListComponent implements OnInit {
  activities: Activity[] = [];
  loading = false;
  error = '';

  readonly statusLabels = ActivityStatusLabels;
  readonly ActivityStatus = ActivityStatus;

  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.activityService.getAll().subscribe({
      next: (data) => { this.activities = data; this.loading = false; },
      error: ()     => { this.error = 'Error al cargar actividades.'; this.loading = false; }
    });
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar esta actividad?')) return;
    this.activityService.delete(id).subscribe({
      next:  () => { this.activities = this.activities.filter(a => a.id !== id); },
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
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  AbstractControl, FormBuilder, FormsModule,
  ReactiveFormsModule, ValidationErrors, Validators
} from '@angular/forms';
import { ActivityService } from '../../core/services/activity.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Activity, ActivityPriority, ActivityPriorityLabels,
  ActivityStatus, ActivityStatusLabels
} from '../../core/models/activity.model';
import { User } from '../../core/models/user.model';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

const DAY_MS = 86_400_000;
const DAY_W  = 38;   // px por día
const ROW_H  = 52;   // px por fila

function dateRangeValidator(c: AbstractControl): ValidationErrors | null {
  const s = c.get('scheduledStart')?.value;
  const e = c.get('scheduledEnd')?.value;
  return s && e && new Date(e) <= new Date(s) ? { dateRange: true } : null;
}

interface GanttBar { left: number; width: number; }

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './planning.component.html',
  styles: [`
    .gantt-wrap{overflow:auto;max-height:calc(100vh - 270px);border:1px solid #dee2e6;border-radius:.5rem;background:#fff}
    .gantt-head{position:sticky;top:0;z-index:30;display:flex;background:#f8f9fa;border-bottom:2px solid #dee2e6}
    .gantt-label-th{position:sticky;left:0;z-index:40;background:#f8f9fa;width:260px;min-width:260px;padding:8px 12px;font-weight:600;border-right:2px solid #dee2e6;font-size:13px;display:flex;align-items:center}
    .gantt-days-th{display:flex}
    .gantt-day-th{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;width:38px;min-width:38px;padding:3px 2px 4px;font-size:10px;border-right:1px solid #e9ecef;color:#6c757d;line-height:1.3;user-select:none}
    .gantt-day-th.weekend{background:#f3f4f6}
    .gantt-day-th.is-today{background:#e7f0ff;color:#0d6efd;font-weight:700}
    .gantt-month{font-size:9px;font-weight:600;text-transform:uppercase;color:#495057;letter-spacing:.02em}
    .gantt-row{display:flex;border-bottom:1px solid #f0f0f0}
    .gantt-row:hover .gantt-label-td{background:#f8f9fa}
    .gantt-label-td{position:sticky;left:0;z-index:10;background:white;width:260px;min-width:260px;padding:6px 12px;border-right:2px solid #dee2e6;cursor:pointer;display:flex;flex-direction:column;justify-content:center;transition:background .1s}
    .gantt-cell{position:relative;flex:1}
    .gantt-col-bg{position:absolute;top:0;bottom:0;border-right:1px solid #f5f5f5;pointer-events:none}
    .gantt-col-bg.weekend{background:rgba(0,0,0,.025)}
    .gantt-today-marker{position:absolute;top:0;bottom:0;width:2px;background:rgba(220,53,69,.45);z-index:4;pointer-events:none}
    .gantt-bar{position:absolute;border-radius:4px;cursor:pointer;display:flex;align-items:center;overflow:hidden;top:10px;height:32px;z-index:5;transition:filter .12s,transform .12s}
    .gantt-bar:hover{filter:brightness(.88);transform:scaleY(1.04)}
    .gantt-bar span{font-size:11px;padding:0 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none}
    .bar-low{background:#0dcaf0}.bar-low span{color:#000}
    .bar-med{background:#fd7e14}.bar-med span{color:#fff}
    .bar-high{background:#dc3545}.bar-high span{color:#fff}
    .bar-pending{opacity:.65}
    .bar-inprogress{box-shadow:inset 0 0 0 2px rgba(255,255,255,.45)}
    .no-bar-hint{position:absolute;top:50%;transform:translateY(-50%);left:4px;font-size:10px;color:#ced4da;white-space:nowrap;pointer-events:none}
  `]
})
export class PlanningComponent implements OnInit {

  activities: Activity[] = [];
  users:      User[]     = [];
  loading = false;
  error   = '';

  // ── Timeline ───────────────────────────────────────────────────────────────
  viewStart!: Date;
  readonly viewDays = 60;
  readonly dayW     = DAY_W;
  readonly rowH     = ROW_H;
  headerDates: Date[]              = [];
  barMap = new Map<number, GanttBar>();

  // ── Edit/Assign modal ──────────────────────────────────────────────────────
  editActivity:   Activity | null = null;
  editUserId    = '';
  editStart     = '';
  editEnd       = '';
  editPriority: ActivityPriority = ActivityPriority.Medium;
  editSubmitting = false;
  editError      = '';

  // ── Create modal ───────────────────────────────────────────────────────────
  showCreate      = false;
  createSubmitting = false;
  createError      = '';

  readonly statusLabels   = ActivityStatusLabels;
  readonly priorityLabels = ActivityPriorityLabels;
  readonly ActivityStatus   = ActivityStatus;
  readonly ActivityPriority = ActivityPriority;

  readonly priorityOptions = [
    { value: ActivityPriority.Low,    label: 'Baja'  },
    { value: ActivityPriority.Medium, label: 'Media' },
    { value: ActivityPriority.High,   label: 'Alta'  },
  ];

  private readonly fb      = inject(FormBuilder);
  private readonly auth    = inject(AuthService);
  private readonly userSvc = inject(UserService);
  private readonly actSvc  = inject(ActivityService);

  createForm = this.fb.group({
    title:          ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description:    ['', [Validators.required, Validators.maxLength(500)]],
    scheduledStart: ['', Validators.required],
    scheduledEnd:   ['', Validators.required],
    assignedUserId: [''],
    priority:       [ActivityPriority.Medium, Validators.required],
  }, { validators: dateRangeValidator });

  get isViewer()   { return this.auth.isViewer(); }
  get totalWidth() { return this.viewDays * DAY_W; }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const t = new Date();
    t.setDate(t.getDate() - 10);
    t.setHours(0, 0, 0, 0);
    this.viewStart = t;
    this.buildHeader();
    this.load();
    this.userSvc.getAll().subscribe({ next: u => (this.users = u) });
  }

  // ── Data ───────────────────────────────────────────────────────────────────

  load(): void {
    this.loading = true;
    this.actSvc.getAll({ pageSize: 500 }).subscribe({
      next: r => {
        this.activities = r.items.filter(
          a => a.status !== ActivityStatus.Completed && a.status !== ActivityStatus.Cancelled
        );
        this.buildBars();
        this.loading = false;
      },
      error: () => { this.error = 'Error al cargar actividades.'; this.loading = false; },
    });
  }

  // ── Gantt ──────────────────────────────────────────────────────────────────

  buildHeader(): void {
    this.headerDates = Array.from({ length: this.viewDays }, (_, i) => {
      const d = new Date(this.viewStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }

  buildBars(): void {
    this.barMap.clear();
    const vsMs = this.viewStart.getTime();
    const veMs = vsMs + this.viewDays * DAY_MS;

    for (const a of this.activities) {
      const sMs = new Date(a.scheduledStart).getTime();
      const eMs = new Date(a.scheduledEnd).getTime() + DAY_MS;
      if (eMs <= vsMs || sMs >= veMs) continue;
      const cs = Math.max(sMs, vsMs);
      const ce = Math.min(eMs, veMs);
      this.barMap.set(a.id, {
        left:  (cs - vsMs) / DAY_MS * DAY_W,
        width: Math.max((ce - cs) / DAY_MS * DAY_W, DAY_W / 2),
      });
    }
  }

  shiftView(days: number): void {
    this.viewStart = new Date(this.viewStart.getTime() + days * DAY_MS);
    this.buildHeader();
    this.buildBars();
  }

  goToday(): void {
    const t = new Date();
    t.setDate(t.getDate() - 10);
    t.setHours(0, 0, 0, 0);
    this.viewStart = t;
    this.buildHeader();
    this.buildBars();
  }

  todayPx(): number {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return (t.getTime() - this.viewStart.getTime()) / DAY_MS * DAY_W;
  }

  getBar(id: number) { return this.barMap.get(id); }

  isWeekend(d: Date) { const w = d.getDay(); return w === 0 || w === 6; }

  isToday(d: Date) {
    const t = new Date();
    return d.getDate() === t.getDate()
        && d.getMonth() === t.getMonth()
        && d.getFullYear() === t.getFullYear();
  }

  showMonth(i: number, d: Date) { return i === 0 || d.getDate() === 1; }

  barCls(a: Activity): string {
    const pc = a.priority === ActivityPriority.Low    ? 'bar-low'
             : a.priority === ActivityPriority.Medium ? 'bar-med'
             :                                          'bar-high';
    const sc = a.status === ActivityStatus.Pending    ? 'bar-pending'
             : a.status === ActivityStatus.InProgress ? 'bar-inprogress'
             :                                          '';
    return `gantt-bar ${pc} ${sc}`;
  }

  statusCls(s: ActivityStatus): string {
    const m: Record<ActivityStatus, string> = {
      [ActivityStatus.Pending]:    'badge bg-secondary',
      [ActivityStatus.InProgress]: 'badge bg-primary',
      [ActivityStatus.Completed]:  'badge bg-success',
      [ActivityStatus.Cancelled]:  'badge bg-danger',
    };
    return m[s];
  }

  priorityCls(p: ActivityPriority): string {
    const m: Record<ActivityPriority, string> = {
      [ActivityPriority.Low]:    'badge bg-info text-dark',
      [ActivityPriority.Medium]: 'badge bg-warning text-dark',
      [ActivityPriority.High]:   'badge bg-danger',
    };
    return m[p];
  }

  // ── Edit / Assign ──────────────────────────────────────────────────────────

  openEdit(a: Activity): void {
    if (this.isViewer) return;
    this.editActivity  = a;
    this.editUserId    = a.assignedUserId || '';
    this.editStart     = a.scheduledStart.substring(0, 10);
    this.editEnd       = a.scheduledEnd.substring(0, 10);
    this.editPriority  = a.priority;
    this.editError     = '';
    this.editSubmitting = false;
  }

  closeEdit(): void { this.editActivity = null; }

  submitEdit(): void {
    if (!this.editActivity) return;
    this.editSubmitting = true;
    const a = this.editActivity;
    this.actSvc.update(a.id, {
      title:          a.title,
      description:    a.description,
      scheduledStart: this.editStart,
      scheduledEnd:   this.editEnd,
      assignedUserId: this.editUserId,
      status:         a.status,
      priority:       +this.editPriority,
    }).subscribe({
      next: updated => {
        const idx = this.activities.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.activities[idx] = updated;
        this.buildBars();
        this.closeEdit();
        this.editSubmitting = false;
      },
      error: () => { this.editError = 'Error al guardar.'; this.editSubmitting = false; },
    });
  }

  // ── Create ─────────────────────────────────────────────────────────────────

  openCreate(): void {
    this.createForm.reset({ priority: ActivityPriority.Medium });
    this.createError    = '';
    this.showCreate     = true;
    this.createSubmitting = false;
  }

  closeCreate(): void { this.showCreate = false; }

  hasCreateErr(f: string, e: string): boolean {
    const c = this.createForm.get(f);
    return !!(c?.hasError(e) && c.touched);
  }

  submitCreate(): void {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    this.createSubmitting = true;
    const { title, description, scheduledStart, scheduledEnd, assignedUserId, priority } = this.createForm.value;
    this.actSvc.create({
      title:          title!,
      description:    description!,
      scheduledStart: scheduledStart!,
      scheduledEnd:   scheduledEnd!,
      assignedUserId: assignedUserId || '',
      priority:       +priority!,
    }).subscribe({
      next:  () => { this.showCreate = false; this.createSubmitting = false; this.load(); },
      error: () => { this.createError = 'Error al crear la actividad.'; this.createSubmitting = false; },
    });
  }

}

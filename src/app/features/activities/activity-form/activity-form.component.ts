import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { ActivityService } from '../../../core/services/activity.service';
import { UserService } from '../../../core/services/user.service';
import { ActivityPriority, ActivityStatus } from '../../../core/models/activity.model';
import { User } from '../../../core/models/user.model';

function scheduledDateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('scheduledStart')?.value;
  const end   = group.get('scheduledEnd')?.value;
  return start && end && new Date(end) <= new Date(start)
    ? { dateRange: true }
    : null;
}

@Component({
  selector: 'app-activity-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './activity-form.component.html'
})
export class ActivityFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  activityId?: number;
  loading = false;
  submitting = false;
  error = '';

  users: User[] = [];
  usersLoading = false;
  usersError = '';

  readonly statusOptions = [
    { value: ActivityStatus.Pending,    label: 'Pendiente'   },
    { value: ActivityStatus.InProgress, label: 'En Progreso' },
    { value: ActivityStatus.Completed,  label: 'Completada'  },
    { value: ActivityStatus.Cancelled,  label: 'Cancelada'   }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title:          ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description:    ['', [Validators.required, Validators.maxLength(500)]],
      scheduledStart: ['', Validators.required],
      scheduledEnd:   ['', Validators.required],
      assignedUserId: ['', Validators.required],
      status:         [ActivityStatus.Pending],
      priority:       [ActivityPriority.Medium]
    }, { validators: scheduledDateRangeValidator });

    this.loadUsers();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.activityId = +id;
      this.loadActivity(this.activityId);
    }
  }

  private loadUsers(): void {
    this.usersLoading = true;
    this.userService.getAll().subscribe({
      next:  (data) => { this.users = data; this.usersLoading = false; },
      error: ()     => { this.usersError = 'No se pudieron cargar los responsables.'; this.usersLoading = false; }
    });
  }

  private loadActivity(id: number): void {
    this.loading = true;
    this.activityService.getById(id).subscribe({
      next: (a) => {
        this.form.patchValue({
          title:          a.title,
          description:    a.description,
          scheduledStart: a.scheduledStart.substring(0, 10),
          scheduledEnd:   a.scheduledEnd.substring(0, 10),
          assignedUserId: a.assignedUserId,
          status:         a.status,
          priority:       a.priority
        });
        this.loading = false;
      },
      error: () => { this.error = 'No se pudo cargar la actividad.'; this.loading = false; }
    });
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(error) && ctrl.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    this.error = '';

    const { title, description, scheduledStart, scheduledEnd, assignedUserId, status, priority } = this.form.value;

    if (this.isEditMode && this.activityId) {
      this.activityService.update(this.activityId,
        { title, description, scheduledStart, scheduledEnd, assignedUserId, status, priority }
      ).subscribe({
        next:  () => this.router.navigate(['/activities']),
        error: () => { this.error = 'Error al actualizar.'; this.submitting = false; }
      });
    } else {
      this.activityService.create(
        { title, description, scheduledStart, scheduledEnd, assignedUserId, priority }
      ).subscribe({
        next:  () => this.router.navigate(['/activities']),
        error: () => { this.error = 'Error al crear la actividad.'; this.submitting = false; }
      });
    }
  }
}

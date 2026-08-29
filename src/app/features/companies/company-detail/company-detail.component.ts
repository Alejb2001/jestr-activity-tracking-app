import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '../../../core/services/company.service';
import { AuthService } from '../../../core/services/auth.service';
import { Company, CompanyUser } from '../../../core/models/company.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './company-detail.component.html'
})
export class CompanyDetailComponent implements OnInit {
  company?: Company;
  users: CompanyUser[] = [];
  loading = false;
  usersLoading = false;
  submitting = false;
  error = '';
  showUserForm = false;
  companyId!: number;

  // Edición
  editingUser: CompanyUser | null = null;
  editSubmitting = false;
  editError = '';

  private readonly auth  = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb    = inject(FormBuilder);

  readonly currentUser   = this.auth.getCurrentUser();
  readonly isGlobalAdmin = this.auth.isGlobalAdmin();

  readonly roleOptions = [
    { value: 'company_admin',  label: 'Administrador de empresa' },
    { value: 'company_viewer', label: 'Usuario (solo lectura)' }
  ];

  userForm = this.fb.group({
    name:       ['', [Validators.required, Validators.maxLength(100)]],
    email:      ['', [Validators.required, Validators.email]],
    department: ['', Validators.maxLength(100)],
    role:       ['company_viewer', Validators.required],
    username:   ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    password:   ['', [Validators.required, Validators.minLength(8)]]
  });

  editForm = this.fb.group({
    name:       ['', [Validators.required, Validators.maxLength(100)]],
    email:      ['', [Validators.required, Validators.email]],
    department: ['', Validators.maxLength(100)],
    role:       ['company_viewer', Validators.required],
    username:   ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    password:   ['', Validators.minLength(8)],   // opcional al editar
    isActive:   [true]
  });

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.companyId = id ? +id : this.currentUser!.companyId!;
    this.loadCompany();
    this.loadUsers();
  }

  loadCompany(): void {
    this.loading = true;
    this.companyService.getById(this.companyId).subscribe({
      next: (c) => { this.company = c; this.loading = false; },
      error: () => { this.error = 'Error al cargar la empresa.'; this.loading = false; }
    });
  }

  loadUsers(): void {
    this.usersLoading = true;
    this.companyService.getUsers(this.companyId).subscribe({
      next: (data) => { this.users = data; this.usersLoading = false; },
      error: () => { this.error = 'Error al cargar usuarios.'; this.usersLoading = false; }
    });
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.userForm.get(field);
    return !!(ctrl?.hasError(error) && ctrl.touched);
  }

  hasEditError(field: string, error: string): boolean {
    const ctrl = this.editForm.get(field);
    return !!(ctrl?.hasError(error) && ctrl.touched);
  }

  createUser(): void {
    if (this.userForm.invalid) { this.userForm.markAllAsTouched(); return; }
    this.submitting = true;
    const v = this.userForm.value;
    this.companyService.createUser(this.companyId, {
      name:       v.name!,
      email:      v.email!,
      department: v.department ?? '',
      role:       v.role as 'company_admin' | 'company_viewer',
      username:   v.username!,
      password:   v.password!
    }).subscribe({
      next: () => {
        this.userForm.reset({ role: 'company_viewer' });
        this.showUserForm = false;
        this.submitting = false;
        this.loadUsers();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error al crear el usuario.';
        this.submitting = false;
      }
    });
  }

  openEdit(user: CompanyUser): void {
    this.editingUser = user;
    this.editError   = '';
    this.editForm.reset({
      name:       user.name,
      email:      user.email,
      department: user.department,
      role:       user.role,
      username:   user.username,
      password:   '',
      isActive:   user.isActive
    });
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.editError   = '';
  }

  saveEdit(): void {
    if (this.editForm.invalid) { this.editForm.markAllAsTouched(); return; }
    this.editSubmitting = true;
    this.editError      = '';
    const v = this.editForm.value;
    this.companyService.updateUser(this.companyId, this.editingUser!.id, {
      name:       v.name!,
      email:      v.email!,
      department: v.department ?? '',
      role:       v.role as 'company_admin' | 'company_viewer',
      username:   v.username!,
      password:   v.password ?? undefined,
      isActive:   v.isActive ?? true
    }).subscribe({
      next: () => {
        this.editSubmitting = false;
        this.editingUser    = null;
        this.loadUsers();
      },
      error: (err) => {
        this.editError      = err?.error?.message ?? 'Error al actualizar el usuario.';
        this.editSubmitting = false;
      }
    });
  }

  deactivateUser(userId: number, name: string): void {
    if (!confirm(`¿Desactivar al usuario "${name}"?`)) return;
    this.companyService.deactivateUser(this.companyId, userId).subscribe({
      next: () => this.loadUsers(),
      error: () => { this.error = 'Error al desactivar el usuario.'; }
    });
  }

  roleLabel(role: string): string {
    return role === 'company_admin' ? 'Administrador' : 'Usuario';
  }
}

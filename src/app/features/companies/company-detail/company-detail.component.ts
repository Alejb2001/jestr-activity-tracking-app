import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '../../../core/services/company.service';
import { CompanyRoleService } from '../../../core/services/company-role.service';
import { AuthService } from '../../../core/services/auth.service';
import { Company, CompanyUser } from '../../../core/models/company.model';
import { CompanyRole, ALL_PERMISSIONS, PERMISSION_GROUPS } from '../../../core/models/company-role.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './company-detail.component.html',
  styles: [`
    .tab-btn { border: none; background: none; padding: 8px 16px; border-bottom: 2px solid transparent; color: #6c757d; cursor: pointer; font-weight: 500; }
    .tab-btn.active { border-bottom-color: #0d6efd; color: #0d6efd; }
    .tab-btn:hover:not(.active) { background: #f8f9fa; }
    .perm-group-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #6c757d; margin-bottom: 6px; }
  `]
})
export class CompanyDetailComponent implements OnInit {
  // ── Estado general ─────────────────────────────────────────────────────
  company?: Company;
  loading = false;
  error   = '';
  companyId!: number;
  activeTab: 'users' | 'roles' = 'users';

  // ── Usuarios ───────────────────────────────────────────────────────────
  users: CompanyUser[] = [];
  usersLoading = false;
  submitting   = false;
  showUserForm = false;

  editingUser: CompanyUser | null = null;
  editSubmitting = false;
  editError      = '';

  // ── Roles ──────────────────────────────────────────────────────────────
  roles: CompanyRole[]   = [];
  rolesLoading           = false;
  showRoleForm           = false;
  editingRole: CompanyRole | null = null;
  roleSubmitting         = false;
  roleError              = '';
  deleteRoleConfirm: CompanyRole | null = null;

  readonly allPermissions  = ALL_PERMISSIONS;
  readonly permissionGroups = PERMISSION_GROUPS;

  private readonly auth        = inject(AuthService);
  private readonly route       = inject(ActivatedRoute);
  private readonly fb          = inject(FormBuilder);
  private readonly roleService = inject(CompanyRoleService);

  readonly currentUser   = this.auth.getCurrentUser();
  readonly isGlobalAdmin = this.auth.isGlobalAdmin();

  readonly roleOptions = [
    { value: 'company_admin',  label: 'Administrador de empresa' },
    { value: 'company_viewer', label: 'Usuario (solo lectura)' }
  ];

  userForm = this.fb.group({
    name:          ['', [Validators.required, Validators.maxLength(100)]],
    email:         ['', [Validators.required, Validators.email]],
    department:    ['', Validators.maxLength(100)],
    role:          ['company_viewer', Validators.required],
    username:      ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    password:      ['', [Validators.required, Validators.minLength(8)]],
    companyRoleId: [null as number | null]
  });

  editForm = this.fb.group({
    name:          ['', [Validators.required, Validators.maxLength(100)]],
    email:         ['', [Validators.required, Validators.email]],
    department:    ['', Validators.maxLength(100)],
    role:          ['company_viewer', Validators.required],
    username:      ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    password:      ['', Validators.minLength(8)],
    isActive:      [true],
    companyRoleId: [null as number | null]
  });

  roleForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]]
  });

  // Permisos del rol como Set mutable
  rolePermissions = new Set<string>();

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.companyId = id ? +id : this.currentUser!.companyId!;
    this.loadCompany();
    this.loadUsers();
    this.loadRoles();
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
      name:          v.name!,
      email:         v.email!,
      department:    v.department ?? '',
      role:          v.role as 'company_admin' | 'company_viewer',
      username:      v.username!,
      password:      v.password!,
      companyRoleId: v.companyRoleId ?? undefined
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
      name:          user.name,
      email:         user.email,
      department:    user.department,
      role:          user.role,
      username:      user.username,
      password:      '',
      isActive:      user.isActive,
      companyRoleId: (user as any).companyRoleId ?? null
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
      name:          v.name!,
      email:         v.email!,
      department:    v.department ?? '',
      role:          v.role as 'company_admin' | 'company_viewer',
      username:      v.username!,
      password:      v.password ?? undefined,
      isActive:      v.isActive ?? true,
      companyRoleId: v.companyRoleId ?? undefined
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

  // ── Gestión de roles ────────────────────────────────────────────────────

  loadRoles(): void {
    this.rolesLoading = true;
    this.roleService.getRoles(this.companyId).subscribe({
      next: (data) => { this.roles = data; this.rolesLoading = false; },
      error: ()    => { this.rolesLoading = false; }
    });
  }

  openNewRole(): void {
    this.editingRole     = null;
    this.roleError       = '';
    this.rolePermissions = new Set();
    this.roleForm.reset({ name: '' });
    this.showRoleForm = true;
  }

  openEditRole(role: CompanyRole): void {
    this.editingRole     = role;
    this.roleError       = '';
    this.rolePermissions = new Set(role.permissions);
    this.roleForm.reset({ name: role.name });
    this.showRoleForm = true;
  }

  cancelRoleForm(): void {
    this.showRoleForm = false;
    this.editingRole  = null;
    this.roleError    = '';
  }

  togglePermission(key: string): void {
    if (this.rolePermissions.has(key)) this.rolePermissions.delete(key);
    else                                this.rolePermissions.add(key);
  }

  toggleGroupPermissions(group: string): void {
    const groupPerms = this.allPermissions.filter(p => p.group === group).map(p => p.key);
    const allChecked = groupPerms.every(k => this.rolePermissions.has(k));
    if (allChecked) groupPerms.forEach(k => this.rolePermissions.delete(k));
    else            groupPerms.forEach(k => this.rolePermissions.add(k));
  }

  isGroupAllChecked(group: string): boolean {
    return this.allPermissions.filter(p => p.group === group).every(p => this.rolePermissions.has(p.key));
  }

  isGroupPartialChecked(group: string): boolean {
    const perms = this.allPermissions.filter(p => p.group === group);
    const checked = perms.filter(p => this.rolePermissions.has(p.key)).length;
    return checked > 0 && checked < perms.length;
  }

  saveRole(): void {
    if (this.roleForm.invalid) { this.roleForm.markAllAsTouched(); return; }
    this.roleSubmitting = true;
    this.roleError      = '';
    const payload = { name: this.roleForm.value.name!, permissions: [...this.rolePermissions] };

    const req$ = this.editingRole
      ? this.roleService.updateRole(this.companyId, this.editingRole.id, { ...payload, isActive: this.editingRole.isActive })
      : this.roleService.createRole(this.companyId, payload);

    req$.subscribe({
      next: () => {
        this.roleSubmitting = false;
        this.showRoleForm   = false;
        this.editingRole    = null;
        this.loadRoles();
      },
      error: (err) => {
        this.roleError      = err?.error?.message ?? 'Error al guardar el rol.';
        this.roleSubmitting = false;
      }
    });
  }

  confirmDeleteRole(role: CompanyRole): void {
    this.deleteRoleConfirm = role;
  }

  cancelDeleteRole(): void {
    this.deleteRoleConfirm = null;
  }

  deleteRole(): void {
    if (!this.deleteRoleConfirm) return;
    this.roleService.deleteRole(this.companyId, this.deleteRoleConfirm.id).subscribe({
      next: () => { this.deleteRoleConfirm = null; this.loadRoles(); },
      error: () => { this.roleError = 'No se pudo eliminar el rol.'; this.deleteRoleConfirm = null; }
    });
  }

  permissionsOfGroup(group: string) {
    return this.allPermissions.filter(p => p.group === group);
  }

  roleNameById(id: number | null | undefined): string {
    if (!id) return '—';
    return this.roles.find(r => r.id === id)?.name ?? '—';
  }

  permLabel(key: string): string {
    return this.allPermissions.find(p => p.key === key)?.label ?? key;
  }
}

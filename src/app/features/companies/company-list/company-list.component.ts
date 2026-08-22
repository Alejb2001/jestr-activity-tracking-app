import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '../../../core/services/company.service';
import { AuthService } from '../../../core/services/auth.service';
import { Company } from '../../../core/models/company.model';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './company-list.component.html'
})
export class CompanyListComponent implements OnInit {
  companies: Company[] = [];
  loading = false;
  submitting = false;
  error = '';
  showForm = false;

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.getCurrentUser();

  form = inject(FormBuilder).group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]]
  });

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.companyService.getAll().subscribe({
      next: (data) => { this.companies = data; this.loading = false; },
      error: () => { this.error = 'Error al cargar empresas.'; this.loading = false; }
    });
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(error) && ctrl.touched);
  }

  createCompany(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const { name, code } = this.form.value;
    this.companyService.create({ name: name!, code: code! }).subscribe({
      next: () => {
        this.form.reset();
        this.showForm = false;
        this.submitting = false;
        this.load();
      },
      error: () => { this.error = 'Error al crear la empresa.'; this.submitting = false; }
    });
  }

  deactivate(id: number, name: string): void {
    if (!confirm(`¿Desactivar la empresa "${name}"?`)) return;
    this.companyService.deactivate(id).subscribe({
      next: () => this.load(),
      error: () => { this.error = 'Error al desactivar la empresa.'; }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}

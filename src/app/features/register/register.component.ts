import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistrationService } from '../../core/services/registration.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private readonly fb  = inject(FormBuilder);
  private readonly svc = inject(RegistrationService);

  submitting = false;
  submitted  = false;
  error      = '';

  form = this.fb.group({
    companyName:   ['', [Validators.required, Validators.maxLength(100)]],
    contactName:   ['', [Validators.required, Validators.maxLength(100)]],
    contactEmail:  ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    adminUsername: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    adminPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(error) && ctrl.touched);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    this.error = '';
    const v = this.form.value;
    this.svc.submit({
      companyName:   v.companyName!,
      contactName:   v.contactName!,
      contactEmail:  v.contactEmail!,
      adminUsername: v.adminUsername!,
      adminPassword: v.adminPassword!
    }).subscribe({
      next: () => { this.submitted = true; this.submitting = false; },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error al enviar la solicitud. Inténtalo de nuevo.';
        this.submitting = false;
      }
    });
  }
}

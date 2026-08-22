import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

const GLOBAL_USERNAMES = ['admin', 'viewer'];

function companyCodeValidator(group: AbstractControl): ValidationErrors | null {
  const username = (group.get('username')?.value ?? '').toLowerCase().trim();
  const companyCode = (group.get('companyCode')?.value ?? '').trim();
  if (!GLOBAL_USERNAMES.includes(username) && !companyCode) {
    return { companyCodeRequired: true };
  }
  return null;
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  loading = false;

  form = this.fb.group({
    companyCode: [''],
    username: ['', Validators.required],
    password: ['', Validators.required]
  }, { validators: companyCodeValidator });

  get isGlobalUser(): boolean {
    const username = (this.form.get('username')?.value ?? '').toLowerCase().trim();
    return GLOBAL_USERNAMES.includes(username);
  }

  get showCompanyError(): boolean {
    return !!this.form.hasError('companyCodeRequired') && this.form.touched;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading = true;
    const { companyCode, username, password } = this.form.value;

    this.auth.login({
      username: username!,
      password: password!,
      companyCode: companyCode?.trim() || undefined
    }).subscribe({
      next: () => {
        this.router.navigateByUrl('/activities');
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}

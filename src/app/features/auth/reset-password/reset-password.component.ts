import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('newPassword')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="card shadow-sm" style="width:100%;max-width:400px">
        <div class="card-body p-4">

          <div class="text-center mb-4">
            <img src="favicon.ico" alt="Jestr" style="width:56px;height:56px;object-fit:contain;margin-bottom:12px">
            <h5 class="fw-bold mb-1">Nueva contraseña</h5>
          </div>

          @if (!token) {
            <div class="alert alert-danger py-2" style="font-size:14px">
              Enlace inválido. Solicita uno nuevo desde el login.
            </div>
            <div class="text-center mt-3">
              <a routerLink="/login" class="btn btn-outline-primary px-4">Volver al login</a>
            </div>
          } @else if (done) {
            <div class="alert alert-success py-2 mb-3" style="font-size:14px">
              ¡Contraseña actualizada! Ya puedes iniciar sesión.
            </div>
            <div class="text-center">
              <a routerLink="/login" class="btn btn-primary px-4">Ir al login</a>
            </div>
          } @else {
            @if (error) {
              <div class="alert alert-danger py-2 mb-3" style="font-size:14px">{{ error }}</div>
            }

            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>

              <div class="mb-3">
                <label class="form-label fw-semibold">Nueva contraseña</label>
                <div class="input-group has-validation">
                  <input [type]="showPw ? 'text' : 'password'" class="form-control"
                         formControlName="newPassword" placeholder="Mín. 8 caracteres"
                         autocomplete="new-password"
                         [class.is-invalid]="f('newPassword')?.invalid && f('newPassword')?.touched">
                  <button class="btn btn-outline-secondary" type="button" (click)="showPw = !showPw">
                    @if (showPw) {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    }
                  </button>
                  <div class="invalid-feedback">Mín. 8 caracteres.</div>
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label fw-semibold">Confirmar contraseña</label>
                <div class="input-group has-validation">
                  <input [type]="showPwConfirm ? 'text' : 'password'" class="form-control"
                         formControlName="confirmPassword" placeholder="Repite la contraseña"
                         autocomplete="new-password"
                         [class.is-invalid]="(f('confirmPassword')?.touched && f('confirmPassword')?.hasError('required')) || passwordMismatch">
                  <button class="btn btn-outline-secondary" type="button" (click)="showPwConfirm = !showPwConfirm">
                    @if (showPwConfirm) {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    }
                  </button>
                  <div class="invalid-feedback">
                    @if (f('confirmPassword')?.hasError('required') && f('confirmPassword')?.touched) { Requerido. }
                    @else { Las contraseñas no coinciden. }
                  </div>
                </div>
              </div>

              <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                @if (loading) {
                  <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Guardando...
                } @else {
                  Guardar contraseña
                }
              </button>
            </form>
          }

        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb    = inject(FormBuilder);
  private readonly auth  = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  token         = '';
  loading       = false;
  done          = false;
  error         = '';
  showPw        = false;
  showPwConfirm = false;

  form = this.fb.group({
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  f(name: string) { return this.form.get(name); }

  get passwordMismatch(): boolean {
    return !!this.form.hasError('passwordMismatch') && !!this.f('confirmPassword')?.touched;
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error   = '';
    this.auth.resetPassword(this.token, this.form.value.newPassword!).subscribe({
      next: () => { this.done = true; this.loading = false; },
      error: (err) => {
        this.error   = err?.error?.message ?? 'Error al restablecer la contraseña.';
        this.loading = false;
      }
    });
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="card shadow-sm" style="width:100%;max-width:400px">
        <div class="card-body p-4">

          <div class="text-center mb-4">
            <img src="favicon.ico" alt="Jestr" style="width:56px;height:56px;object-fit:contain;margin-bottom:12px">
            <h5 class="fw-bold mb-1">¿Olvidaste tu contraseña?</h5>
            <p class="text-muted" style="font-size:14px">Ingresa tu email y te enviaremos un enlace para restablecerla.</p>
          </div>

          @if (sent) {
            <div class="alert alert-success py-2" style="font-size:14px">
              Si existe una cuenta con ese email, recibirás las instrucciones en breve.
            </div>
            <div class="text-center mt-3">
              <a routerLink="/login" class="btn btn-outline-primary px-4">Volver al login</a>
            </div>
          } @else {
            @if (error) {
              <div class="alert alert-danger py-2 mb-3" style="font-size:14px">{{ error }}</div>
            }

            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" formControlName="email"
                       placeholder="tu@empresa.com"
                       [class.is-invalid]="form.get('email')?.invalid && form.get('email')?.touched">
                <div class="invalid-feedback">Email válido requerido.</div>
              </div>

              <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
                @if (loading) {
                  <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Enviando...
                } @else {
                  Enviar enlace
                }
              </button>
            </form>

            <p class="text-center mt-3 mb-0" style="font-size:13px">
              <a routerLink="/login">Volver al login</a>
            </p>
          }

        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private readonly fb   = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  loading = false;
  sent    = false;
  error   = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error   = '';
    this.auth.forgotPassword(this.form.value.email!).subscribe({
      next: () => { this.sent = true; this.loading = false; },
      error: () => {
        this.error   = 'Error al enviar el email. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }
}

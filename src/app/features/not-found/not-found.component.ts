import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="min-vh-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
      <img src="favicon.ico" alt="Jestr" style="width:80px;height:80px;object-fit:contain;opacity:0.35;margin-bottom:24px">
      <h1 class="fw-bold" style="font-size:6rem;line-height:1;color:#dee2e6">404</h1>
      <h4 class="fw-bold mt-2 mb-1">P&aacute;gina no encontrada</h4>
      <p class="text-muted mb-4">La ruta que buscas no existe o fue movida.</p>
      <a routerLink="/activities" class="btn btn-primary px-4">Volver al inicio</a>
    </div>
  `
})
export class NotFoundComponent {}

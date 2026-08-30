import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  styles: [':host { margin-top: auto; display: block; }'],
  template: `
    <footer class="bg-primary text-white mt-5 py-3" style="border-top:3px solid rgba(0,0,0,0.15)">
      <div class="container d-flex flex-wrap align-items-center justify-content-between gap-2">

        <span style="font-size:13px;opacity:0.85">
          &copy; 2026 Jestr &middot; Todos los derechos reservados
        </span>

        <div class="d-flex gap-3" style="font-size:13px">
          <a routerLink="/terms"   class="text-white text-decoration-none" style="opacity:0.85" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.85">T&eacute;rminos de uso</a>
          <a routerLink="/privacy" class="text-white text-decoration-none" style="opacity:0.85" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.85">Privacidad</a>
          <a href="mailto:hola@jestr.app" class="text-white text-decoration-none" style="opacity:0.85" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.85">Contacto</a>
        </div>

      </div>
    </footer>
  `
})
export class FooterComponent {}

import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { FooterComponent } from './shared/components/footer/footer.component';

const NO_FOOTER_ROUTES = ['/login'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ToastContainerComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly router = inject(Router);

  showFooter = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => !NO_FOOTER_ROUTES.some(r => (e as NavigationEnd).urlAfterRedirects.startsWith(r))),
      startWith(!NO_FOOTER_ROUTES.some(r => window.location.pathname.startsWith(r)))
    )
  );
}

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'activities', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'activities',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/activities/activity-list/activity-list.component')
        .then(m => m.ActivityListComponent)
  },
  {
    path: 'activities/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/activities/activity-form/activity-form.component')
        .then(m => m.ActivityFormComponent)
  },
  {
    path: 'activities/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/activities/activity-form/activity-form.component')
        .then(m => m.ActivityFormComponent)
  }
];

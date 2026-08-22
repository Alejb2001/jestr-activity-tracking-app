import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { editGuard } from './core/guards/edit.guard';
import { companyAccessGuard } from './core/guards/company-access.guard';

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
    canActivate: [authGuard, editGuard],
    loadComponent: () =>
      import('./features/activities/activity-form/activity-form.component')
        .then(m => m.ActivityFormComponent)
  },
  {
    path: 'activities/:id/edit',
    canActivate: [authGuard, editGuard],
    loadComponent: () =>
      import('./features/activities/activity-form/activity-form.component')
        .then(m => m.ActivityFormComponent)
  },
  {
    path: 'companies',
    canActivate: [authGuard, companyAccessGuard],
    loadComponent: () =>
      import('./features/companies/company-list/company-list.component')
        .then(m => m.CompanyListComponent)
  },
  {
    path: 'companies/:id',
    canActivate: [authGuard, companyAccessGuard],
    loadComponent: () =>
      import('./features/companies/company-detail/company-detail.component')
        .then(m => m.CompanyDetailComponent)
  },
  { path: '**', redirectTo: 'activities' }
];

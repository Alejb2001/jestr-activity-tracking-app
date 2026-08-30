import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { editGuard } from './core/guards/edit.guard';
import { companyAccessGuard } from './core/guards/company-access.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'activities', pathMatch: 'full' },
  {
    path: 'login',
    title: 'Iniciar sesi\u00f3n',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    title: 'Dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'activities',
    title: 'Actividades',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/activities/activity-list/activity-list.component')
        .then(m => m.ActivityListComponent)
  },
  {
    path: 'activities/new',
    title: 'Nueva Actividad',
    canActivate: [authGuard, editGuard],
    loadComponent: () =>
      import('./features/activities/activity-form/activity-form.component')
        .then(m => m.ActivityFormComponent)
  },
  {
    path: 'activities/:id/edit',
    title: 'Editar Actividad',
    canActivate: [authGuard, editGuard],
    loadComponent: () =>
      import('./features/activities/activity-form/activity-form.component')
        .then(m => m.ActivityFormComponent)
  },
  {
    path: 'planning',
    title: 'Planificaci\u00f3n',
    canActivate: [authGuard, editGuard],
    loadComponent: () =>
      import('./features/planning/planning.component')
        .then(m => m.PlanningComponent)
  },
  {
    path: 'profile',
    title: 'Mi Perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component')
        .then(m => m.ProfileComponent)
  },
  {
    path: 'companies',
    title: 'Empresas',
    canActivate: [authGuard, companyAccessGuard],
    loadComponent: () =>
      import('./features/companies/company-list/company-list.component')
        .then(m => m.CompanyListComponent)
  },
  {
    path: 'companies/:id',
    title: 'Detalle de Empresa',
    canActivate: [authGuard, companyAccessGuard],
    loadComponent: () =>
      import('./features/companies/company-detail/company-detail.component')
        .then(m => m.CompanyDetailComponent)
  },
  { path: '**', redirectTo: 'activities' }
];

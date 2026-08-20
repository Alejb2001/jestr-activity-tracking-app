import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'activities', pathMatch: 'full' },
  {
    path: 'activities',
    loadComponent: () =>
      import('./features/activities/activity-list/activity-list.component')
        .then(m => m.ActivityListComponent)
  },
  {
    path: 'activities/new',
    loadComponent: () =>
      import('./features/activities/activity-form/activity-form.component')
        .then(m => m.ActivityFormComponent)
  },
  {
    path: 'activities/:id/edit',
    loadComponent: () =>
      import('./features/activities/activity-form/activity-form.component')
        .then(m => m.ActivityFormComponent)
  }
];

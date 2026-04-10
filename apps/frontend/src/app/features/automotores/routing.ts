import { Routes } from '@angular/router';

export const AUTOMOTORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list/list').then((m) => m.AutomotolesListComponent),
  },
  {
    path: 'form',
    loadComponent: () =>
      import('./pages/form/form').then((m) => m.FormComponent),
  },
  {
    path: 'form/:dominio',
    loadComponent: () =>
      import('./pages/form/form').then((m) => m.FormComponent),
  },
];

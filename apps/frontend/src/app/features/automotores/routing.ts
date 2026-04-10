import { Routes } from '@angular/router';

export const AUTOMOTORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/form/form').then((m) => m.FormComponent),
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

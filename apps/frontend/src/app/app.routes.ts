import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'automotores',
    pathMatch: 'full',
  },
  {
    path: 'automotores',
    loadChildren: () =>
      import('./features/automotores/routing').then(
        (m) => m.AUTOMOTORES_ROUTES
      ),
  },
  {
    path: 'sujetos',
    loadChildren: () =>
      import('./features/sujetos/routing').then(
        (m) => m.SUJETOS_ROUTES
      ),
  },
  {
    path: '**',
    redirectTo: 'automotores',
  },
];

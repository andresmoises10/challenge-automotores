import { Routes } from '@angular/router';

export const SUJETOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/sujetos-list/sujetos-list').then(
        (m) => m.SujetosListComponent
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/sujetos-detail/sujetos-detail').then(
        (m) => m.SujetosDetailComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/sujetos-detail/sujetos-detail').then(
        (m) => m.SujetosDetailComponent
      ),
  },
];

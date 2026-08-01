import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'radar' },
  {
    path: 'radar',
    loadChildren: () => import('./features/radar/radar.routes').then((module) => module.RADAR_ROUTES),
  },
  {
    path: 'explorador',
    loadChildren: () => import('./features/explorer/explorer.routes').then((module) => module.EXPLORER_ROUTES),
  },
  {
    path: 'operaciones',
    loadChildren: () => import('./features/operations/operations.routes').then((module) => module.OPERATIONS_ROUTES),
  },
  { path: '**', redirectTo: 'radar' },
];

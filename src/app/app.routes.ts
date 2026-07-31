import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'radar' },
  {
    path: 'radar',
    loadChildren: () => import('./features/radar/radar.routes').then((module) => module.RADAR_ROUTES),
  },
  { path: '**', redirectTo: 'radar' },
];

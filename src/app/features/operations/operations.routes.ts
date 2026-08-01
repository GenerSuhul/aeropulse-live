import { Routes } from '@angular/router';
import { OperationsStorageService } from './data-access/operations-storage.service';
import { OperationsFacade } from './services/operations.facade';

export const OPERATIONS_ROUTES: Routes = [{
  path: '',
  loadComponent: () => import('./components/operations-page/operations-page.component').then((component) => component.OperationsPageComponent),
  providers: [OperationsStorageService, OperationsFacade],
}];

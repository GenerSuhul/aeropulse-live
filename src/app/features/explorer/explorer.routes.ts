import { Routes } from '@angular/router';
import { AdsbdbFlightService } from './data-access/adsbdb-flight.service';
import { ExplorerFacade } from './services/explorer.facade';

export const EXPLORER_ROUTES: Routes = [{
  path: '',
  loadComponent: () => import('./components/explorer-page/explorer-page.component').then((component) => component.ExplorerPageComponent),
  providers: [AdsbdbFlightService, ExplorerFacade],
}];

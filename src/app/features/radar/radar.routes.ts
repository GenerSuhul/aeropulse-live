import { Routes } from '@angular/router';
import { OpenSkyAircraftProvider } from './data-access/opensky-aircraft.provider';
import { AIRCRAFT_DATA_PROVIDER } from './services/aircraft-data-provider.token';
import { AircraftTrackService } from './services/aircraft-track.service';
import { RadarFacade } from './services/radar.facade';

export const RADAR_ROUTES: Routes = [{
  path: '',
  loadComponent: () => import('./components/radar-page/radar-page.component').then((component) => component.RadarPageComponent),
  providers: [
    OpenSkyAircraftProvider, AircraftTrackService, RadarFacade,
    { provide: AIRCRAFT_DATA_PROVIDER, useExisting: OpenSkyAircraftProvider },
  ],
}];

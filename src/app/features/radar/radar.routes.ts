import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AdsbLolAircraftProvider } from './data-access/adsb-lol-aircraft.provider';
import { MockAircraftProvider } from './data-access/mock-aircraft.provider';
import { RADAR_API_CONFIG } from './data-access/radar-api.config';
import { AIRCRAFT_DATA_PROVIDER } from './services/aircraft-data-provider.token';
import { AircraftTrackService } from './services/aircraft-track.service';
import { RadarFacade } from './services/radar.facade';

export const RADAR_ROUTES: Routes = [{
  path: '',
  loadComponent: () => import('./components/radar-page/radar-page.component').then((component) => component.RadarPageComponent),
  providers: [
    AdsbLolAircraftProvider, MockAircraftProvider, AircraftTrackService, RadarFacade,
    { provide: AIRCRAFT_DATA_PROVIDER, useFactory: () => inject(RADAR_API_CONFIG).useMockProvider ? inject(MockAircraftProvider) : inject(AdsbLolAircraftProvider) },
  ],
}];

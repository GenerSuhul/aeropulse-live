import { InjectionToken } from '@angular/core';
import { AircraftDataProvider } from './aircraft-data-provider';

export const AIRCRAFT_DATA_PROVIDER = new InjectionToken<AircraftDataProvider>('AIRCRAFT_DATA_PROVIDER');

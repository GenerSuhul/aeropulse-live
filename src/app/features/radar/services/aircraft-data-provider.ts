import { Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Aircraft } from '../models/aircraft.model';
import { GeographicArea } from '../models/geographic-area.model';

export interface AircraftDataProvider {
  readonly source: Signal<string>;
  getAircraft(area: GeographicArea): Observable<readonly Aircraft[]>;
}

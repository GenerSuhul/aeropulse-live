import { Observable } from 'rxjs';
import { Aircraft } from '../models/aircraft.model';
import { GeographicArea } from '../models/geographic-area.model';

export interface AircraftDataProvider {
  getAircraft(area: GeographicArea): Observable<readonly Aircraft[]>;
}

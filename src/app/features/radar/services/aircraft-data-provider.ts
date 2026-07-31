import { Observable } from 'rxjs';
import { Aircraft } from '../models/aircraft.model';
import { RadarQuery } from '../models/radar-query.model';

export interface AircraftDataProvider {
  getAircraft(query: RadarQuery): Observable<readonly Aircraft[]>;
}

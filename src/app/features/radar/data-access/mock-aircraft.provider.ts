import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { Aircraft } from '../models/aircraft.model';
import { RadarQuery } from '../models/radar-query.model';
import { AircraftDataProvider } from '../services/aircraft-data-provider';

@Injectable()
export class MockAircraftProvider implements AircraftDataProvider {
  getAircraft(query: RadarQuery): Observable<readonly Aircraft[]> {
    const offsets = [
      [0.18, -0.24], [-0.31, 0.17], [0.42, 0.36], [-0.12, -0.48],
      [0.55, -0.09], [-0.45, -0.31], [0.09, 0.52], [-0.57, 0.23],
    ] as const;
    const aircraft = offsets.map(([latOffset, lonOffset], index): Aircraft => ({
      id: `mock${index + 1}`,
      icao24: `A0${(12_340 + index).toString(16).toUpperCase()}`,
      callsign: ['AVA042', 'TAG117', 'UAL821', 'CMP358', 'NKS220', 'DAL704', 'AAL166', 'UPS912'][index] ?? null,
      registration: `N${410 + index}AP`, aircraftType: index % 3 === 0 ? 'A320' : index % 3 === 1 ? 'B738' : 'E190',
      description: null, operator: null,
      latitude: query.latitude + latOffset, longitude: query.longitude + lonOffset,
      altitudeFeet: index === 6 ? 0 : 8_000 + index * 3_450,
      groundSpeedKnots: index === 6 ? 0 : 210 + index * 31,
      headingDegrees: (32 + index * 47) % 360,
      verticalRateFeetPerMinute: index === 6 ? 0 : (index % 2 === 0 ? 640 : -320),
      squawk: `${4100 + index}`, category: index === 6 ? 'A1' : 'A3', isOnGround: index === 6,
      emergency: 'none', secondsSinceLastMessage: index * 0.2, secondsSinceLastPosition: index * 0.3,
    }));
    return of(aircraft).pipe(delay(250));
  }
}

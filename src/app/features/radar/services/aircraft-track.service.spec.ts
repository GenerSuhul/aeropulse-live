import { describe, expect, it } from 'vitest';
import { Aircraft } from '../models/aircraft.model';
import { AircraftTrackService } from './aircraft-track.service';

const aircraft = (id: string, longitude: number, latitude: number): Aircraft => ({ id, icao24: id, callsign: null, registration: null, aircraftType: null, description: null, operator: null, originCountry: null, latitude, longitude, altitudeFeet: null, groundSpeedKnots: null, headingDegrees: null, verticalRateFeetPerMinute: null, squawk: null, category: null, isOnGround: false, emergency: null, secondsSinceLastMessage: null, secondsSinceLastPosition: null });

describe('AircraftTrackService', () => {
  it('evita duplicados y limpia la trayectoria al cambiar selección', () => {
    const service = new AircraftTrackService(); service.select('a'); service.append(aircraft('a', -89, 16)); service.append(aircraft('a', -89, 16));
    expect(service.points()).toEqual([[-89, 16]]); service.select('b'); expect(service.points()).toEqual([]);
  });

  it('limita la trayectoria a 120 puntos', () => {
    const service = new AircraftTrackService(); service.select('a');
    for (let index = 0; index < 130; index += 1) service.append(aircraft('a', -89 + index / 1000, 16));
    expect(service.points()).toHaveLength(120);
  });
});

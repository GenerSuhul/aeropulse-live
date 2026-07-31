import { describe, expect, it } from 'vitest';
import { Aircraft } from './aircraft.model';
import { calculateRadarMetrics } from './radar-metrics.model';

const item = (isOnGround: boolean, altitudeFeet: number | null, groundSpeedKnots: number | null): Aircraft => ({ id: `${isOnGround}-${altitudeFeet}`, icao24: 'ABC123', callsign: null, registration: null, aircraftType: null, description: null, operator: null, originCountry: null, latitude: null, longitude: null, altitudeFeet, groundSpeedKnots, headingDegrees: null, verticalRateFeetPerMinute: null, squawk: null, category: null, isOnGround, emergency: null, secondsSinceLastMessage: null, secondsSinceLastPosition: null });

describe('calculateRadarMetrics', () => {
  it('calcula totales y promedios sin incluir altitud en tierra', () => {
    expect(calculateRadarMetrics([item(false, 10_000, 200), item(false, 20_000, 300), item(true, 0, 0)])).toEqual({ totalAircraft: 3, airborneAircraft: 2, onGroundAircraft: 1, averageAltitude: 15_000, averageSpeed: 167 });
  });
});

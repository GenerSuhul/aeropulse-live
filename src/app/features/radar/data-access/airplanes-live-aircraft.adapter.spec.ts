import { AirplanesLiveAircraftAdapter } from './airplanes-live-aircraft.adapter';

describe('AirplanesLiveAircraftAdapter', () => {
  it('normalizes a live ADS-B aircraft into the radar domain', () => {
    const aircraft = AirplanesLiveAircraftAdapter.toDomain({
      hex: ' 0B417F ', flight: ' TGDEK ', r: 'TG-ABC', t: 'C172', lat: 15.6, lon: -90.1,
      alt_baro: 9600, gs: 127, track: 84, baro_rate: 320, squawk: '1200', emergency: 'none', seen: 0.4, seen_pos: 0.8,
    });
    expect(aircraft).toMatchObject({
      id: '0b417f', callsign: 'TGDEK', registration: 'TG-ABC', aircraftType: 'C172', latitude: 15.6,
      longitude: -90.1, altitudeFeet: 9600, groundSpeedKnots: 127, headingDegrees: 84, isOnGround: false,
    });
  });

  it('recognizes ground aircraft and discards records without an ICAO address', () => {
    expect(AirplanesLiveAircraftAdapter.toDomain({ hex: 'abc123', alt_baro: 'ground' })).toMatchObject({ altitudeFeet: 0, isOnGround: true });
    expect(AirplanesLiveAircraftAdapter.toDomain({ flight: 'UNKNOWN' })).toBeNull();
  });
});

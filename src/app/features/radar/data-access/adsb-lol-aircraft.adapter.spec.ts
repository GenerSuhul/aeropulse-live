import { describe, expect, it } from 'vitest';
import { AdsbLolAircraftAdapter } from './adsb-lol-aircraft.adapter';
import { AdsbLolAircraftDto, AdsbLolResponseDto } from './adsb-lol-aircraft.dto';

const baseDto: AdsbLolAircraftDto = { hex: 'ad5ff1', type: 'adsb_icao', messages: 682, mlat: [], tisb: [], rssi: -25.8, seen: 0 };

describe('AdsbLolAircraftAdapter', () => {
  it('normaliza una respuesta completa respaldada por ADSB.lol', () => {
    const aircraft = AdsbLolAircraftAdapter.toDomain({ ...baseDto, flight: 'TAI324  ', r: 'N961AV', t: 'A320', alt_baro: 35_975, alt_geom: 38_375, gs: 431.4, track: 43.87, baro_rate: 320, squawk: '7371', emergency: 'none', category: 'A3', lat: 25.974799, lon: -84.780385, seen_pos: 0.138 });
    expect(aircraft).toMatchObject({ id: 'ad5ff1', icao24: 'AD5FF1', callsign: 'TAI324', registration: 'N961AV', aircraftType: 'A320', altitudeFeet: 35_975, headingDegrees: 43.87, isOnGround: false });
  });

  it('convierte campos opcionales ausentes en null', () => {
    const aircraft = AdsbLolAircraftAdapter.toDomain(baseDto);
    expect(aircraft.callsign).toBeNull(); expect(aircraft.altitudeFeet).toBeNull(); expect(aircraft.operator).toBeNull();
  });

  it('elimina espacios del callsign', () => expect(AdsbLolAircraftAdapter.toDomain({ ...baseDto, flight: '  AVA042  ' }).callsign).toBe('AVA042'));

  it('interpreta altitud ground', () => expect(AdsbLolAircraftAdapter.toDomain({ ...baseDto, alt_baro: 'ground' })).toMatchObject({ isOnGround: true, altitudeFeet: 0 }));

  it('conserva en dominio aeronaves sin coordenadas y permite filtrarlas para mapa', () => {
    const aircraft = AdsbLolAircraftAdapter.toDomain({ ...baseDto, lat: null, lon: null });
    expect(aircraft.latitude).toBeNull(); expect(AdsbLolAircraftAdapter.withCoordinates([aircraft])).toEqual([]);
  });

  it('convierte valores numéricos no finitos en null', () => {
    const aircraft = AdsbLolAircraftAdapter.toDomain({ ...baseDto, lat: Number.NaN, gs: Number.POSITIVE_INFINITY, alt_baro: Number.NaN });
    expect(aircraft.latitude).toBeNull(); expect(aircraft.groundSpeedKnots).toBeNull(); expect(aircraft.altitudeFeet).toBeNull();
  });

  it('normaliza rumbo fuera del intervalo a 0–359', () => {
    expect(AdsbLolAircraftAdapter.toDomain({ ...baseDto, track: 725 }).headingDegrees).toBe(5);
    expect(AdsbLolAircraftAdapter.toDomain({ ...baseDto, track: -15 }).headingDegrees).toBe(345);
  });

  it('acepta una respuesta vacía', () => {
    const response: AdsbLolResponseDto = { ac: [], msg: 'No error', now: 0, total: 0, ctime: 0, ptime: 0 };
    expect(AdsbLolAircraftAdapter.fromResponse(response)).toEqual([]);
  });
});

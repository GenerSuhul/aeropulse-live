import { describe, expect, it } from 'vitest';
import { OpenSkyAircraftAdapter } from './opensky-aircraft.adapter';
import { OpenSkyResponseDto, OpenSkyStateVectorDto } from './opensky-aircraft.dto';

const state: OpenSkyStateVectorDto = ['abc123', ' GUA101 ', 'Guatemala', 1_000, 1_002, -90.5, 15.6, 10_000, false, 200, 370, -3, null, 10_100, '1234', false, 0, 3];

describe('OpenSkyAircraftAdapter', () => {
  it('normaliza una posición real y convierte unidades aeronáuticas', () => {
    const aircraft = OpenSkyAircraftAdapter.toDomain(state, 1_010);
    expect(aircraft).toMatchObject({ id: 'abc123', callsign: 'GUA101', originCountry: 'Guatemala', altitudeFeet: 32_808, groundSpeedKnots: 389, headingDegrees: 10, verticalRateFeetPerMinute: -591, secondsSinceLastMessage: 8 });
  });

  it('interpreta aeronaves en tierra y campos ausentes', () => {
    const ground: OpenSkyStateVectorDto = ['def456', null, 'Mexico', null, 2_000, null, null, null, true, null, null, null, null, null, null, false, 0];
    expect(OpenSkyAircraftAdapter.toDomain(ground, 2_005)).toMatchObject({ callsign: null, latitude: null, altitudeFeet: 0, isOnGround: true });
  });

  it('acepta respuestas sin estados', () => {
    const response: OpenSkyResponseDto = { time: 1, states: null };
    expect(OpenSkyAircraftAdapter.fromResponse(response)).toEqual([]);
  });
});

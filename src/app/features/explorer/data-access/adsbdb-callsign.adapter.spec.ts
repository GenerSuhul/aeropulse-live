import { describe, expect, it } from 'vitest';
import { AdsbdbCallsignAdapter } from './adsbdb-callsign.adapter';
import { AdsbdbCallsignResponseDto, AdsbdbResponseDto } from './adsbdb.dto';

describe('AdsbdbCallsignAdapter', () => {
  it('normaliza una ruta establecida real', () => {
    const response: AdsbdbResponseDto<AdsbdbCallsignResponseDto> = {
      response: {
        flightroute: {
          callsign: ' UAL1234 ',
          callsign_icao: 'UAL1234',
          callsign_iata: 'UA1234',
          airline: { name: 'United Airlines', icao: 'UAL', iata: 'UA', country: 'United States', country_iso: 'US', callsign: 'UNITED' },
          origin: { name: 'Newark Liberty International Airport', icao_code: 'KEWR', iata_code: 'EWR', municipality: 'New York', country_name: 'United States', country_iso_name: 'US', elevation: 18, latitude: 40.69, longitude: -74.17 },
          destination: { name: "Chicago O'Hare International Airport", icao_code: 'KORD', iata_code: 'ORD', municipality: 'Chicago', country_name: 'United States', country_iso_name: 'US', elevation: 672, latitude: 41.98, longitude: -87.9 },
        },
      },
    };
    const route = AdsbdbCallsignAdapter.fromResponse(response);
    expect(route).not.toBeNull();
    expect(route).toMatchObject({ callsign: 'UAL1234', callsignIata: 'UA1234' });
    expect(route?.airline).toMatchObject({ name: 'United Airlines', icao: 'UAL' });
    expect(route?.origin).toMatchObject({ icaoCode: 'KEWR', iataCode: 'EWR', municipality: 'New York' });
    expect(route?.destination?.icaoCode).toBe('KORD');
  });

  it('devuelve null cuando el envelope es un mensaje de desconocido', () => {
    expect(AdsbdbCallsignAdapter.fromResponse({ response: 'unknown callsign' })).toBeNull();
  });

  it('acepta campos ausentes como null', () => {
    const route = AdsbdbCallsignAdapter.fromResponse({ response: { flightroute: { callsign: 'X123' } } });
    expect(route).toMatchObject({ callsign: 'X123', airline: null, origin: null, destination: null });
  });

  it('devuelve null cuando no hay flightroute', () => {
    expect(AdsbdbCallsignAdapter.fromResponse({ response: {} })).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { AdsbdbAirlineAdapter } from './adsbdb-airline.adapter';
import { AdsbdbAirlineDto, AdsbdbResponseDto } from './adsbdb.dto';

describe('AdsbdbAirlineAdapter', () => {
  it('normaliza un arreglo de aerolíneas reales', () => {
    const response: AdsbdbResponseDto<readonly AdsbdbAirlineDto[]> = {
      response: [
        { name: 'Continental Micronesia', icao: 'CMI', iata: 'CS', country: 'United States', country_iso: 'US', callsign: 'AIR MIKE' },
        { name: 'Aztec Worldwide Airlines', icao: 'AZY', iata: 'AJ', country: 'United States', country_iso: 'US', callsign: null },
      ],
    };
    const airlines = AdsbdbAirlineAdapter.fromResponse(response);
    expect(airlines).toEqual([
      { name: 'Continental Micronesia', icao: 'CMI', iata: 'CS', country: 'United States', countryIso: 'US', callsign: 'AIR MIKE' },
      { name: 'Aztec Worldwide Airlines', icao: 'AZY', iata: 'AJ', country: 'United States', countryIso: 'US', callsign: null },
    ]);
  });

  it('devuelve un arreglo vacío cuando no hay aerolíneas', () => {
    expect(AdsbdbAirlineAdapter.fromResponse({ response: 'unknown airline' })).toEqual([]);
    expect(AdsbdbAirlineAdapter.fromResponse({})).toEqual([]);
  });
});

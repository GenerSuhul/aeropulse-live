import { describe, expect, it } from 'vitest';
import { AdsbdbAircraftAdapter } from './adsbdb-aircraft.adapter';
import { AdsbdbAircraftResponseDto, AdsbdbResponseDto } from './adsbdb.dto';

describe('AdsbdbAircraftAdapter', () => {
  it('normaliza una aeronave real del registro', () => {
    const response: AdsbdbResponseDto<AdsbdbAircraftResponseDto> = {
      response: {
        aircraft: {
          type: 'Global 5000',
          icao_type: 'GL5T',
          manufacturer: 'Bombardier',
          mode_s: 'A9972B',
          registration: 'N717MK',
          registered_owner_country_iso_name: 'US',
          registered_owner_country_name: 'United States',
          registered_owner_operator_flag_code: 'GL5T',
          registered_owner: 'The Whitewind Company',
          url_photo: null,
          url_photo_thumbnail: null,
        },
      },
    };
    const aircraft = AdsbdbAircraftAdapter.fromResponse(response);
    expect(aircraft).toMatchObject({
      type: 'Global 5000',
      icaoType: 'GL5T',
      manufacturer: 'Bombardier',
      modeS: 'A9972B',
      registration: 'N717MK',
      ownerCountryName: 'United States',
      operatorFlagCode: 'GL5T',
      registeredOwner: 'The Whitewind Company',
      photoUrl: null,
    });
  });

  it('devuelve null cuando el envelope es un mensaje de desconocido', () => {
    expect(AdsbdbAircraftAdapter.fromResponse({ response: 'unknown aircraft' })).toBeNull();
  });

  it('devuelve null cuando no hay objeto aircraft', () => {
    expect(AdsbdbAircraftAdapter.fromResponse({ response: {} })).toBeNull();
  });
});

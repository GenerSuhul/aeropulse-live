import { Airline } from '../models/airline.model';
import { Airport } from '../models/airport.model';
import { FlightRoute } from '../models/flight-route.model';
import { AdsbdbAirlineDto, AdsbdbAirportDto, AdsbdbCallsignResponseDto, AdsbdbFlightRouteDto, AdsbdbResponseDto } from './adsbdb.dto';

function text(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function number(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export class AdsbdbCallsignAdapter {
  static fromResponse(response: AdsbdbResponseDto<AdsbdbCallsignResponseDto>): FlightRoute | null {
    if (typeof response.response === 'string' || !response.response) return null;
    const route = response.response.flightroute;
    if (typeof route !== 'object' || route === null) return null;
    const routeDto = route as AdsbdbFlightRouteDto;
    const callsign = text(routeDto.callsign);
    if (!callsign) return null;
    return {
      callsign,
      callsignIcao: text(routeDto.callsign_icao),
      callsignIata: text(routeDto.callsign_iata),
      airline: this.airline(routeDto.airline),
      origin: this.airport(routeDto.origin),
      destination: this.airport(routeDto.destination),
    };
  }

  private static airline(value: unknown): Airline | null {
    if (typeof value !== 'object' || value === null) return null;
    const airline = value as AdsbdbAirlineDto;
    if (text(airline.name) === null && text(airline.icao) === null) return null;
    return {
      name: text(airline.name),
      icao: text(airline.icao),
      iata: text(airline.iata),
      country: text(airline.country),
      countryIso: text(airline.country_iso),
      callsign: text(airline.callsign),
    };
  }

  private static airport(value: unknown): Airport | null {
    if (typeof value !== 'object' || value === null) return null;
    const airport = value as AdsbdbAirportDto;
    if (text(airport.name) === null && text(airport.icao_code) === null) return null;
    return {
      name: text(airport.name),
      icaoCode: text(airport.icao_code),
      iataCode: text(airport.iata_code),
      municipality: text(airport.municipality),
      countryName: text(airport.country_name),
      countryIsoName: text(airport.country_iso_name),
      elevation: number(airport.elevation),
      latitude: number(airport.latitude),
      longitude: number(airport.longitude),
    };
  }
}

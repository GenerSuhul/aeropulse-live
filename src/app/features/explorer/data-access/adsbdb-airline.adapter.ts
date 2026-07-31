import { Airline } from '../models/airline.model';
import { AdsbdbAirlineDto, AdsbdbResponseDto } from './adsbdb.dto';

function text(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export class AdsbdbAirlineAdapter {
  static fromResponse(response: AdsbdbResponseDto<readonly AdsbdbAirlineDto[]>): readonly Airline[] {
    if (typeof response.response === 'string' || !Array.isArray(response.response)) return [];
    return response.response.map((item) => ({
      name: text(item.name),
      icao: text(item.icao),
      iata: text(item.iata),
      country: text(item.country),
      countryIso: text(item.country_iso),
      callsign: text(item.callsign),
    }));
  }
}

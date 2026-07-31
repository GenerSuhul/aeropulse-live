import { Aircraft } from '../models/aircraft.model';
import { AdsbLolAircraftDto, AdsbLolResponseDto } from './adsb-lol-aircraft.dto';

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
}

function normalizeHeading(value: unknown): number | null {
  const heading = finiteNumber(value);
  if (heading === null) return null;
  const normalized = ((heading % 360) + 360) % 360;
  return Math.round(normalized * 100) / 100;
}

export class AdsbLolAircraftAdapter {
  static toDomain(dto: AdsbLolAircraftDto): Aircraft {
    const isOnGround = typeof dto.alt_baro === 'string' && dto.alt_baro.toLowerCase() === 'ground';
    const barometricAltitude = finiteNumber(dto.alt_baro);
    return {
      id: dto.hex.toLowerCase(),
      icao24: dto.hex.toUpperCase(),
      callsign: cleanText(dto.flight),
      registration: cleanText(dto.r),
      aircraftType: cleanText(dto.t),
      description: null,
      operator: null,
      latitude: finiteNumber(dto.lat),
      longitude: finiteNumber(dto.lon),
      altitudeFeet: isOnGround ? 0 : barometricAltitude ?? finiteNumber(dto.alt_geom),
      groundSpeedKnots: finiteNumber(dto.gs),
      headingDegrees: normalizeHeading(dto.track ?? dto.true_heading),
      verticalRateFeetPerMinute: finiteNumber(dto.baro_rate) ?? finiteNumber(dto.geom_rate),
      squawk: cleanText(dto.squawk),
      category: cleanText(dto.category),
      isOnGround,
      emergency: cleanText(dto.emergency),
      secondsSinceLastMessage: finiteNumber(dto.seen),
      secondsSinceLastPosition: finiteNumber(dto.seen_pos),
    };
  }

  static fromResponse(response: AdsbLolResponseDto): readonly Aircraft[] {
    return response.ac.map((aircraft) => this.toDomain(aircraft));
  }

  static withCoordinates(aircraft: readonly Aircraft[]): readonly Aircraft[] {
    return aircraft.filter((item) => item.latitude !== null && item.longitude !== null);
  }
}

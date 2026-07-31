import { Aircraft } from '../models/aircraft.model';
import { OpenSkyResponseDto, OpenSkyStateVectorDto } from './opensky-aircraft.dto';

const METERS_TO_FEET = 3.28084;
const METERS_PER_SECOND_TO_KNOTS = 1.94384;
const METERS_PER_SECOND_TO_FEET_PER_MINUTE = 196.8504;

function finite(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function converted(value: number | null | undefined, factor: number): number | null {
  const number = finite(value);
  return number === null ? null : Math.round(number * factor);
}

function text(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? '';
  return normalized.length > 0 ? normalized : null;
}

export class OpenSkyAircraftAdapter {
  static toDomain(dto: OpenSkyStateVectorDto, responseTime: number): Aircraft {
    const heading = finite(dto[10]);
    return {
      id: dto[0].toLowerCase(), icao24: dto[0].toUpperCase(), callsign: text(dto[1]), registration: null,
      aircraftType: null, description: null, operator: null, originCountry: text(dto[2]),
      longitude: finite(dto[5]), latitude: finite(dto[6]),
      altitudeFeet: dto[8] ? 0 : converted(dto[7] ?? dto[13], METERS_TO_FEET),
      groundSpeedKnots: converted(dto[9], METERS_PER_SECOND_TO_KNOTS),
      headingDegrees: heading === null ? null : Math.round((((heading % 360) + 360) % 360) * 100) / 100,
      verticalRateFeetPerMinute: converted(dto[11], METERS_PER_SECOND_TO_FEET_PER_MINUTE),
      squawk: text(dto[14]), category: dto[17] === undefined ? null : String(dto[17]), isOnGround: dto[8], emergency: null,
      secondsSinceLastMessage: Math.max(0, responseTime - dto[4]),
      secondsSinceLastPosition: dto[3] === null ? null : Math.max(0, responseTime - dto[3]),
    };
  }

  static fromResponse(response: OpenSkyResponseDto): readonly Aircraft[] {
    return (response.states ?? []).map((state) => this.toDomain(state, response.time));
  }
}

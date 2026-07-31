import { Aircraft } from '../models/aircraft.model';
import { AirplanesLiveAircraftDto, AirplanesLiveResponseDto } from './airplanes-live.dto';

export class AirplanesLiveAircraftAdapter {
  static toDomain(dto: AirplanesLiveAircraftDto): Aircraft | null {
    const icao24 = this.text(dto.hex)?.toLowerCase();
    if (!icao24) return null;
    const ground = dto.alt_baro === 'ground';
    return {
      id: icao24,
      icao24,
      callsign: this.text(dto.flight),
      registration: this.text(dto.r),
      aircraftType: this.text(dto.t),
      description: this.text(dto.desc),
      operator: this.text(dto.ownOp),
      originCountry: null,
      latitude: this.number(dto.lat),
      longitude: this.number(dto.lon),
      altitudeFeet: ground ? 0 : this.number(dto.alt_baro) ?? this.number(dto.alt_geom),
      groundSpeedKnots: this.number(dto.gs),
      headingDegrees: this.number(dto.track) ?? this.number(dto.true_heading) ?? this.number(dto.mag_heading),
      verticalRateFeetPerMinute: this.number(dto.baro_rate) ?? this.number(dto.geom_rate),
      squawk: this.text(dto.squawk),
      category: this.text(dto.category),
      isOnGround: ground,
      emergency: this.text(dto.emergency),
      secondsSinceLastMessage: this.number(dto.seen),
      secondsSinceLastPosition: this.number(dto.seen_pos),
    };
  }

  static fromResponse(response: AirplanesLiveResponseDto): readonly Aircraft[] {
    return (response.ac ?? []).map((item) => this.toDomain(item)).filter((item): item is Aircraft => item !== null);
  }

  private static text(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private static number(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }
}

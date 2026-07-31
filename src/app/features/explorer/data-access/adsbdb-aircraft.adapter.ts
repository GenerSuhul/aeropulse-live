import { AircraftDetails } from '../models/aircraft-details.model';
import { AdsbdbAircraftDto, AdsbdbAircraftResponseDto, AdsbdbResponseDto } from './adsbdb.dto';

function text(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export class AdsbdbAircraftAdapter {
  static fromResponse(response: AdsbdbResponseDto<AdsbdbAircraftResponseDto>): AircraftDetails | null {
    if (typeof response.response === 'string' || !response.response) return null;
    const aircraft = response.response.aircraft;
    if (typeof aircraft !== 'object' || aircraft === null) return null;
    const details = aircraft as AdsbdbAircraftDto;
    return {
      type: text(details.type),
      icaoType: text(details.icao_type),
      manufacturer: text(details.manufacturer),
      modeS: text(details.mode_s),
      registration: text(details.registration),
      ownerCountryIso: text(details.registered_owner_country_iso_name),
      ownerCountryName: text(details.registered_owner_country_name),
      operatorFlagCode: text(details.registered_owner_operator_flag_code),
      registeredOwner: text(details.registered_owner),
      photoUrl: text(details.url_photo),
      photoThumbnailUrl: text(details.url_photo_thumbnail),
    };
  }
}

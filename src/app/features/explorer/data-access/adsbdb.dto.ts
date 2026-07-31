export interface AdsbdbResponseDto<T> {
  readonly response?: T | string;
}

export interface AdsbdbAircraftResponseDto {
  readonly aircraft?: unknown;
}

export interface AdsbdbCallsignResponseDto {
  readonly flightroute?: unknown;
}

export interface AdsbdbAircraftDto {
  readonly type?: unknown;
  readonly icao_type?: unknown;
  readonly manufacturer?: unknown;
  readonly mode_s?: unknown;
  readonly registration?: unknown;
  readonly registered_owner_country_iso_name?: unknown;
  readonly registered_owner_country_name?: unknown;
  readonly registered_owner_operator_flag_code?: unknown;
  readonly registered_owner?: unknown;
  readonly url_photo?: unknown;
  readonly url_photo_thumbnail?: unknown;
}

export interface AdsbdbAirlineDto {
  readonly name?: unknown;
  readonly icao?: unknown;
  readonly iata?: unknown;
  readonly country?: unknown;
  readonly country_iso?: unknown;
  readonly callsign?: unknown;
}

export interface AdsbdbAirportDto {
  readonly country_iso_name?: unknown;
  readonly country_name?: unknown;
  readonly elevation?: unknown;
  readonly iata_code?: unknown;
  readonly icao_code?: unknown;
  readonly latitude?: unknown;
  readonly longitude?: unknown;
  readonly municipality?: unknown;
  readonly name?: unknown;
}

export interface AdsbdbFlightRouteDto {
  readonly callsign?: unknown;
  readonly callsign_icao?: unknown;
  readonly callsign_iata?: unknown;
  readonly airline?: unknown;
  readonly origin?: unknown;
  readonly destination?: unknown;
}

export interface AdsbdbOnlineDto {
  readonly uptime?: unknown;
  readonly api_version?: unknown;
}

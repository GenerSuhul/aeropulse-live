export interface Airline {
  readonly name: string | null;
  readonly icao: string | null;
  readonly iata: string | null;
  readonly country: string | null;
  readonly countryIso: string | null;
  readonly callsign: string | null;
}

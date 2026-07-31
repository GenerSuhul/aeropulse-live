export interface Airport {
  readonly name: string | null;
  readonly icaoCode: string | null;
  readonly iataCode: string | null;
  readonly municipality: string | null;
  readonly countryName: string | null;
  readonly countryIsoName: string | null;
  readonly elevation: number | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
}

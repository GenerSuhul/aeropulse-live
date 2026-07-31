export interface Aircraft {
  readonly id: string;
  readonly icao24: string;
  readonly callsign: string | null;
  readonly registration: string | null;
  readonly aircraftType: string | null;
  readonly description: string | null;
  readonly operator: string | null;
  readonly originCountry: string | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly altitudeFeet: number | null;
  readonly groundSpeedKnots: number | null;
  readonly headingDegrees: number | null;
  readonly verticalRateFeetPerMinute: number | null;
  readonly squawk: string | null;
  readonly category: string | null;
  readonly isOnGround: boolean;
  readonly emergency: string | null;
  readonly secondsSinceLastMessage: number | null;
  readonly secondsSinceLastPosition: number | null;
}

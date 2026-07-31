export type OpenSkyStateVectorDto = readonly [
  icao24: string,
  callsign: string | null,
  originCountry: string,
  timePosition: number | null,
  lastContact: number,
  longitude: number | null,
  latitude: number | null,
  barometricAltitudeMeters: number | null,
  onGround: boolean,
  velocityMetersPerSecond: number | null,
  trueTrackDegrees: number | null,
  verticalRateMetersPerSecond: number | null,
  sensors: readonly number[] | null,
  geometricAltitudeMeters: number | null,
  squawk: string | null,
  spi: boolean,
  positionSource: number,
  category?: number,
];

export interface OpenSkyResponseDto {
  readonly time: number;
  readonly states: readonly OpenSkyStateVectorDto[] | null;
}

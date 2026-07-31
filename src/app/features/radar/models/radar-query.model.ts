export interface RadarQuery {
  readonly latitude: number;
  readonly longitude: number;
  readonly radiusNm: number;
}

export function isValidRadarQuery(query: RadarQuery): boolean {
  return Number.isFinite(query.latitude) && query.latitude >= -90 && query.latitude <= 90
    && Number.isFinite(query.longitude) && query.longitude >= -180 && query.longitude <= 180
    && Number.isFinite(query.radiusNm) && query.radiusNm > 0 && query.radiusNm <= 250;
}

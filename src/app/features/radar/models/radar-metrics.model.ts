import { Aircraft } from './aircraft.model';

export interface RadarMetrics {
  readonly totalAircraft: number;
  readonly airborneAircraft: number;
  readonly onGroundAircraft: number;
  readonly averageAltitude: number | null;
  readonly averageSpeed: number | null;
}

function average(values: readonly number[]): number | null {
  return values.length === 0 ? null : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function calculateRadarMetrics(aircraft: readonly Aircraft[]): RadarMetrics {
  const onGroundAircraft = aircraft.filter((item) => item.isOnGround).length;
  return {
    totalAircraft: aircraft.length,
    airborneAircraft: aircraft.length - onGroundAircraft,
    onGroundAircraft,
    averageAltitude: average(aircraft.filter((item) => !item.isOnGround && item.altitudeFeet !== null).map((item) => item.altitudeFeet as number)),
    averageSpeed: average(aircraft.filter((item) => item.groundSpeedKnots !== null).map((item) => item.groundSpeedKnots as number)),
  };
}

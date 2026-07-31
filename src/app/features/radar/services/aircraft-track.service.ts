import { Injectable, signal } from '@angular/core';
import { Aircraft } from '../models/aircraft.model';

export type TrackCoordinate = readonly [longitude: number, latitude: number];

@Injectable()
export class AircraftTrackService {
  private readonly maxPoints = 120;
  private selectedId: string | null = null;
  private readonly pointsState = signal<readonly TrackCoordinate[]>([]);
  readonly points = this.pointsState.asReadonly();

  select(aircraftId: string | null): void {
    if (this.selectedId !== aircraftId) {
      this.selectedId = aircraftId;
      this.pointsState.set([]);
    }
  }

  append(aircraft: Aircraft): void {
    if (aircraft.id !== this.selectedId || aircraft.latitude === null || aircraft.longitude === null) return;
    const point: TrackCoordinate = [aircraft.longitude, aircraft.latitude];
    this.pointsState.update((points) => {
      const last = points.at(-1);
      if (last?.[0] === point[0] && last[1] === point[1]) return points;
      return [...points, point].slice(-this.maxPoints);
    });
  }

  clear(): void { this.pointsState.set([]); }
}

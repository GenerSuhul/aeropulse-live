import { Injectable, signal } from '@angular/core';
import { Aircraft } from '../features/radar/models/aircraft.model';

@Injectable({ providedIn: 'root' })
export class AircraftSelectionService {
  private readonly selectedState = signal<Aircraft | null>(null);
  readonly selectedAircraft = this.selectedState.asReadonly();

  select(aircraft: Aircraft): void { this.selectedState.set(aircraft); }
  clear(): void { this.selectedState.set(null); }
}

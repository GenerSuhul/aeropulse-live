import { InjectionToken } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { RadarQuery } from '../models/radar-query.model';

export interface RadarApiConfig {
  readonly apiBaseUrl: string;
  readonly mapStyleUrl: string;
  readonly defaultQuery: RadarQuery;
  readonly pollIntervalMs: number;
  readonly useMockProvider: boolean;
}

export const RADAR_API_CONFIG = new InjectionToken<RadarApiConfig>('RADAR_API_CONFIG', {
  factory: () => environment.radar,
});

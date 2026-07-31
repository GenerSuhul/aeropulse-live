import { InjectionToken } from '@angular/core';
import { environment } from '../../../../environments/environment';

export interface RadarApiConfig {
  readonly apiBaseUrl: string;
  readonly metadataApiBaseUrl: string;
  readonly mapTileUrls: readonly string[];
  readonly defaultAreaId: string;
  readonly pollIntervalMs: number;
}

export const RADAR_API_CONFIG = new InjectionToken<RadarApiConfig>('RADAR_API_CONFIG', {
  factory: () => environment.radar,
});

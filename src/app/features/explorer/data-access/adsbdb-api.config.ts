import { InjectionToken } from '@angular/core';
import { environment } from '../../../../environments/environment';

export interface AdsbdbApiConfig {
  readonly adsbdbApiBaseUrl: string;
  readonly cacheTtlMs: number;
  readonly timeoutMs: number;
}

export const ADSBDB_API_CONFIG = new InjectionToken<AdsbdbApiConfig>('ADSBDB_API_CONFIG', {
  factory: () => environment.explorer,
});

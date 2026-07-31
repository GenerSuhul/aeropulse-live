import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, timeout } from 'rxjs';
import { AircraftMetadata } from '../models/aircraft-metadata.model';
import { AirplanesLiveAircraftDto, AirplanesLiveResponseDto } from './airplanes-live.dto';
import { RADAR_API_CONFIG } from './radar-api.config';

@Injectable({ providedIn: 'root' })
export class AircraftMetadataService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(RADAR_API_CONFIG);
  private readonly cache = new Map<string, Observable<AircraftMetadata | null>>();

  get(icao24: string): Observable<AircraftMetadata | null> {
    const key = icao24.trim().toLowerCase();
    const cached = this.cache.get(key);
    if (cached) return cached;
    const request = this.http.get<AirplanesLiveResponseDto>(`${this.config.metadataApiBaseUrl}/icao/${encodeURIComponent(key)}`).pipe(
      timeout(5_000),
      map((response) => response.ac?.[0] ? this.toMetadata(response.ac[0]) : null),
      catchError(() => of(null)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.cache.set(key, request);
    return request;
  }

  private toMetadata(dto: AirplanesLiveAircraftDto): AircraftMetadata {
    return {
      registration: this.text(dto.r),
      aircraftType: this.text(dto.t),
      description: this.text(dto.desc),
      operator: this.text(dto.ownOp),
      year: this.text(dto.year),
    };
  }

  private text(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }
}

import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, concatMap, defer, from, map, Observable, of, switchMap, tap, throwError, timeout, timer, toArray } from 'rxjs';
import { Aircraft } from '../models/aircraft.model';
import { GeographicArea } from '../models/geographic-area.model';
import { RadarError } from '../models/radar-error.model';
import { AircraftDataProvider } from '../services/aircraft-data-provider';
import { AirplanesLiveAircraftAdapter } from './airplanes-live-aircraft.adapter';
import { AirplanesLiveResponseDto } from './airplanes-live.dto';
import { OpenSkyAircraftAdapter } from './opensky-aircraft.adapter';
import { OpenSkyResponseDto } from './opensky-aircraft.dto';
import { RADAR_API_CONFIG } from './radar-api.config';

interface CoveragePoint { readonly latitude: number; readonly longitude: number; }

const ALTERNATIVE_COVERAGE: Readonly<Record<string, readonly CoveragePoint[]>> = {
  world: [
    { latitude: 40.7, longitude: -74 }, { latitude: 33.9, longitude: -118.2 }, { latitude: 51.5, longitude: -0.1 },
    { latitude: 25.2, longitude: 55.3 }, { latitude: 1.3, longitude: 103.8 }, { latitude: 35.7, longitude: 139.7 },
    { latitude: -23.5, longitude: -46.6 }, { latitude: -26.2, longitude: 28 }, { latitude: -33.9, longitude: 151.2 },
  ],
  'north-america': [
    { latitude: 49.2, longitude: -123.1 }, { latitude: 34.1, longitude: -118.2 }, { latitude: 39.7, longitude: -104.9 },
    { latitude: 32.8, longitude: -96.8 }, { latitude: 41.9, longitude: -87.6 }, { latitude: 33.7, longitude: -84.4 },
    { latitude: 40.7, longitude: -74 }, { latitude: 43.7, longitude: -79.4 }, { latitude: 19.4, longitude: -99.1 },
  ],
  'central-america': [
    { latitude: 15.8, longitude: -90.2 }, { latitude: 21.2, longitude: -86.8 }, { latitude: 18, longitude: -76.8 },
    { latitude: 9, longitude: -79.5 }, { latitude: 18.5, longitude: -66.1 },
  ],
  'south-america': [
    { latitude: 4.7, longitude: -74.1 }, { latitude: -12, longitude: -77 }, { latitude: -23.5, longitude: -46.6 },
    { latitude: -15.8, longitude: -47.9 }, { latitude: -33.4, longitude: -70.7 }, { latitude: -34.6, longitude: -58.4 },
  ],
  europe: [
    { latitude: 51.5, longitude: -0.1 }, { latitude: 48.9, longitude: 2.4 }, { latitude: 40.4, longitude: -3.7 },
    { latitude: 50.1, longitude: 8.7 }, { latitude: 41.9, longitude: 12.5 }, { latitude: 52.2, longitude: 21 },
    { latitude: 41, longitude: 29 }, { latitude: 59.9, longitude: 10.8 },
  ],
  africa: [
    { latitude: 30, longitude: 31.2 }, { latitude: 33.6, longitude: -7.6 }, { latitude: 6.5, longitude: 3.4 },
    { latitude: 9, longitude: 38.8 }, { latitude: -1.3, longitude: 36.8 }, { latitude: -26.2, longitude: 28 },
  ],
  asia: [
    { latitude: 25.2, longitude: 55.3 }, { latitude: 28.6, longitude: 77.2 }, { latitude: 13.8, longitude: 100.5 },
    { latitude: 1.3, longitude: 103.8 }, { latitude: 39.9, longitude: 116.4 }, { latitude: 35.7, longitude: 139.7 },
    { latitude: 37.6, longitude: 127 },
  ],
  oceania: [
    { latitude: -31.9, longitude: 115.9 }, { latitude: -34.9, longitude: 138.6 }, { latitude: -37.8, longitude: 145 },
    { latitude: -33.9, longitude: 151.2 }, { latitude: -27.5, longitude: 153 }, { latitude: -36.9, longitude: 174.8 },
  ],
};

@Injectable()
export class OpenSkyAircraftProvider implements AircraftDataProvider {
  private readonly http = inject(HttpClient);
  private readonly config = inject(RADAR_API_CONFIG);
  private readonly sourceState = signal('OpenSky Network · datos reales');
  private openSkyBlockedUntil = 0;
  private lastAlternativeRequestAt = 0;
  readonly source = this.sourceState.asReadonly();

  getAircraft(area: GeographicArea): Observable<readonly Aircraft[]> {
    if (Date.now() < this.openSkyBlockedUntil) return this.getAlternativeAircraft(area);
    return this.getOpenSkyAircraft(area).pipe(
      catchError((error: unknown) => {
        this.rememberRateLimit(error);
        return this.getAlternativeAircraft(area).pipe(
          catchError(() => throwError(() => this.normalizeError(error))),
        );
      }),
    );
  }

  private getOpenSkyAircraft(area: GeographicArea): Observable<readonly Aircraft[]> {
    let params = new HttpParams().set('extended', 1);
    if (area.bounds) {
      params = params.set('lamin', area.bounds.south).set('lomin', area.bounds.west).set('lamax', area.bounds.north).set('lomax', area.bounds.east);
    }
    return this.http.get<OpenSkyResponseDto>(`${this.config.apiBaseUrl}/states/all`, { params }).pipe(
      timeout(20_000),
      map((response) => OpenSkyAircraftAdapter.fromResponse(response)),
      tap(() => this.sourceState.set('OpenSky Network · datos reales')),
    );
  }

  private getAlternativeAircraft(area: GeographicArea): Observable<readonly Aircraft[]> {
    const points = this.coveragePoints(area);
    return from(points).pipe(
      concatMap((point) => this.getAlternativePoint(point)),
      toArray(),
      map((responses) => {
        if (responses.every((response) => response === null)) throw new Error('Alternative ADS-B provider unavailable');
        const unique = new Map<string, Aircraft>();
        for (const response of responses) {
          for (const aircraft of response ?? []) {
            if (this.insideArea(aircraft, area)) unique.set(aircraft.id, aircraft);
          }
        }
        return [...unique.values()];
      }),
      tap(() => this.sourceState.set('Airplanes.live · respaldo ADS-B real')),
    );
  }

  private getAlternativePoint(point: CoveragePoint): Observable<readonly Aircraft[] | null> {
    return defer(() => {
      const waitMs = Math.max(0, 1_050 - (Date.now() - this.lastAlternativeRequestAt));
      return timer(waitMs).pipe(
        switchMap(() => {
          this.lastAlternativeRequestAt = Date.now();
          const url = `${this.config.metadataApiBaseUrl}/point/${point.latitude}/${point.longitude}/250`;
          return this.http.get<AirplanesLiveResponseDto>(url).pipe(
            timeout(10_000),
            map((response) => AirplanesLiveAircraftAdapter.fromResponse(response)),
            catchError(() => of(null)),
          );
        }),
      );
    });
  }

  private coveragePoints(area: GeographicArea): readonly CoveragePoint[] {
    const curated = ALTERNATIVE_COVERAGE[area.id];
    if (curated) return curated;
    if (!area.bounds) return ALTERNATIVE_COVERAGE['world'];
    const latitudeSpan = area.bounds.north - area.bounds.south;
    const longitudeSpan = area.bounds.east - area.bounds.west;
    const rows = Math.min(3, Math.max(1, Math.ceil(latitudeSpan / 8)));
    const columns = Math.min(3, Math.max(1, Math.ceil(longitudeSpan / 8)));
    const points: CoveragePoint[] = [];
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        points.push({
          latitude: area.bounds.south + latitudeSpan * ((row + 0.5) / rows),
          longitude: area.bounds.west + longitudeSpan * ((column + 0.5) / columns),
        });
      }
    }
    return points;
  }

  private insideArea(aircraft: Aircraft, area: GeographicArea): boolean {
    if (!area.bounds) return true;
    if (aircraft.latitude === null || aircraft.longitude === null) return false;
    return aircraft.latitude >= area.bounds.south && aircraft.latitude <= area.bounds.north
      && aircraft.longitude >= area.bounds.west && aircraft.longitude <= area.bounds.east;
  }

  private rememberRateLimit(error: unknown): void {
    if (!(error instanceof HttpErrorResponse) || error.status !== 429) return;
    const seconds = Number(error.headers.get('X-Rate-Limit-Retry-After-Seconds') ?? error.headers.get('Retry-After'));
    const cooldownMs = Number.isFinite(seconds) && seconds > 0 ? seconds * 1_000 : 10 * 60_000;
    this.openSkyBlockedUntil = Date.now() + cooldownMs;
  }

  private normalizeError(error: unknown): RadarError {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return { kind: 'network', message: 'No fue posible conectar con OpenSky Network.' };
      if (error.status === 429) return { kind: 'rate-limit', message: 'Las fuentes ADS-B alcanzaron temporalmente su límite de consultas.' };
      return { kind: 'unknown', message: 'OpenSky no pudo completar la consulta de tráfico.' };
    }
    if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'TimeoutError') return { kind: 'timeout', message: 'La consulta mundial tardó demasiado tiempo.' };
    return { kind: 'unknown', message: 'No fue posible actualizar el tráfico aéreo real.' };
  }
}

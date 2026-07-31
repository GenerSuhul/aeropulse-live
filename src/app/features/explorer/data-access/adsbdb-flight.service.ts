import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, throwError, timeout } from 'rxjs';
import { AircraftDetails } from '../models/aircraft-details.model';
import { Airline } from '../models/airline.model';
import { ExplorerError } from '../models/explorer-error.model';
import { FlightRoute } from '../models/flight-route.model';
import { ADSBDB_API_CONFIG } from './adsbdb-api.config';
import { AdsbdbAircraftAdapter } from './adsbdb-aircraft.adapter';
import { AdsbdbAirlineAdapter } from './adsbdb-airline.adapter';
import { AdsbdbCallsignAdapter } from './adsbdb-callsign.adapter';
import { AdsbdbAircraftResponseDto, AdsbdbAirlineDto, AdsbdbCallsignResponseDto, AdsbdbOnlineDto, AdsbdbResponseDto } from './adsbdb.dto';

interface CacheEntry {
  readonly expiresAt: number;
  readonly observable: Observable<unknown>;
}

@Injectable()
export class AdsbdbFlightService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ADSBDB_API_CONFIG);
  private readonly cache = new Map<string, CacheEntry>();

  getFlightRoute(callsign: string): Observable<FlightRoute | null> {
    return this.cached(`callsign:${callsign}`, () => {
      const url = `${this.config.adsbdbApiBaseUrl}/callsign/${encodeURIComponent(callsign)}`;
      return this.http.get<AdsbdbResponseDto<AdsbdbCallsignResponseDto>>(url).pipe(
        timeout(this.config.timeoutMs),
        map((response) => AdsbdbCallsignAdapter.fromResponse(response)),
        catchError(this.handleError<FlightRoute | null>(null)),
      );
    });
  }

  getAircraft(id: string): Observable<AircraftDetails | null> {
    return this.cached(`aircraft:${id}`, () => {
      const url = `${this.config.adsbdbApiBaseUrl}/aircraft/${encodeURIComponent(id)}`;
      return this.http.get<AdsbdbResponseDto<AdsbdbAircraftResponseDto>>(url).pipe(
        timeout(this.config.timeoutMs),
        map((response) => AdsbdbAircraftAdapter.fromResponse(response)),
        catchError(this.handleError<AircraftDetails | null>(null)),
      );
    });
  }

  getAirline(code: string): Observable<readonly Airline[]> {
    return this.cached(`airline:${code}`, () => {
      const url = `${this.config.adsbdbApiBaseUrl}/airline/${encodeURIComponent(code)}`;
      return this.http.get<AdsbdbResponseDto<readonly AdsbdbAirlineDto[]>>(url).pipe(
        timeout(this.config.timeoutMs),
        map((response) => AdsbdbAirlineAdapter.fromResponse(response)),
        catchError(this.handleError<readonly Airline[]>([])),
      );
    });
  }

  getOnline(): Observable<boolean> {
    const url = `${this.config.adsbdbApiBaseUrl}/online`;
    return this.http.get<AdsbdbResponseDto<AdsbdbOnlineDto>>(url).pipe(
      timeout(this.config.timeoutMs),
      map((response) => typeof response.response === 'object' && response.response !== null),
      catchError(() => of(false)),
    );
  }

  private cached<T>(key: string, request: () => Observable<T>): Observable<T> {
    const existing = this.cache.get(key);
    if (existing && existing.expiresAt > Date.now()) return existing.observable as Observable<T>;
    const observable = request().pipe(shareReplay({ bufferSize: 1, refCount: false }));
    this.cache.set(key, { expiresAt: Date.now() + this.config.cacheTtlMs, observable: observable as Observable<unknown> });
    return observable;
  }

  private handleError<T>(fallback: T): (error: unknown) => Observable<T> {
    return (error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 404) return of(fallback);
      return throwError(() => this.normalizeError(error));
    };
  }

  private normalizeError(error: unknown): ExplorerError {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return { kind: 'network', message: 'No fue posible conectar con ADSBDB.' };
      if (error.status === 429) return { kind: 'rate-limit', message: 'ADSBDB alcanzó temporalmente su límite de consultas. Espera un momento y reintenta.' };
      if (error.status === 400) return { kind: 'invalid-query', message: 'El formato de la consulta no es válido para ADSBDB.' };
      return { kind: 'unknown', message: 'ADSBDB no pudo completar la consulta.' };
    }
    if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'TimeoutError') {
      return { kind: 'timeout', message: 'ADSBDB tardó demasiado en responder.' };
    }
    return { kind: 'unknown', message: 'No fue posible consultar ADSBDB.' };
  }
}

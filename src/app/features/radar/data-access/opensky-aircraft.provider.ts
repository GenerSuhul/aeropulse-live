import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError, timeout } from 'rxjs';
import { Aircraft } from '../models/aircraft.model';
import { GeographicArea } from '../models/geographic-area.model';
import { RadarError } from '../models/radar-error.model';
import { AircraftDataProvider } from '../services/aircraft-data-provider';
import { OpenSkyAircraftAdapter } from './opensky-aircraft.adapter';
import { OpenSkyResponseDto } from './opensky-aircraft.dto';
import { RADAR_API_CONFIG } from './radar-api.config';

@Injectable()
export class OpenSkyAircraftProvider implements AircraftDataProvider {
  private readonly http = inject(HttpClient);
  private readonly config = inject(RADAR_API_CONFIG);

  getAircraft(area: GeographicArea): Observable<readonly Aircraft[]> {
    let params = new HttpParams().set('extended', 1);
    if (area.bounds) {
      params = params.set('lamin', area.bounds.south).set('lomin', area.bounds.west).set('lamax', area.bounds.north).set('lomax', area.bounds.east);
    }
    return this.http.get<OpenSkyResponseDto>(`${this.config.apiBaseUrl}/states/all`, { params }).pipe(
      timeout(20_000),
      map((response) => OpenSkyAircraftAdapter.fromResponse(response)),
      catchError((error: unknown) => throwError(() => this.normalizeError(error))),
    );
  }

  private normalizeError(error: unknown): RadarError {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return { kind: 'network', message: 'No fue posible conectar con OpenSky Network.' };
      if (error.status === 429) return { kind: 'rate-limit', message: 'OpenSky alcanzó temporalmente el límite de consultas. Espera antes de actualizar.' };
      return { kind: 'unknown', message: 'OpenSky no pudo completar la consulta de tráfico.' };
    }
    if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'TimeoutError') return { kind: 'timeout', message: 'La consulta mundial tardó demasiado tiempo.' };
    return { kind: 'unknown', message: 'No fue posible actualizar el tráfico aéreo real.' };
  }
}

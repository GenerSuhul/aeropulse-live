import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError, timeout } from 'rxjs';
import { Aircraft } from '../models/aircraft.model';
import { RadarError } from '../models/radar-error.model';
import { isValidRadarQuery, RadarQuery } from '../models/radar-query.model';
import { AircraftDataProvider } from '../services/aircraft-data-provider';
import { AdsbLolAircraftAdapter } from './adsb-lol-aircraft.adapter';
import { AdsbLolResponseDto } from './adsb-lol-aircraft.dto';
import { RADAR_API_CONFIG } from './radar-api.config';

@Injectable()
export class AdsbLolAircraftProvider implements AircraftDataProvider {
  private readonly http = inject(HttpClient);
  private readonly config = inject(RADAR_API_CONFIG);

  getAircraft(query: RadarQuery): Observable<readonly Aircraft[]> {
    if (!isValidRadarQuery(query)) {
      return throwError(() => ({ kind: 'invalid-query', message: 'Las coordenadas o el radio no son válidos.' } satisfies RadarError));
    }
    const url = `${this.config.apiBaseUrl}/v2/lat/${query.latitude}/lon/${query.longitude}/dist/${query.radiusNm}`;
    return this.http.get<AdsbLolResponseDto>(url).pipe(
      timeout(10_000),
      map((response) => {
        if (!Array.isArray(response.ac)) throw { kind: 'invalid-response', message: 'El proveedor devolvió una respuesta no válida.' } satisfies RadarError;
        return AdsbLolAircraftAdapter.fromResponse(response);
      }),
      catchError((error: unknown) => throwError(() => this.toRadarError(error))),
    );
  }

  private toRadarError(error: unknown): RadarError {
    if (this.isRadarError(error)) return error;
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return { kind: 'network', message: 'No fue posible conectar con ADSB.lol.' };
      if (error.status === 429) return { kind: 'rate-limit', message: 'El proveedor limitó temporalmente las consultas.' };
      return { kind: 'unknown', message: 'ADSB.lol no pudo completar la consulta.' };
    }
    if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'TimeoutError') {
      return { kind: 'timeout', message: 'La consulta tardó demasiado tiempo.' };
    }
    return { kind: 'unknown', message: 'Ocurrió un error inesperado al consultar el radar.' };
  }

  private isRadarError(error: unknown): error is RadarError {
    return typeof error === 'object' && error !== null && 'kind' in error && 'message' in error;
  }
}

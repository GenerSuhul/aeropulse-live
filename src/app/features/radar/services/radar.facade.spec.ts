import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AircraftSelectionService } from '../../../core/aircraft-selection.service';
import { AdsbLolAircraftProvider } from '../data-access/adsb-lol-aircraft.provider';
import { MockAircraftProvider } from '../data-access/mock-aircraft.provider';
import { RADAR_API_CONFIG, RadarApiConfig } from '../data-access/radar-api.config';
import { Aircraft } from '../models/aircraft.model';
import { RadarError } from '../models/radar-error.model';
import { AircraftTrackService } from './aircraft-track.service';
import { RadarFacade } from './radar.facade';

const aircraft: Aircraft = { id: 'abc123', icao24: 'ABC123', callsign: 'TEST01', registration: null, aircraftType: null, description: null, operator: null, latitude: 16, longitude: -89, altitudeFeet: 12_000, groundSpeedKnots: 250, headingDegrees: 90, verticalRateFeetPerMinute: 0, squawk: null, category: null, isOnGround: false, emergency: 'none', secondsSinceLastMessage: 0, secondsSinceLastPosition: 0 };
const config: RadarApiConfig = { apiBaseUrl: 'https://example.test', mapStyleUrl: 'style', defaultQuery: { latitude: 16, longitude: -89, radiusNm: 100 }, pollIntervalMs: 12_000, useMockProvider: false };

describe('RadarFacade', () => {
  let result$: Observable<readonly Aircraft[]>;
  afterEach(() => { vi.useRealTimers(); TestBed.resetTestingModule(); });

  function createFacade(): RadarFacade {
    result$ = of([aircraft]);
    const provider = { getAircraft: (): Observable<readonly Aircraft[]> => result$ };
    TestBed.configureTestingModule({ providers: [RadarFacade, AircraftTrackService, AircraftSelectionService, { provide: RADAR_API_CONFIG, useValue: config }, { provide: AdsbLolAircraftProvider, useValue: provider }, { provide: MockAircraftProvider, useValue: provider }] });
    return TestBed.inject(RadarFacade);
  }

  it('expone métricas derivadas y conserva la selección desaparecida', () => {
    const facade = createFacade(); facade.setAutoRefresh(false); facade.selectAircraft('abc123');
    expect(facade.metrics().totalAircraft).toBe(1); expect(facade.selectedAircraft()?.callsign).toBe('TEST01');
    result$ = of([]); facade.refreshNow();
    expect(facade.selectedAircraftMissing()).toBe(true); expect(facade.selectedAircraft()?.id).toBe('abc123');
  });

  it('expone un error tipado después de reintentos limitados', async () => {
    vi.useFakeTimers();
    const facade = createFacade(); facade.setAutoRefresh(false);
    const error: RadarError = { kind: 'network', message: 'Sin red' }; result$ = throwError(() => error); facade.refreshNow(); await vi.advanceTimersByTimeAsync(2_000);
    expect(facade.error()).toEqual(error); expect(facade.loading()).toBe(false);
  });
});

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AircraftSelectionService } from '../../../core/aircraft-selection.service';
import { RADAR_API_CONFIG, RadarApiConfig } from '../data-access/radar-api.config';
import { Aircraft } from '../models/aircraft.model';
import { RadarError } from '../models/radar-error.model';
import { AIRCRAFT_DATA_PROVIDER } from './aircraft-data-provider.token';
import { AircraftTrackService } from './aircraft-track.service';
import { RadarFacade } from './radar.facade';

const aircraft: Aircraft = { id: 'abc123', icao24: 'ABC123', callsign: 'TEST01', registration: null, aircraftType: null, description: null, operator: null, originCountry: 'Guatemala', latitude: 16, longitude: -89, altitudeFeet: 12_000, groundSpeedKnots: 250, headingDegrees: 90, verticalRateFeetPerMinute: 0, squawk: null, category: null, isOnGround: false, emergency: null, secondsSinceLastMessage: 0, secondsSinceLastPosition: 0 };
const config: RadarApiConfig = { apiBaseUrl: '/opensky-api', metadataApiBaseUrl: 'https://api.airplanes.live/v2', mapTileUrls: ['tiles'], defaultAreaId: 'world', pollIntervalMs: 15_000 };

describe('RadarFacade', () => {
  let result$: Observable<readonly Aircraft[]>;
  afterEach(() => { vi.useRealTimers(); TestBed.resetTestingModule(); });

  function createFacade(): RadarFacade {
    result$ = of([aircraft]);
    const provider = { source: signal('OpenSky Network · datos reales'), getAircraft: (): Observable<readonly Aircraft[]> => result$ };
    TestBed.configureTestingModule({ providers: [RadarFacade, AircraftTrackService, AircraftSelectionService, { provide: RADAR_API_CONFIG, useValue: config }, { provide: AIRCRAFT_DATA_PROVIDER, useValue: provider }] });
    return TestBed.inject(RadarFacade);
  }

  it('carga el mundo por defecto y permite cambiar a un país', () => {
    const facade = createFacade(); facade.setAutoRefresh(false);
    expect(facade.area().id).toBe('world'); expect(facade.metrics().totalAircraft).toBe(1);
    facade.setArea('guatemala'); expect(facade.area().name).toBe('Guatemala');
  });

  it('conserva el último dato cuando una aeronave desaparece', () => {
    const facade = createFacade(); facade.setAutoRefresh(false); facade.selectAircraft('abc123');
    result$ = of([]); facade.refreshNow();
    expect(facade.selectedAircraftMissing()).toBe(true); expect(facade.selectedAircraft()?.callsign).toBe('TEST01');
  });

  it('expone un error real después de reintentos limitados', async () => {
    vi.useFakeTimers(); const facade = createFacade(); facade.setAutoRefresh(false);
    const error: RadarError = { kind: 'network', message: 'Sin red' }; result$ = throwError(() => error); facade.refreshNow(); await vi.advanceTimersByTimeAsync(3_000);
    expect(facade.error()).toEqual(error); expect(facade.loading()).toBe(false);
  });
});

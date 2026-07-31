import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { GeographicArea } from '../models/geographic-area.model';
import { OpenSkyAircraftProvider } from './opensky-aircraft.provider';
import { RADAR_API_CONFIG } from './radar-api.config';

describe('OpenSkyAircraftProvider', () => {
  let provider: OpenSkyAircraftProvider;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OpenSkyAircraftProvider,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RADAR_API_CONFIG, useValue: { apiBaseUrl: '/opensky-api', metadataApiBaseUrl: 'https://api.airplanes.live/v2', mapTileUrls: ['tiles'], defaultAreaId: 'world', pollIntervalMs: 15_000 } },
      ],
    });
    provider = TestBed.inject(OpenSkyAircraftProvider);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the real global states endpoint without synthetic bounds', async () => {
    const area: GeographicArea = { id: 'world', name: 'Todo el mundo', shortName: 'Mundo', kind: 'world', bounds: null };
    const result = firstValueFrom(provider.getAircraft(area));
    const request = http.expectOne((item) => item.url === '/opensky-api/states/all');
    expect(request.request.params.get('extended')).toBe('1');
    expect(request.request.params.has('lamin')).toBe(false);
    request.flush({ time: 1_000, states: [] });
    await expect(result).resolves.toEqual([]);
  });

  it('sends the selected country bounding box to OpenSky', async () => {
    const area: GeographicArea = { id: 'guatemala', name: 'Guatemala', shortName: 'Guatemala', kind: 'country', bounds: { west: -92.3, south: 13.7, east: -88.1, north: 17.9 } };
    const result = firstValueFrom(provider.getAircraft(area));
    const request = http.expectOne((item) => item.url === '/opensky-api/states/all');
    expect(request.request.params.get('lamin')).toBe('13.7');
    expect(request.request.params.get('lomin')).toBe('-92.3');
    expect(request.request.params.get('lamax')).toBe('17.9');
    expect(request.request.params.get('lomax')).toBe('-88.1');
    request.flush({ time: 1_000, states: [] });
    await expect(result).resolves.toEqual([]);
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AircraftMetadataService } from './aircraft-metadata.service';
import { RADAR_API_CONFIG } from './radar-api.config';

describe('AircraftMetadataService', () => {
  it('loads and normalizes real registry metadata by ICAO address', async () => {
    TestBed.configureTestingModule({ providers: [
      AircraftMetadataService,
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: RADAR_API_CONFIG, useValue: { apiBaseUrl: '/opensky-api', metadataApiBaseUrl: 'https://api.airplanes.live/v2', mapTileUrls: ['tiles'], defaultAreaId: 'world', pollIntervalMs: 15_000 } },
    ] });
    const service = TestBed.inject(AircraftMetadataService);
    const http = TestBed.inject(HttpTestingController);
    const result = firstValueFrom(service.get('A5F852'));
    http.expectOne('https://api.airplanes.live/v2/icao/a5f852').flush({ ac: [{ r: ' N484JW ', t: 'C172', desc: 'CESSNA 172', ownOp: 'AIMS COMMUNITY COLLEGE', year: '2025' }], total: 1 });
    await expect(result).resolves.toEqual({ registration: 'N484JW', aircraftType: 'C172', description: 'CESSNA 172', operator: 'AIMS COMMUNITY COLLEGE', year: '2025' });
    http.verify();
  });
});

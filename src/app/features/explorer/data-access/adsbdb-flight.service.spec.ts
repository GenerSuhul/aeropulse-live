import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ADSBDB_API_CONFIG } from './adsbdb-api.config';
import { AdsbdbFlightService } from './adsbdb-flight.service';

describe('AdsbdbFlightService', () => {
  let service: AdsbdbFlightService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdsbdbFlightService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ADSBDB_API_CONFIG, useValue: { adsbdbApiBaseUrl: 'https://api.adsbdb.com/v0', cacheTtlMs: 900_000, timeoutMs: 8_000 } },
      ],
    });
    service = TestBed.inject(AdsbdbFlightService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carga una ruta establecida real por callsign', async () => {
    const result = firstValueFrom(service.getFlightRoute('UAL1234'));
    http.expectOne('https://api.adsbdb.com/v0/callsign/UAL1234').flush({
      response: {
        flightroute: {
          callsign: 'UAL1234',
          callsign_icao: 'UAL1234',
          callsign_iata: 'UA1234',
          airline: { name: 'United Airlines', icao: 'UAL', iata: 'UA', country: 'United States', country_iso: 'US', callsign: 'UNITED' },
          origin: { icao_code: 'KEWR', iata_code: 'EWR', municipality: 'New York', name: 'Newark Liberty International Airport', country_name: 'United States' },
          destination: { icao_code: 'KORD', iata_code: 'ORD', municipality: 'Chicago', name: "Chicago O'Hare International Airport", country_name: 'United States' },
        },
      },
    });
    await expect(result).resolves.toMatchObject({ callsign: 'UAL1234', airline: { icao: 'UAL' }, origin: { icaoCode: 'KEWR' }, destination: { icaoCode: 'KORD' } });
  });

  it('convierte un desconocido en null sin error', async () => {
    const result = firstValueFrom(service.getFlightRoute('XYZ999'));
    http.expectOne('https://api.adsbdb.com/v0/callsign/XYZ999').flush({ response: 'unknown callsign' }, { status: 404, statusText: 'Not Found' });
    await expect(result).resolves.toBeNull();
  });

  it('traduce el límite de consultas a un error tipado', async () => {
    const result = firstValueFrom(service.getFlightRoute('UAL1234'));
    http.expectOne('https://api.adsbdb.com/v0/callsign/UAL1234').flush(null, { status: 429, statusText: 'Too Many Requests' });
    await expect(result).rejects.toMatchObject({ kind: 'rate-limit' });
  });

  it('reutiliza la caché y no repite la llamada a la red', async () => {
    const first = firstValueFrom(service.getAircraft('N717MK'));
    http.expectOne('https://api.adsbdb.com/v0/aircraft/N717MK').flush({ response: { aircraft: { registration: 'N717MK', mode_s: 'A9972B', manufacturer: 'Bombardier', type: 'Global 5000' } } });
    await expect(first).resolves.toMatchObject({ registration: 'N717MK' });
    const second = firstValueFrom(service.getAircraft('N717MK'));
    await expect(second).resolves.toMatchObject({ registration: 'N717MK' });
  });
});

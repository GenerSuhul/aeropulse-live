import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdsbdbFlightService } from '../data-access/adsbdb-flight.service';
import { AircraftDetails } from '../models/aircraft-details.model';
import { FlightRoute } from '../models/flight-route.model';
import { ExplorerFacade } from './explorer.facade';

const route: FlightRoute = {
  callsign: 'UAL1234',
  callsignIcao: 'UAL1234',
  callsignIata: 'UA1234',
  airline: { name: 'United Airlines', icao: 'UAL', iata: 'UA', country: 'United States', countryIso: 'US', callsign: 'UNITED' },
  origin: { name: 'Newark Liberty International Airport', icaoCode: 'KEWR', iataCode: 'EWR', municipality: 'New York', countryName: 'United States', countryIsoName: 'US', elevation: 18, latitude: 40.69, longitude: -74.17 },
  destination: { name: "Chicago O'Hare International Airport", icaoCode: 'KORD', iataCode: 'ORD', municipality: 'Chicago', countryName: 'United States', countryIsoName: 'US', elevation: 672, latitude: 41.98, longitude: -87.9 },
};

function createFacade(overrides: Record<string, unknown> = {}): { facade: ExplorerFacade; service: AdsbdbFlightService } {
  const service = {
    getFlightRoute: vi.fn().mockReturnValue(of(route)),
    getAircraft: vi.fn().mockReturnValue(of(null)),
    getAirline: vi.fn().mockReturnValue(of([])),
    getOnline: vi.fn().mockReturnValue(of(true)),
    ...overrides,
  } as unknown as AdsbdbFlightService;
  TestBed.configureTestingModule({ providers: [ExplorerFacade, { provide: AdsbdbFlightService, useValue: service }] });
  return { facade: TestBed.inject(ExplorerFacade), service };
}

describe('ExplorerFacade', () => {
  afterEach(() => { TestBed.resetTestingModule(); });

  it('busca una ruta por callsign y la guarda en el historial', () => {
    const { facade, service } = createFacade();
    facade.setMode('flight');
    facade.setQuery(' ual1234 ');
    facade.search();
    expect(service.getFlightRoute).toHaveBeenCalledWith('UAL1234');
    expect(facade.loading()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(facade.resultRoute()?.callsign).toBe('UAL1234');
    expect(facade.selectedRoute()?.callsign).toBe('UAL1234');
    expect(facade.consultedFlights().length).toBe(1);
    expect(facade.lastUpdated()).not.toBeNull();
  });

  it('deduplica los vuelos consultados por callsign y prioriza el reciente', () => {
    const first: FlightRoute = { ...route, callsign: 'AAL100' };
    const second: FlightRoute = { ...route, callsign: 'DAL200' };
    const { facade } = createFacade({ getFlightRoute: vi.fn((callsign: string) => of(callsign === 'AAL100' ? first : second)) });
    facade.setQuery('AAL100');
    facade.search();
    facade.setQuery('DAL200');
    facade.search();
    expect(facade.consultedFlights().map((item) => item.callsign)).toEqual(['DAL200', 'AAL100']);
    facade.setQuery('AAL100');
    facade.search();
    expect(facade.consultedFlights().map((item) => item.callsign)).toEqual(['AAL100', 'DAL200']);
  });

  it('muestra estado vacío cuando la ruta no existe', () => {
    const { facade } = createFacade({ getFlightRoute: vi.fn().mockReturnValue(of(null)) });
    facade.setQuery('XYZ999');
    facade.search();
    expect(facade.error()?.kind).toBe('not-found');
    expect(facade.resultRoute()).toBeNull();
  });

  it('conserva tipado el error de límite de consultas', () => {
    const { facade } = createFacade({ getFlightRoute: vi.fn().mockReturnValue(throwError(() => ({ kind: 'rate-limit', message: 'ADSBDB alcanzó temporalmente su límite de consultas.' }))) });
    facade.setQuery('UAL1234');
    facade.search();
    expect(facade.error()?.kind).toBe('rate-limit');
    expect(facade.loading()).toBe(false);
  });

  it('valida consultas vacías sin llamar al servicio', () => {
    const { facade, service } = createFacade();
    facade.setQuery('   ');
    facade.search();
    expect(facade.error()?.kind).toBe('invalid-query');
    expect(service.getFlightRoute).not.toHaveBeenCalled();
  });

  it('restaura un vuelo del historial al seleccionarlo', () => {
    const { facade } = createFacade();
    facade.setQuery('UAL1234');
    facade.search();
    facade.selectFlight(route);
    expect(facade.selectedRoute()?.callsign).toBe('UAL1234');
    expect(facade.resultRoute()?.callsign).toBe('UAL1234');
    expect(facade.error()).toBeNull();
  });

  it('resuelve una aeronave por matrícula', () => {
    const aircraft: AircraftDetails = { type: 'Global 5000', icaoType: 'GL5T', manufacturer: 'Bombardier', modeS: 'A9972B', registration: 'N717MK', ownerCountryIso: 'US', ownerCountryName: 'United States', operatorFlagCode: 'GL5T', registeredOwner: 'The Whitewind Company', photoUrl: null, photoThumbnailUrl: null };
    const { facade, service } = createFacade({ getAircraft: vi.fn().mockReturnValue(of(aircraft)) });
    facade.setMode('aircraft');
    facade.setQuery('N717MK');
    facade.search();
    expect(service.getAircraft).toHaveBeenCalledWith('N717MK');
    expect(facade.resultAircraft()?.registration).toBe('N717MK');
    expect(facade.resultRoute()).toBeNull();
  });

  it('relaciona las rutas consultadas con la aerolínea buscada', () => {
    const { facade } = createFacade({
      getAirline: vi.fn().mockReturnValue(of([{ name: 'United Airlines', icao: 'UAL', iata: 'UA', country: 'United States', countryIso: 'US', callsign: 'UNITED' }])),
    });
    facade.setQuery('UAL1234');
    facade.search();
    facade.setMode('airline');
    facade.setQuery('UAL');
    facade.search();
    expect(facade.resultAirlines().length).toBe(1);
    expect(facade.airlineRoutes().map((item) => item.callsign)).toEqual(['UAL1234']);
  });
});

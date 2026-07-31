import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { AdsbdbFlightService } from '../data-access/adsbdb-flight.service';
import { AircraftDetails } from '../models/aircraft-details.model';
import { Airline } from '../models/airline.model';
import { ExplorerError } from '../models/explorer-error.model';
import { FlightRoute } from '../models/flight-route.model';

export type ExplorerSearchMode = 'flight' | 'aircraft' | 'airline';

interface SearchRequest {
  readonly mode: ExplorerSearchMode;
  readonly query: string;
}

const MAX_CONSULTED_FLIGHTS = 12;

function normalize(query: string, mode: ExplorerSearchMode): string {
  const uppercased = query.trim().toUpperCase();
  if (mode === 'aircraft') return uppercased.replace(/[^A-Z0-9-]/g, '');
  return uppercased.replace(/[^A-Z0-9]/g, '');
}

@Injectable()
export class ExplorerFacade {
  private readonly service = inject(AdsbdbFlightService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<SearchRequest>();
  private readonly modeState = signal<ExplorerSearchMode>('flight');
  private readonly queryState = signal('');
  private readonly loadingState = signal(false);
  private readonly errorState = signal<ExplorerError | null>(null);
  private readonly onlineState = signal(true);
  private readonly lastUpdatedState = signal<Date | null>(null);
  private readonly resultRouteState = signal<FlightRoute | null>(null);
  private readonly resultAircraftState = signal<AircraftDetails | null>(null);
  private readonly resultAirlinesState = signal<readonly Airline[]>([]);
  private readonly consultedState = signal<readonly FlightRoute[]>([]);
  private readonly selectedRouteState = signal<FlightRoute | null>(null);

  readonly mode = this.modeState.asReadonly();
  readonly query = this.queryState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly online = this.onlineState.asReadonly();
  readonly lastUpdated = this.lastUpdatedState.asReadonly();
  readonly resultRoute = this.resultRouteState.asReadonly();
  readonly resultAircraft = this.resultAircraftState.asReadonly();
  readonly resultAirlines = this.resultAirlinesState.asReadonly();
  readonly consultedFlights = this.consultedState.asReadonly();
  readonly selectedRoute = this.selectedRouteState.asReadonly();
  readonly airlineRoutes = computed(() => {
    const airlines = this.resultAirlinesState();
    if (airlines.length === 0) return [] as readonly FlightRoute[];
    const codes = new Set<string>();
    for (const airline of airlines) {
      if (airline.icao) codes.add(airline.icao);
      if (airline.iata) codes.add(airline.iata);
    }
    return this.consultedState().filter((route) => route.airline !== null
      && (codes.has(route.airline.icao ?? '') || codes.has(route.airline.iata ?? '')));
  });

  constructor() {
    this.searchSubject.pipe(
      switchMap((request) => this.runSearch(request.mode, request.query)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
    this.service.getOnline().subscribe((online) => this.onlineState.set(online));
  }

  setMode(mode: ExplorerSearchMode): void {
    if (mode === this.modeState()) return;
    this.modeState.set(mode);
    this.clearResults();
  }

  setQuery(query: string): void {
    this.queryState.set(query);
    if (this.errorState()?.kind === 'invalid-query') this.errorState.set(null);
  }

  search(): void {
    const query = normalize(this.queryState(), this.modeState());
    if (query.length === 0) {
      this.errorState.set({ kind: 'invalid-query', message: 'Escribe una consulta para buscar.' });
      return;
    }
    this.clearResults();
    this.loadingState.set(true);
    this.searchSubject.next({ mode: this.modeState(), query });
  }

  retry(): void {
    if (this.queryState().trim().length === 0) return;
    this.search();
  }

  selectFlight(route: FlightRoute): void {
    this.selectedRouteState.set(route);
    this.resultRouteState.set(route);
    this.resultAircraftState.set(null);
    this.resultAirlinesState.set([]);
    this.errorState.set(null);
  }

  private runSearch(mode: ExplorerSearchMode, query: string): Observable<void> {
    if (mode === 'flight') return this.searchFlight(query);
    if (mode === 'aircraft') return this.searchAircraft(query);
    return this.searchAirline(query);
  }

  private searchFlight(callsign: string): Observable<void> {
    return this.service.getFlightRoute(callsign).pipe(
      tap((route) => {
        if (route) {
          this.resultRouteState.set(route);
          this.selectedRouteState.set(route);
          this.remember(route);
        } else {
          this.clearResults();
          this.errorState.set({ kind: 'not-found', message: `No se encontró una ruta establecida para ${callsign}.` });
        }
        this.finish();
      }),
      catchError((error: unknown) => this.fail(error)),
      map(() => undefined),
    );
  }

  private searchAircraft(id: string): Observable<void> {
    return this.service.getAircraft(id).pipe(
      tap((aircraft) => {
        if (aircraft) {
          this.resultAircraftState.set(aircraft);
          this.resultRouteState.set(null);
          this.selectedRouteState.set(null);
          this.resultAirlinesState.set([]);
        } else {
          this.clearResults();
          this.errorState.set({ kind: 'not-found', message: `No se encontró la aeronave ${id} en el registro ADSBDB.` });
        }
        this.finish();
      }),
      catchError((error: unknown) => this.fail(error)),
      map(() => undefined),
    );
  }

  private searchAirline(code: string): Observable<void> {
    return this.service.getAirline(code).pipe(
      tap((airlines) => {
        if (airlines.length > 0) {
          this.resultAirlinesState.set(airlines);
          this.resultRouteState.set(null);
          this.selectedRouteState.set(null);
          this.resultAircraftState.set(null);
        } else {
          this.clearResults();
          this.errorState.set({ kind: 'not-found', message: `No se encontró la aerolínea ${code} en ADSBDB.` });
        }
        this.finish();
      }),
      catchError((error: unknown) => this.fail(error)),
      map(() => undefined),
    );
  }

  private remember(route: FlightRoute): void {
    const remaining = this.consultedState().filter((item) => item.callsign !== route.callsign);
    this.consultedState.set([route, ...remaining].slice(0, MAX_CONSULTED_FLIGHTS));
  }

  private clearResults(): void {
    this.resultRouteState.set(null);
    this.resultAircraftState.set(null);
    this.resultAirlinesState.set([]);
    this.selectedRouteState.set(null);
    this.errorState.set(null);
  }

  private finish(): void {
    this.loadingState.set(false);
    this.lastUpdatedState.set(new Date());
  }

  private fail(error: unknown): Observable<void> {
    const normalized: ExplorerError = typeof error === 'object' && error !== null && 'kind' in error && 'message' in error
      ? error as ExplorerError
      : { kind: 'unknown', message: 'No se pudo completar la consulta en ADSBDB.' };
    this.clearResults();
    this.errorState.set(normalized);
    this.loadingState.set(false);
    return of(undefined);
  }
}

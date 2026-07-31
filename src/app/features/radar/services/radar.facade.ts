import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, combineLatest, EMPTY, merge, Observable, of, retry, Subject, switchMap, tap, timer } from 'rxjs';
import { AircraftSelectionService } from '../../../core/aircraft-selection.service';
import { AdsbLolAircraftProvider } from '../data-access/adsb-lol-aircraft.provider';
import { MockAircraftProvider } from '../data-access/mock-aircraft.provider';
import { RADAR_API_CONFIG } from '../data-access/radar-api.config';
import { Aircraft } from '../models/aircraft.model';
import { RadarError } from '../models/radar-error.model';
import { calculateRadarMetrics } from '../models/radar-metrics.model';
import { RadarQuery } from '../models/radar-query.model';
import { AircraftDataProvider } from './aircraft-data-provider';
import { AircraftTrackService } from './aircraft-track.service';

export type RadarProviderMode = 'real' | 'mock';

@Injectable()
export class RadarFacade {
  private readonly realProvider = inject(AdsbLolAircraftProvider);
  private readonly mockProvider = inject(MockAircraftProvider);
  private readonly config = inject(RADAR_API_CONFIG);
  private readonly selectionService = inject(AircraftSelectionService);
  private readonly trackService = inject(AircraftTrackService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly querySubject = new BehaviorSubject<RadarQuery>(this.config.defaultQuery);
  private readonly manualRefreshSubject = new Subject<void>();
  private readonly autoRefreshSubject = new BehaviorSubject(true);
  private readonly intervalSubject = new BehaviorSubject(this.config.pollIntervalMs);
  private readonly queryState = signal<RadarQuery>(this.config.defaultQuery);
  private readonly aircraftState = signal<readonly Aircraft[]>([]);
  private readonly selectedIdState = signal<string | null>(null);
  private readonly selectedSnapshotState = signal<Aircraft | null>(null);
  private readonly loadingState = signal(true);
  private readonly refreshingState = signal(false);
  private readonly errorState = signal<RadarError | null>(null);
  private readonly providerModeState = signal<RadarProviderMode>(this.config.useMockProvider ? 'mock' : 'real');
  private readonly autoRefreshState = signal(true);
  private readonly lastUpdatedState = signal<Date | null>(null);
  private readonly onlineState = signal(typeof navigator === 'undefined' ? true : navigator.onLine);

  readonly query = this.queryState.asReadonly();
  readonly aircraft = this.aircraftState.asReadonly();
  readonly selectedAircraftId = this.selectedIdState.asReadonly();
  readonly selectedAircraft = computed(() => {
    const id = this.selectedIdState();
    return this.aircraftState().find((item) => item.id === id) ?? this.selectedSnapshotState();
  });
  readonly selectedAircraftMissing = computed(() => {
    const id = this.selectedIdState();
    return id !== null && !this.aircraftState().some((item) => item.id === id);
  });
  readonly loading = this.loadingState.asReadonly();
  readonly refreshing = this.refreshingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly providerMode = this.providerModeState.asReadonly();
  readonly autoRefreshEnabled = this.autoRefreshState.asReadonly();
  readonly lastUpdated = this.lastUpdatedState.asReadonly();
  readonly online = this.onlineState.asReadonly();
  readonly metrics = computed(() => calculateRadarMetrics(this.aircraftState()));
  readonly trackPoints = this.trackService.points;

  constructor() {
    this.connectPolling();
    if (typeof window !== 'undefined') {
      merge(
        new Observable<boolean>((subscriber) => {
          const online = (): void => subscriber.next(true);
          const offline = (): void => subscriber.next(false);
          window.addEventListener('online', online);
          window.addEventListener('offline', offline);
          return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline); };
        }),
      ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((online) => this.onlineState.set(online));
    }
  }

  updateQuery(query: RadarQuery): void {
    this.queryState.set(query);
    this.querySubject.next(query);
  }

  refreshNow(): void { this.manualRefreshSubject.next(); }

  setAutoRefresh(enabled: boolean): void {
    this.autoRefreshState.set(enabled);
    this.autoRefreshSubject.next(enabled);
  }

  setRefreshInterval(seconds: number): void {
    const safeSeconds = Math.min(60, Math.max(10, Math.round(seconds)));
    this.intervalSubject.next(safeSeconds * 1_000);
  }

  setProviderMode(mode: RadarProviderMode): void {
    if (this.providerModeState() === mode) return;
    this.providerModeState.set(mode);
    this.errorState.set(null);
    this.refreshNow();
  }

  selectAircraft(id: string | null): void {
    this.selectedIdState.set(id);
    this.trackService.select(id);
    const aircraft = this.aircraftState().find((item) => item.id === id) ?? null;
    this.selectedSnapshotState.set(aircraft);
    if (aircraft) {
      this.selectionService.select(aircraft);
      this.trackService.append(aircraft);
    } else {
      this.selectionService.clear();
    }
  }

  clearError(): void { this.errorState.set(null); }

  private connectPolling(): void {
    combineLatest([this.querySubject, this.autoRefreshSubject, this.intervalSubject]).pipe(
      switchMap(([query, autoRefresh, intervalMs]) => merge(
        of(query),
        this.manualRefreshSubject.pipe(switchMap(() => of(query))),
        autoRefresh ? timer(intervalMs, intervalMs).pipe(switchMap(() => of(query))) : EMPTY,
      )),
      switchMap((query) => this.requestAircraft(query)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  private requestAircraft(query: RadarQuery): Observable<readonly Aircraft[]> {
    const isInitial = this.lastUpdatedState() === null;
    this.loadingState.set(isInitial);
    this.refreshingState.set(!isInitial);
    this.errorState.set(null);
    return this.currentProvider().getAircraft(query).pipe(
      retry({ count: 2, delay: (_error, retryCount) => timer(retryCount * 600) }),
      tap((aircraft) => {
        this.aircraftState.set(aircraft);
        this.lastUpdatedState.set(new Date());
        const selected = aircraft.find((item) => item.id === this.selectedIdState());
        if (selected) {
          this.selectedSnapshotState.set(selected);
          this.selectionService.select(selected);
          this.trackService.append(selected);
        }
        this.loadingState.set(false);
        this.refreshingState.set(false);
      }),
      catchError((error: unknown) => {
        this.errorState.set(this.normalizeError(error));
        this.loadingState.set(false);
        this.refreshingState.set(false);
        return EMPTY;
      }),
    );
  }

  private currentProvider(): AircraftDataProvider {
    return this.providerModeState() === 'mock' ? this.mockProvider : this.realProvider;
  }

  private normalizeError(error: unknown): RadarError {
    if (typeof error === 'object' && error !== null && 'kind' in error && 'message' in error) return error as RadarError;
    return { kind: 'unknown', message: 'No se pudo actualizar el radar.' };
  }
}

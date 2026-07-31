import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, combineLatest, EMPTY, merge, Observable, of, retry, Subject, switchMap, tap, timer } from 'rxjs';
import { AircraftSelectionService } from '../../../core/aircraft-selection.service';
import { GEOGRAPHIC_AREAS, getGeographicArea } from '../data-access/geographic-areas';
import { RADAR_API_CONFIG } from '../data-access/radar-api.config';
import { Aircraft } from '../models/aircraft.model';
import { GeographicArea } from '../models/geographic-area.model';
import { RadarError } from '../models/radar-error.model';
import { calculateRadarMetrics } from '../models/radar-metrics.model';
import { AIRCRAFT_DATA_PROVIDER } from './aircraft-data-provider.token';
import { AircraftTrackService } from './aircraft-track.service';

@Injectable()
export class RadarFacade {
  private readonly provider = inject(AIRCRAFT_DATA_PROVIDER);
  private readonly config = inject(RADAR_API_CONFIG);
  private readonly selectionService = inject(AircraftSelectionService);
  private readonly trackService = inject(AircraftTrackService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly initialArea = getGeographicArea(this.config.defaultAreaId);
  private readonly areaSubject = new BehaviorSubject<GeographicArea>(this.initialArea);
  private readonly manualRefreshSubject = new Subject<void>();
  private readonly autoRefreshSubject = new BehaviorSubject(true);
  private readonly areaState = signal<GeographicArea>(this.initialArea);
  private readonly aircraftState = signal<readonly Aircraft[]>([]);
  private readonly selectedIdState = signal<string | null>(null);
  private readonly selectedSnapshotState = signal<Aircraft | null>(null);
  private readonly loadingState = signal(true);
  private readonly refreshingState = signal(false);
  private readonly errorState = signal<RadarError | null>(null);
  private readonly autoRefreshState = signal(true);
  private readonly lastUpdatedState = signal<Date | null>(null);
  private readonly onlineState = signal(typeof navigator === 'undefined' ? true : navigator.onLine);

  readonly areas = GEOGRAPHIC_AREAS;
  readonly area = this.areaState.asReadonly();
  readonly aircraft = this.aircraftState.asReadonly();
  readonly selectedAircraftId = this.selectedIdState.asReadonly();
  readonly selectedAircraft = computed(() => this.aircraftState().find((item) => item.id === this.selectedIdState()) ?? this.selectedSnapshotState());
  readonly selectedAircraftMissing = computed(() => this.selectedIdState() !== null && !this.aircraftState().some((item) => item.id === this.selectedIdState()));
  readonly loading = this.loadingState.asReadonly();
  readonly refreshing = this.refreshingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly autoRefreshEnabled = this.autoRefreshState.asReadonly();
  readonly lastUpdated = this.lastUpdatedState.asReadonly();
  readonly online = this.onlineState.asReadonly();
  readonly metrics = computed(() => calculateRadarMetrics(this.aircraftState()));
  readonly trackPoints = this.trackService.points;

  constructor() {
    this.connectPolling();
    if (typeof window !== 'undefined') {
      new Observable<boolean>((subscriber) => {
        const online = (): void => subscriber.next(true);
        const offline = (): void => subscriber.next(false);
        window.addEventListener('online', online); window.addEventListener('offline', offline);
        return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline); };
      }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((online) => this.onlineState.set(online));
    }
  }

  setArea(areaId: string): void {
    const area = getGeographicArea(areaId);
    if (area.id === this.areaState().id) return;
    this.areaState.set(area);
    this.selectAircraft(null);
    this.areaSubject.next(area);
  }

  refreshNow(): void { this.manualRefreshSubject.next(); }

  setAutoRefresh(enabled: boolean): void {
    this.autoRefreshState.set(enabled);
    this.autoRefreshSubject.next(enabled);
  }

  selectAircraft(id: string | null): void {
    this.selectedIdState.set(id);
    this.trackService.select(id);
    const aircraft = this.aircraftState().find((item) => item.id === id) ?? null;
    this.selectedSnapshotState.set(aircraft);
    if (aircraft) { this.selectionService.select(aircraft); this.trackService.append(aircraft); }
    else this.selectionService.clear();
  }

  private connectPolling(): void {
    combineLatest([this.areaSubject, this.autoRefreshSubject]).pipe(
      switchMap(([area, autoRefresh]) => merge(
        of(area),
        this.manualRefreshSubject.pipe(switchMap(() => of(area))),
        autoRefresh ? timer(this.config.pollIntervalMs, this.config.pollIntervalMs).pipe(switchMap(() => of(area))) : EMPTY,
      )),
      switchMap((area) => this.requestAircraft(area)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  private requestAircraft(area: GeographicArea): Observable<readonly Aircraft[]> {
    const isInitial = this.lastUpdatedState() === null;
    this.loadingState.set(isInitial); this.refreshingState.set(!isInitial); this.errorState.set(null);
    return this.provider.getAircraft(area).pipe(
      retry({ count: 2, delay: (_error, retryCount) => timer(retryCount * 800) }),
      tap((aircraft) => {
        this.aircraftState.set(aircraft); this.lastUpdatedState.set(new Date());
        const selected = aircraft.find((item) => item.id === this.selectedIdState());
        if (selected) { this.selectedSnapshotState.set(selected); this.selectionService.select(selected); this.trackService.append(selected); }
        this.loadingState.set(false); this.refreshingState.set(false);
      }),
      catchError((error: unknown) => {
        this.errorState.set(this.normalizeError(error)); this.loadingState.set(false); this.refreshingState.set(false); return EMPTY;
      }),
    );
  }

  private normalizeError(error: unknown): RadarError {
    if (typeof error === 'object' && error !== null && 'kind' in error && 'message' in error) return error as RadarError;
    return { kind: 'unknown', message: 'No se pudo actualizar el tráfico aéreo real.' };
  }
}

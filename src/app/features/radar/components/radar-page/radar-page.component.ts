import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { RadarFacade } from '../../services/radar.facade';
import { AircraftDetailPanelComponent } from '../aircraft-detail-panel/aircraft-detail-panel.component';
import { AircraftLiveListComponent } from '../aircraft-live-list/aircraft-live-list.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { ErrorStateComponent } from '../error-state/error-state.component';
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';
import { ProviderStatusComponent } from '../provider-status/provider-status.component';
import { RadarCoverageSelectorComponent } from '../radar-coverage-selector/radar-coverage-selector.component';
import { RadarHeaderComponent } from '../radar-header/radar-header.component';
import { RadarMapComponent } from '../radar-map/radar-map.component';
import { RadarStatsComponent } from '../radar-stats/radar-stats.component';
import { RadarToolbarComponent } from '../radar-toolbar/radar-toolbar.component';

@Component({
  selector: 'app-radar-page', host: { class: 'block min-w-0' },
  imports: [AircraftDetailPanelComponent, AircraftLiveListComponent, EmptyStateComponent, ErrorStateComponent, LoadingSkeletonComponent, ProviderStatusComponent, RadarCoverageSelectorComponent, RadarHeaderComponent, RadarMapComponent, RadarStatsComponent, RadarToolbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-[1800px] space-y-4">
      <app-radar-header [refreshing]="facade.refreshing()" [online]="facade.online() && facade.error()?.kind !== 'network'" [lastUpdated]="facade.lastUpdated()" (refresh)="facade.refreshNow()" />
      <app-radar-coverage-selector [areas]="facade.areas" [selectedArea]="facade.area()" (areaSelected)="facade.setArea($event)" />
      <app-radar-stats [metrics]="facade.metrics()" />
      <div class="grid gap-4 2xl:grid-cols-[minmax(0,3fr)_minmax(320px,1fr)]">
        <section class="relative overflow-hidden rounded-card border border-border bg-white shadow-card" aria-label="Visualización del radar mundial">
          <div class="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div class="min-w-0"><h2 class="truncate font-bold">{{ facade.area().name }}</h2><p class="text-xs text-ink-secondary">{{ facade.aircraft().length.toLocaleString() }} posiciones recibidas</p></div><app-provider-status /></div>
          <app-radar-toolbar [autoRefresh]="facade.autoRefreshEnabled()" [hasSelection]="facade.selectedAircraftId() !== null" [showTrajectory]="showTrajectory()" (refresh)="facade.refreshNow()" (autoRefreshChange)="facade.setAutoRefresh($event)" (fitAll)="mapComponent().fitAllAircraft()" (centerSelected)="mapComponent().centerSelectedAircraft()" (trajectoryChange)="showTrajectory.set($event)" />
          <app-radar-map [aircraft]="facade.aircraft()" [area]="facade.area()" [selectedId]="facade.selectedAircraftId()" [trackPoints]="facade.trackPoints()" [showTrajectory]="showTrajectory()" [mapTileUrls]="mapTileUrls" (aircraftSelected)="facade.selectAircraft($event)" />
          @if (facade.loading()) { <app-loading-skeleton /> }
          @if (!facade.loading() && facade.aircraft().length === 0 && facade.error(); as error) { <app-error-state [error]="error" (retry)="facade.refreshNow()" /> }
          @if (!facade.loading() && !facade.error() && facade.aircraft().length === 0) { <app-empty-state (refresh)="facade.refreshNow()" /> }
        </section>
        <app-aircraft-detail-panel [aircraft]="facade.selectedAircraft()" [missing]="facade.selectedAircraftMissing()" (center)="mapComponent().centerSelectedAircraft()" />
      </div>
      <app-aircraft-live-list [aircraft]="facade.aircraft()" [selectedId]="facade.selectedAircraftId()" (aircraftSelected)="facade.selectAircraft($event)" />
    </div>
  `,
})
export class RadarPageComponent {
  readonly facade = inject(RadarFacade);
  protected readonly mapComponent = viewChild.required(RadarMapComponent);
  protected readonly showTrajectory = signal(true);
  protected readonly mapTileUrls = environment.radar.mapTileUrls;
}

import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, OnDestroy, afterNextRender, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Map as MapLibreMap, MapMouseEvent, Popup, StyleSpecification } from 'maplibre-gl';
import { debounceTime, distinctUntilChanged, map, of, Subject, switchMap } from 'rxjs';
import { AircraftMetadataService } from '../../data-access/aircraft-metadata.service';
import { AircraftMetadata } from '../../models/aircraft-metadata.model';
import { Aircraft } from '../../models/aircraft.model';
import { GeographicArea } from '../../models/geographic-area.model';
import { TrackCoordinate } from '../../services/aircraft-track.service';

interface MovingPosition {
  readonly longitude: number;
  readonly latitude: number;
}

interface NearestAircraft extends MovingPosition {
  readonly aircraft: Aircraft;
}

const MAP_COLORS = { primary: '#4361EE', primaryDark: '#3046C5', ground: '#6B7280', white: '#FFFFFF' } as const;

@Component({
  selector: 'app-radar-map',
  host: { class: 'block min-w-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative h-[430px] w-full overflow-hidden bg-sky-50 md:h-[clamp(480px,62vh,620px)]" role="region" aria-label="Mapa interactivo de aeronaves. Pasa el cursor sobre un avión para consultar sus datos.">
      <div #mapContainer class="h-full w-full"></div>
      <canvas #aircraftCanvas class="pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden="true"></canvas>
    </div>
  `,
})
export class RadarMapComponent implements OnDestroy {
  private readonly container = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  private readonly aircraftCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('aircraftCanvas');
  private readonly metadataService = inject(AircraftMetadataService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly mapReady = signal(false);
  private readonly hoveredAircraftSubject = new Subject<Aircraft | null>();
  private map: MapLibreMap | null = null;
  private hoverPopup: Popup | null = null;
  private popupClass: typeof Popup | null = null;
  private animationFrame: number | null = null;
  private lastRenderedAt = 0;
  private snapshotStartedAt = 0;
  private aircraftReference: readonly Aircraft[] | null = null;
  private hoveredAircraft: Aircraft | null = null;
  private hoveredMetadata: AircraftMetadata | null = null;
  private metadataLoading = false;
  private destroyed = false;
  private readonly prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  readonly aircraft = input.required<readonly Aircraft[]>();
  readonly area = input.required<GeographicArea>();
  readonly selectedId = input<string | null>(null);
  readonly trackPoints = input<readonly TrackCoordinate[]>([]);
  readonly showTrajectory = input(true);
  readonly mapTileUrls = input.required<readonly string[]>();
  readonly aircraftSelected = output<string>();

  constructor() {
    afterNextRender(() => void this.initializeMap());
    effect(() => {
      const aircraft = this.aircraft();
      if (aircraft !== this.aircraftReference) {
        this.aircraftReference = aircraft;
        this.snapshotStartedAt = performance.now();
      }
      this.selectedId();
      this.trackPoints();
      this.showTrajectory();
    });
    effect(() => {
      const area = this.area();
      if (!this.mapReady() || !this.map) return;
      this.showArea(area);
    });
    this.hoveredAircraftSubject.pipe(
      debounceTime(180),
      distinctUntilChanged((previous, current) => previous?.id === current?.id),
      switchMap((aircraft) => aircraft
        ? this.metadataService.get(aircraft.icao24).pipe(map((metadata) => ({ aircraftId: aircraft.id, metadata })))
        : of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((result) => {
      if (!result || result.aircraftId !== this.hoveredAircraft?.id) return;
      this.hoveredMetadata = result.metadata;
      this.metadataLoading = false;
      this.refreshHoverContent();
    });
  }

  async initializeMap(): Promise<void> {
    const maplibre = await import('maplibre-gl');
    if (this.destroyed) return;
    this.popupClass = maplibre.Popup;
    this.map = new maplibre.Map({
      container: this.container().nativeElement,
      style: this.createBasemapStyle(),
      center: [0, 18],
      zoom: 1.25,
      maxZoom: 18,
      attributionControl: {},
    });
    this.map.addControl(new maplibre.NavigationControl({ visualizePitch: true }), 'top-right');
    this.map.on('mousemove', (event) => this.hoverNearestAircraft(event));
    this.map.on('click', (event) => this.selectNearestAircraft(event));
    this.map.getCanvas().addEventListener('mouseleave', () => this.clearHover());
    this.mapReady.set(true);
    this.animationFrame = requestAnimationFrame((time) => this.animateOverlay(time));
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    this.hoverPopup?.remove();
    this.map?.remove();
    this.map = null;
  }

  centerSelectedAircraft(): void {
    const selected = this.aircraft().find((item) => item.id === this.selectedId());
    if (!selected) return;
    const position = this.movingPosition(selected, performance.now());
    if (!position) return;
    this.map?.easeTo({ center: [position.longitude, position.latitude], zoom: Math.max(this.map.getZoom(), 9), duration: 700 });
  }

  fitAllAircraft(): void {
    this.showArea(this.area());
  }

  private createBasemapStyle(): StyleSpecification {
    return {
      version: 8,
      sources: {
        'carto-voyager': {
          type: 'raster',
          tiles: [...this.mapTileUrls()],
          tileSize: 256,
          attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
        },
      },
      layers: [{ id: 'carto-voyager', type: 'raster', source: 'carto-voyager', minzoom: 0, maxzoom: 20, paint: { 'raster-fade-duration': 120 } }],
    };
  }

  private showArea(area: GeographicArea): void {
    if (!this.map) return;
    if (area.bounds) {
      this.map.fitBounds([[area.bounds.west, area.bounds.south], [area.bounds.east, area.bounds.north]], { padding: 48, maxZoom: 8, duration: 650 });
      return;
    }
    this.map.easeTo({ center: [0, 18], zoom: 1.25, duration: 650 });
  }

  private animateOverlay(time: number): void {
    if (this.destroyed) return;
    const frameInterval = this.prefersReducedMotion ? 500 : this.aircraft().length > 5_000 ? 110 : 45;
    if (time - this.lastRenderedAt >= frameInterval) {
      this.lastRenderedAt = time;
      this.renderOverlay(time);
      this.updateHoverPosition(time);
    }
    this.animationFrame = requestAnimationFrame((nextTime) => this.animateOverlay(nextTime));
  }

  private renderOverlay(time: number): void {
    if (!this.map) return;
    const canvas = this.aircraftCanvas().nativeElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;
    const pixelRatio = window.devicePixelRatio || 1;
    const targetWidth = Math.round(width * pixelRatio);
    const targetHeight = Math.round(height * pixelRatio);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    this.drawTrack(context, width, height);
    const detailedMarkers = this.map.getZoom() >= 4 || this.aircraft().length < 800;
    for (const aircraft of this.aircraft()) {
      const position = this.movingPosition(aircraft, time);
      if (!position) continue;
      const point = this.map.project([position.longitude, position.latitude]);
      if (point.x < -12 || point.x > width + 12 || point.y < -12 || point.y > height + 12) continue;
      const selected = aircraft.id === this.selectedId();
      const hovered = aircraft.id === this.hoveredAircraft?.id;
      const color = selected || hovered ? MAP_COLORS.primaryDark : aircraft.isOnGround ? MAP_COLORS.ground : MAP_COLORS.primary;
      if (detailedMarkers || selected || hovered) this.drawAircraft(context, point.x, point.y, aircraft.headingDegrees ?? 0, color, selected || hovered);
      else this.drawPosition(context, point.x, point.y, color);
    }
  }

  private movingPosition(aircraft: Aircraft, time: number): MovingPosition | null {
    if (aircraft.longitude === null || aircraft.latitude === null) return null;
    if (this.prefersReducedMotion || aircraft.isOnGround || aircraft.headingDegrees === null || aircraft.groundSpeedKnots === null || aircraft.groundSpeedKnots < 1) {
      return { longitude: aircraft.longitude, latitude: aircraft.latitude };
    }
    const elapsedSeconds = Math.min(Math.max((time - this.snapshotStartedAt) / 1_000, 0), 45);
    const distanceNauticalMiles = aircraft.groundSpeedKnots * elapsedSeconds / 3_600;
    const headingRadians = aircraft.headingDegrees * Math.PI / 180;
    const latitude = aircraft.latitude + (distanceNauticalMiles * Math.cos(headingRadians)) / 60;
    const longitudeScale = Math.max(Math.cos(aircraft.latitude * Math.PI / 180), 0.05);
    const rawLongitude = aircraft.longitude + (distanceNauticalMiles * Math.sin(headingRadians)) / (60 * longitudeScale);
    const longitude = ((rawLongitude + 540) % 360) - 180;
    return { longitude, latitude: Math.max(-85, Math.min(85, latitude)) };
  }

  private drawTrack(context: CanvasRenderingContext2D, width: number, height: number): void {
    if (!this.map || !this.showTrajectory() || this.trackPoints().length < 2) return;
    context.save();
    context.beginPath();
    let started = false;
    for (const coordinate of this.trackPoints()) {
      const point = this.map.project([coordinate[0], coordinate[1]]);
      if (point.x < -width || point.x > width * 2 || point.y < -height || point.y > height * 2) continue;
      if (!started) { context.moveTo(point.x, point.y); started = true; }
      else context.lineTo(point.x, point.y);
    }
    context.strokeStyle = MAP_COLORS.primary;
    context.lineWidth = 3;
    context.globalAlpha = 0.62;
    context.setLineDash([6, 5]);
    context.stroke();
    context.restore();
  }

  private drawPosition(context: CanvasRenderingContext2D, x: number, y: number, color: string): void {
    context.beginPath();
    context.arc(x, y, 2.7, 0, Math.PI * 2);
    context.fillStyle = color;
    context.globalAlpha = 0.88;
    context.fill();
    context.globalAlpha = 1;
  }

  private drawAircraft(context: CanvasRenderingContext2D, x: number, y: number, heading: number, color: string, emphasized: boolean): void {
    const scale = emphasized ? 1.55 : 1.3;
    context.save();
    context.translate(x, y);
    context.rotate(((heading - (this.map?.getBearing() ?? 0)) * Math.PI) / 180);
    context.scale(scale, scale);
    context.beginPath();
    context.moveTo(0, -10); context.lineTo(2.2, -2.5); context.lineTo(8, 2.5); context.lineTo(8, 5);
    context.lineTo(2, 3); context.lineTo(2, 8); context.lineTo(4.3, 10.5); context.lineTo(4.3, 12);
    context.lineTo(0, 10.5); context.lineTo(-4.3, 12); context.lineTo(-4.3, 10.5); context.lineTo(-2, 8);
    context.lineTo(-2, 3); context.lineTo(-8, 5); context.lineTo(-8, 2.5); context.lineTo(-2.2, -2.5); context.closePath();
    context.fillStyle = color;
    context.strokeStyle = MAP_COLORS.white;
    context.lineWidth = emphasized ? 2 : 1.35;
    context.fill();
    context.stroke();
    context.restore();
  }

  private hoverNearestAircraft(event: MapMouseEvent): void {
    const nearest = this.findNearestAircraft(event.point, performance.now(), 18);
    if (!nearest) { this.clearHover(); return; }
    this.map!.getCanvas().classList.add('cursor-pointer');
    if (nearest.aircraft.id === this.hoveredAircraft?.id) return;
    this.hoveredAircraft = nearest.aircraft;
    this.hoveredMetadata = null;
    this.metadataLoading = true;
    this.hoveredAircraftSubject.next(nearest.aircraft);
    this.showHoverPopup(nearest);
  }

  private selectNearestAircraft(event: MapMouseEvent): void {
    const nearest = this.findNearestAircraft(event.point, performance.now(), 20);
    if (nearest) this.aircraftSelected.emit(nearest.aircraft.id);
  }

  private findNearestAircraft(point: { readonly x: number; readonly y: number }, time: number, radius: number): NearestAircraft | null {
    if (!this.map) return null;
    let nearest: NearestAircraft | null = null;
    let nearestDistance = radius * radius;
    for (const aircraft of this.aircraft()) {
      const position = this.movingPosition(aircraft, time);
      if (!position) continue;
      const projected = this.map.project([position.longitude, position.latitude]);
      const distance = (projected.x - point.x) ** 2 + (projected.y - point.y) ** 2;
      if (distance < nearestDistance) { nearest = { aircraft, ...position }; nearestDistance = distance; }
    }
    return nearest;
  }

  private showHoverPopup(nearest: NearestAircraft): void {
    if (!this.map || !this.popupClass) return;
    this.hoverPopup?.remove();
    this.hoverPopup = new this.popupClass({ closeButton: false, closeOnClick: false, offset: 18, maxWidth: 'min(280px, calc(100vw - 40px))', className: 'aircraft-hover-popup' })
      .setLngLat([nearest.longitude, nearest.latitude])
      .setDOMContent(this.createHoverContent(nearest.aircraft))
      .addTo(this.map);
  }

  private refreshHoverContent(): void {
    if (!this.hoveredAircraft || !this.hoverPopup) return;
    this.hoverPopup.setDOMContent(this.createHoverContent(this.hoveredAircraft));
  }

  private createHoverContent(aircraft: Aircraft): HTMLElement {
    const metadata = this.hoveredMetadata;
    const content = document.createElement('div');
    content.className = 'w-64 max-w-full space-y-2 p-1 text-sm text-ink';
    const heading = document.createElement('div');
    heading.className = 'flex items-start justify-between gap-3';
    const identity = document.createElement('div');
    const title = document.createElement('p');
    title.className = 'text-base font-extrabold leading-tight';
    title.textContent = aircraft.callsign ?? metadata?.registration ?? aircraft.icao24.toUpperCase();
    const identifier = document.createElement('p');
    identifier.className = 'mt-1 text-xs font-semibold text-ink-secondary';
    identifier.textContent = metadata?.registration ? `${metadata.registration} · ICAO ${aircraft.icao24.toUpperCase()}` : `ICAO ${aircraft.icao24.toUpperCase()}`;
    identity.append(title, identifier);
    const badge = document.createElement('span');
    badge.className = aircraft.isOnGround ? 'rounded-full bg-warning-soft px-2 py-1 text-[10px] font-extrabold text-warning' : 'rounded-full bg-success-soft px-2 py-1 text-[10px] font-extrabold text-success';
    badge.textContent = aircraft.isOnGround ? 'EN TIERRA' : 'EN VUELO';
    heading.append(identity, badge);
    content.append(heading);
    content.append(this.tooltipRow('Operador', metadata?.operator ?? (this.metadataLoading ? 'Consultando registro…' : 'No publicado')));
    const type = [metadata?.aircraftType, metadata?.description, metadata?.year].filter(Boolean).join(' · ');
    if (type) content.append(this.tooltipRow('Aeronave', type));
    else if (aircraft.originCountry) content.append(this.tooltipRow('Registro', aircraft.originCountry));
    content.append(this.tooltipRow('Movimiento', this.movementLabel(aircraft)));
    content.append(this.tooltipRow('Altitud', aircraft.altitudeFeet === null ? 'No disponible' : `${aircraft.altitudeFeet.toLocaleString()} ft`));
    return content;
  }

  private tooltipRow(label: string, value: string): HTMLElement {
    const row = document.createElement('div');
    row.className = 'grid grid-cols-[76px_1fr] gap-2 border-t border-border pt-2';
    const term = document.createElement('span');
    term.className = 'text-xs font-bold text-ink-muted';
    term.textContent = label;
    const detail = document.createElement('span');
    detail.className = 'text-xs font-bold text-ink-secondary';
    detail.textContent = value;
    row.append(term, detail);
    return row;
  }

  private movementLabel(aircraft: Aircraft): string {
    if (aircraft.isOnGround) return 'Detenida o rodando en superficie';
    const speed = aircraft.groundSpeedKnots === null ? 'velocidad no disponible' : `${Math.round(aircraft.groundSpeedKnots)} kt`;
    const direction = aircraft.headingDegrees === null ? 'rumbo no disponible' : `${this.cardinalDirection(aircraft.headingDegrees)} · ${Math.round(aircraft.headingDegrees)}°`;
    const verticalRate = aircraft.verticalRateFeetPerMinute;
    const vertical = verticalRate === null || Math.abs(verticalRate) < 120 ? 'vuelo nivelado' : verticalRate > 0 ? `ascendiendo ${Math.abs(Math.round(verticalRate)).toLocaleString()} ft/min` : `descendiendo ${Math.abs(Math.round(verticalRate)).toLocaleString()} ft/min`;
    return `${direction} · ${speed} · ${vertical}`;
  }

  private cardinalDirection(heading: number): string {
    const directions = ['Norte', 'Noreste', 'Este', 'Sureste', 'Sur', 'Suroeste', 'Oeste', 'Noroeste'];
    return directions[Math.round((((heading % 360) + 360) % 360) / 45) % directions.length];
  }

  private updateHoverPosition(time: number): void {
    if (!this.hoveredAircraft || !this.hoverPopup) return;
    const position = this.movingPosition(this.hoveredAircraft, time);
    if (position) this.hoverPopup.setLngLat([position.longitude, position.latitude]);
  }

  private clearHover(): void {
    if (!this.hoveredAircraft) return;
    this.hoveredAircraft = null;
    this.hoveredMetadata = null;
    this.metadataLoading = false;
    this.hoveredAircraftSubject.next(null);
    this.hoverPopup?.remove();
    this.hoverPopup = null;
    if (this.map) this.map.getCanvas().classList.remove('cursor-pointer');
  }
}

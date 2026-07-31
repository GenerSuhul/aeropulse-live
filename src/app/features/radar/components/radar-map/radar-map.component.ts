import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, effect, input, output, signal, viewChild } from '@angular/core';
import type { Map as MapLibreMap, MapMouseEvent, Popup } from 'maplibre-gl';
import { Aircraft } from '../../models/aircraft.model';
import { GeographicArea } from '../../models/geographic-area.model';
import { TrackCoordinate } from '../../services/aircraft-track.service';

@Component({
  selector: 'app-radar-map',
  host: { class: 'block min-w-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative h-[430px] w-full overflow-hidden bg-slate-100 md:h-[540px] xl:h-[620px]" role="region" aria-label="Mapa interactivo de aeronaves. Usa la lista de tráfico como alternativa accesible.">
      <div #mapContainer class="absolute inset-0"></div>
      <canvas #aircraftCanvas class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true"></canvas>
    </div>
  `,
})
export class RadarMapComponent implements OnDestroy {
  private readonly container = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  private readonly aircraftCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('aircraftCanvas');
  private readonly mapReady = signal(false);
  private map: MapLibreMap | null = null;
  private popup: Popup | null = null;
  private popupClass: typeof Popup | null = null;
  private overlayFrame: number | null = null;
  private destroyed = false;

  readonly aircraft = input.required<readonly Aircraft[]>();
  readonly area = input.required<GeographicArea>();
  readonly selectedId = input<string | null>(null);
  readonly trackPoints = input<readonly TrackCoordinate[]>([]);
  readonly showTrajectory = input(true);
  readonly mapStyleUrl = input.required<string>();
  readonly aircraftSelected = output<string>();

  constructor() {
    afterNextRender(() => void this.initializeMap());
    effect(() => {
      this.aircraft();
      this.selectedId();
      this.trackPoints();
      this.showTrajectory();
      if (this.mapReady()) this.scheduleOverlayRender();
    });
    effect(() => {
      const area = this.area();
      if (!this.mapReady() || !this.map) return;
      this.showArea(area);
    });
  }

  async initializeMap(): Promise<void> {
    const maplibre = await import('maplibre-gl');
    if (this.destroyed) return;
    this.popupClass = maplibre.Popup;
    this.map = new maplibre.Map({
      container: this.container().nativeElement,
      style: this.mapStyleUrl(),
      center: [0, 18],
      zoom: 1.25,
      attributionControl: {},
    });
    this.map.addControl(new maplibre.NavigationControl({ visualizePitch: true }), 'top-right');
    this.map.on('render', () => this.scheduleOverlayRender());
    this.map.on('resize', () => this.scheduleOverlayRender());
    this.map.on('click', (event) => this.selectNearestAircraft(event));
    this.mapReady.set(true);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.overlayFrame !== null) cancelAnimationFrame(this.overlayFrame);
    this.popup?.remove();
    this.map?.remove();
    this.map = null;
  }

  centerSelectedAircraft(): void {
    const selected = this.aircraft().find((item) => item.id === this.selectedId());
    if (selected?.longitude === null || selected?.latitude === null || selected === undefined) return;
    this.map?.easeTo({ center: [selected.longitude, selected.latitude], zoom: Math.max(this.map.getZoom(), 9), duration: 700 });
  }

  fitAllAircraft(): void {
    this.showArea(this.area());
  }

  private showArea(area: GeographicArea): void {
    if (!this.map) return;
    if (area.bounds) {
      this.map.fitBounds([[area.bounds.west, area.bounds.south], [area.bounds.east, area.bounds.north]], { padding: 48, maxZoom: 8, duration: 650 });
      return;
    }
    this.map.easeTo({ center: [0, 18], zoom: 1.25, duration: 650 });
  }

  private scheduleOverlayRender(): void {
    if (this.overlayFrame !== null) return;
    this.overlayFrame = requestAnimationFrame(() => {
      this.overlayFrame = null;
      this.renderOverlay();
    });
  }

  private renderOverlay(): void {
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
    const detailedMarkers = this.map.getZoom() >= 2.6;
    for (const aircraft of this.aircraft()) {
      if (aircraft.longitude === null || aircraft.latitude === null) continue;
      const point = this.map.project([aircraft.longitude, aircraft.latitude]);
      if (point.x < -12 || point.x > width + 12 || point.y < -12 || point.y > height + 12) continue;
      const selected = aircraft.id === this.selectedId();
      const color = selected ? '#E2A03F' : aircraft.isOnGround ? '#64748B' : '#4361EE';
      if (detailedMarkers || selected) this.drawAircraft(context, point.x, point.y, aircraft.headingDegrees ?? 0, color, selected);
      else this.drawPosition(context, point.x, point.y, color);
    }
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
    context.strokeStyle = '#4361EE';
    context.lineWidth = 3;
    context.globalAlpha = 0.62;
    context.setLineDash([6, 5]);
    context.stroke();
    context.restore();
  }

  private drawPosition(context: CanvasRenderingContext2D, x: number, y: number, color: string): void {
    context.beginPath();
    context.arc(x, y, 2.1, 0, Math.PI * 2);
    context.fillStyle = color;
    context.globalAlpha = 0.88;
    context.fill();
    context.globalAlpha = 1;
  }

  private drawAircraft(context: CanvasRenderingContext2D, x: number, y: number, heading: number, color: string, selected: boolean): void {
    const scale = selected ? 1.2 : 1;
    context.save();
    context.translate(x, y);
    context.rotate((heading * Math.PI) / 180);
    context.scale(scale, scale);
    context.beginPath();
    context.moveTo(0, -10);
    context.lineTo(2.2, -2.5);
    context.lineTo(8, 2.5);
    context.lineTo(8, 5);
    context.lineTo(2, 3);
    context.lineTo(2, 8);
    context.lineTo(4.3, 10.5);
    context.lineTo(4.3, 12);
    context.lineTo(0, 10.5);
    context.lineTo(-4.3, 12);
    context.lineTo(-4.3, 10.5);
    context.lineTo(-2, 8);
    context.lineTo(-2, 3);
    context.lineTo(-8, 5);
    context.lineTo(-8, 2.5);
    context.lineTo(-2.2, -2.5);
    context.closePath();
    context.fillStyle = color;
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = selected ? 2.2 : 1.5;
    context.fill();
    context.stroke();
    context.restore();
  }

  private selectNearestAircraft(event: MapMouseEvent): void {
    if (!this.map) return;
    let nearest: Aircraft | null = null;
    let nearestDistance = 14 * 14;
    for (const aircraft of this.aircraft()) {
      if (aircraft.longitude === null || aircraft.latitude === null) continue;
      const point = this.map.project([aircraft.longitude, aircraft.latitude]);
      const distance = (point.x - event.point.x) ** 2 + (point.y - event.point.y) ** 2;
      if (distance < nearestDistance) { nearest = aircraft; nearestDistance = distance; }
    }
    if (!nearest || nearest.longitude === null || nearest.latitude === null) return;
    this.aircraftSelected.emit(nearest.id);
    if (!this.popupClass) return;
    this.popup?.remove();
    this.popup = new this.popupClass({ closeButton: false, offset: 18 })
      .setLngLat([nearest.longitude, nearest.latitude])
      .setText(nearest.callsign ?? nearest.registration ?? nearest.icao24.toUpperCase())
      .addTo(this.map);
  }
}

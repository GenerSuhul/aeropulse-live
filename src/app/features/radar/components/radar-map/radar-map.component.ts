import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, effect, inject, input, output, signal, viewChild } from '@angular/core';
import type { Feature, FeatureCollection, LineString, Point } from 'geojson';
import type { GeoJSONSource, Map as MapLibreMap, SymbolLayerSpecification } from 'maplibre-gl';
import { Aircraft } from '../../models/aircraft.model';
import { RADAR_API_CONFIG } from '../../data-access/radar-api.config';
import { TrackCoordinate } from '../../services/aircraft-track.service';

interface AircraftProperties { readonly id: string; readonly label: string; readonly heading: number; readonly icon: string; readonly selected: boolean; }

@Component({
  selector: 'app-radar-map', host: { class: 'block min-w-0' }, changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #mapContainer class="h-[430px] w-full bg-slate-100 md:h-[540px] xl:h-[620px]" role="region" aria-label="Mapa interactivo de aeronaves. Usa la lista de tráfico como alternativa accesible."></div>`,
})
export class RadarMapComponent implements OnDestroy {
  private readonly container = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  private readonly config = inject(RADAR_API_CONFIG);
  private map: MapLibreMap | null = null;
  private popup: import('maplibre-gl').Popup | null = null;
  private didInitialFit = false;
  private destroyed = false;
  private readonly layersReady = signal(false);
  readonly aircraft = input.required<readonly Aircraft[]>();
  readonly selectedId = input<string | null>(null);
  readonly trackPoints = input<readonly TrackCoordinate[]>([]);
  readonly showTrajectory = input(true);
  readonly mapStyleUrl = input.required<string>();
  readonly aircraftSelected = output<string>();

  constructor() {
    afterNextRender(() => void this.initializeMap());
    effect(() => {
      if (!this.layersReady()) return;
      this.updateAircraftSource(this.aircraft(), this.selectedId());
      this.updateTrackSource(this.trackPoints());
      this.map?.setLayoutProperty('selected-track', 'visibility', this.showTrajectory() ? 'visible' : 'none');
    });
  }

  async initializeMap(): Promise<void> {
    const maplibre = await import('maplibre-gl');
    if (this.destroyed) return;
    this.map = new maplibre.Map({
      container: this.container().nativeElement,
      style: this.mapStyleUrl(),
      center: [this.config.defaultQuery.longitude, this.config.defaultQuery.latitude], zoom: 6.2, attributionControl: {},
    });
    this.map.addControl(new maplibre.NavigationControl({ visualizePitch: true }), 'top-right');
    this.map.on('load', () => void this.createLayers(maplibre.Popup));
  }

  ngOnDestroy(): void { this.destroyed = true; this.popup?.remove(); this.map?.remove(); this.map = null; }

  centerSelectedAircraft(): void {
    const selected = this.aircraft().find((item) => item.id === this.selectedId());
    if (selected?.longitude === null || selected?.latitude === null || selected === undefined) return;
    this.map?.easeTo({ center: [selected.longitude, selected.latitude], zoom: Math.max(this.map.getZoom(), 9), duration: 700 });
  }

  fitAllAircraft(): void {
    const positions = this.aircraft().filter((item) => item.latitude !== null && item.longitude !== null);
    if (!this.map || positions.length === 0) return;
    const longitudes = positions.map((item) => item.longitude as number); const latitudes = positions.map((item) => item.latitude as number);
    this.map.fitBounds([[Math.min(...longitudes), Math.min(...latitudes)], [Math.max(...longitudes), Math.max(...latitudes)]], { padding: 72, maxZoom: 10, duration: 650 });
  }

  private async createLayers(PopupClass: typeof import('maplibre-gl').Popup): Promise<void> {
    if (!this.map || this.destroyed) return;
    const [aircraftImage, selectedImage, groundImage] = await Promise.all([
      this.map.loadImage('/aircraft.svg'), this.map.loadImage('/aircraft-selected.svg'), this.map.loadImage('/aircraft-ground.svg'),
    ]);
    if (!this.map || this.destroyed) return;
    this.map.addImage('aircraft', aircraftImage.data); this.map.addImage('aircraft-selected', selectedImage.data); this.map.addImage('aircraft-ground', groundImage.data);
    this.map.addSource('aircraft-source', { type: 'geojson', data: this.emptyPoints() });
    this.map.addSource('selected-track-source', { type: 'geojson', data: this.emptyLines() });
    this.map.addLayer({ id: 'selected-track', type: 'line', source: 'selected-track-source', paint: { 'line-color': '#4361EE', 'line-width': 3, 'line-opacity': 0.62, 'line-dasharray': [1.5, 1.2] } });
    const symbolLayout: SymbolLayerSpecification['layout'] = { 'icon-image': ['get', 'icon'], 'icon-size': 0.72, 'icon-rotate': ['get', 'heading'], 'icon-rotation-alignment': 'map', 'icon-allow-overlap': true, 'icon-ignore-placement': true };
    this.map.addLayer({ id: 'aircraft-layer', type: 'symbol', source: 'aircraft-source', filter: ['==', ['get', 'selected'], false], layout: symbolLayout });
    this.map.addLayer({ id: 'selected-aircraft-layer', type: 'symbol', source: 'aircraft-source', filter: ['==', ['get', 'selected'], true], layout: { ...symbolLayout, 'icon-size': 0.9 } });
    const selectFromEvent = (event: import('maplibre-gl').MapLayerMouseEvent): void => {
      const feature = event.features?.[0]; const id = feature?.properties?.['id'];
      if (!feature || typeof id !== 'string') return;
      this.aircraftSelected.emit(id);
      const coordinates = (feature.geometry as Point).coordinates;
      const label = feature.properties?.['label'];
      this.popup?.remove(); this.popup = new PopupClass({ closeButton: false, offset: 18 }).setLngLat([coordinates[0], coordinates[1]]).setText(typeof label === 'string' ? label : id.toUpperCase()).addTo(this.map!);
    };
    this.map.on('click', 'aircraft-layer', selectFromEvent); this.map.on('click', 'selected-aircraft-layer', selectFromEvent);
    for (const layer of ['aircraft-layer', 'selected-aircraft-layer']) {
      this.map.on('mouseenter', layer, () => { if (this.map) this.map.getCanvas().style.cursor = 'pointer'; });
      this.map.on('mouseleave', layer, () => { if (this.map) this.map.getCanvas().style.cursor = ''; });
    }
    this.layersReady.set(true);
  }

  private updateAircraftSource(aircraft: readonly Aircraft[], selectedId: string | null): void {
    const features: Feature<Point, AircraftProperties>[] = aircraft
      .filter((item) => item.latitude !== null && item.longitude !== null)
      .map((item) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [item.longitude as number, item.latitude as number] }, properties: {
        id: item.id, label: item.callsign ?? item.registration ?? item.icao24, heading: item.headingDegrees ?? 0,
        icon: item.id === selectedId ? 'aircraft-selected' : item.isOnGround ? 'aircraft-ground' : 'aircraft', selected: item.id === selectedId,
      } }));
    (this.map?.getSource('aircraft-source') as GeoJSONSource | undefined)?.setData({ type: 'FeatureCollection', features });
    if (!this.didInitialFit && features.length > 0) { this.didInitialFit = true; this.fitAllAircraft(); }
  }

  private updateTrackSource(points: readonly TrackCoordinate[]): void {
    const data: FeatureCollection<LineString> = points.length < 2 ? this.emptyLines() : { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: points.map((point) => [point[0], point[1]]) } }] };
    (this.map?.getSource('selected-track-source') as GeoJSONSource | undefined)?.setData(data);
  }

  private emptyPoints(): FeatureCollection<Point> { return { type: 'FeatureCollection', features: [] }; }
  private emptyLines(): FeatureCollection<LineString> { return { type: 'FeatureCollection', features: [] }; }
}

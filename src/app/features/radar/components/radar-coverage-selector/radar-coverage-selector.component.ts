import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Globe2, LucideAngularModule, MapPinned } from 'lucide-angular';
import { GeographicArea } from '../../models/geographic-area.model';

@Component({
  selector: 'app-radar-coverage-selector', host: { class: 'block min-w-0' }, imports: [LucideAngularModule], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="coverage-selector" class="border-y border-border bg-white px-4 py-4 sm:rounded-card sm:border sm:px-5 sm:shadow-card" aria-labelledby="coverage-title">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div class="flex items-center gap-3 xl:min-w-64"><span class="grid size-10 place-items-center rounded-full border border-border text-primary"><lucide-angular [img]="mapIcon" [size]="20" /></span><div><h2 id="coverage-title" class="font-bold">Cobertura del radar</h2><p class="text-xs text-ink-secondary">Tráfico real de OpenSky Network</p></div></div>
        <div class="grid flex-1 gap-3 md:grid-cols-[minmax(220px,320px)_1fr] md:items-center">
          <label class="sr-only" for="area-select">País, continente o mundo</label>
          <select id="area-select" [value]="selectedArea().id" (change)="selectArea($event)" class="min-h-11 w-full rounded-lg border border-border bg-white px-3 font-semibold text-ink">
            <option value="world">Mundo · todos los vuelos disponibles</option>
            <optgroup label="Continentes y regiones">@for (area of continents(); track area.id) { <option [value]="area.id">{{ area.name }}</option> }</optgroup>
            <optgroup label="Países">@for (area of countries(); track area.id) { <option [value]="area.id">{{ area.name }}</option> }</optgroup>
          </select>
          <div class="flex gap-2 overflow-x-auto pb-1 md:pb-0" aria-label="Accesos rápidos de cobertura">
            @for (area of quickAreas(); track area.id) {
              <button type="button" (click)="areaSelected.emit(area.id)" class="min-h-11 shrink-0 rounded-lg border px-3 text-sm font-bold transition-colors" [class.border-primary]="selectedArea().id === area.id" [class.bg-primary]="selectedArea().id === area.id" [class.text-white]="selectedArea().id === area.id" [class.border-border]="selectedArea().id !== area.id" [class.bg-white]="selectedArea().id !== area.id" [class.text-ink-secondary]="selectedArea().id !== area.id">{{ area.shortName }}</button>
            }
          </div>
        </div>
        <p class="flex items-center gap-2 text-xs font-semibold text-ink-secondary xl:ml-auto"><lucide-angular [img]="globeIcon" [size]="16" />Actualización real cada 60 s</p>
      </div>
    </section>
  `,
})
export class RadarCoverageSelectorComponent {
  readonly areas = input.required<readonly GeographicArea[]>();
  readonly selectedArea = input.required<GeographicArea>();
  readonly areaSelected = output<string>();
  protected readonly globeIcon = Globe2; protected readonly mapIcon = MapPinned;
  protected readonly continents = computed(() => this.areas().filter((area) => area.kind === 'continent'));
  protected readonly countries = computed(() => this.areas().filter((area) => area.kind === 'country'));
  protected readonly quickAreas = computed(() => ['world', 'central-america'].map((id) => this.areas().find((area) => area.id === id)).filter((area): area is GeographicArea => area !== undefined));
  protected selectArea(event: Event): void { this.areaSelected.emit((event.target as HTMLSelectElement).value); }
}

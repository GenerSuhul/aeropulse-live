import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Globe2, LucideAngularModule, MapPinned } from 'lucide-angular';
import { GeographicArea } from '../../models/geographic-area.model';

@Component({
  selector: 'app-radar-coverage-selector', host: { class: 'block min-w-0' }, imports: [LucideAngularModule], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="coverage-selector" class="border-y border-border bg-white px-4 py-4 sm:rounded-card sm:border sm:px-5 sm:shadow-card" aria-labelledby="coverage-title">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 items-center gap-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><lucide-angular [img]="mapIcon" [size]="20" aria-hidden="true" /></span>
            <div class="min-w-0"><h2 id="coverage-title" class="font-bold">Cobertura del radar</h2><p class="truncate text-xs text-ink-secondary">Tráfico real de OpenSky Network</p></div>
          </div>
          <p class="flex shrink-0 items-center gap-2 text-xs font-semibold text-ink-secondary"><lucide-angular [img]="globeIcon" [size]="16" aria-hidden="true" />Datos cada 15 s</p>
        </div>
        <div class="grid min-w-0 gap-2 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-center">
          <label class="sr-only" for="area-select">País, continente o mundo</label>
          <select id="area-select" [value]="selectedArea().id" (change)="selectArea($event)" class="min-h-11 min-w-0 w-full rounded-lg border border-border bg-white px-3 font-semibold text-ink">
            <option value="world">Mundo · todos los vuelos disponibles</option>
            <optgroup label="Continentes y regiones">@for (area of continents(); track area.id) { <option [value]="area.id">{{ area.name }}</option> }</optgroup>
            <optgroup label="Países">@for (area of countries(); track area.id) { <option [value]="area.id">{{ area.name }}</option> }</optgroup>
          </select>
          <div class="grid grid-cols-2 gap-2 sm:flex" aria-label="Accesos rápidos de cobertura">
            @for (area of quickAreas(); track area.id) {
              <button type="button" (click)="areaSelected.emit(area.id)" class="min-h-11 min-w-0 rounded-lg border px-3 text-sm font-bold transition-colors sm:min-w-28" [class.border-primary]="selectedArea().id === area.id" [class.bg-primary]="selectedArea().id === area.id" [class.text-white]="selectedArea().id === area.id" [class.border-border]="selectedArea().id !== area.id" [class.bg-white]="selectedArea().id !== area.id" [class.text-ink-secondary]="selectedArea().id !== area.id"><span class="block truncate">{{ area.shortName }}</span></button>
            }
          </div>
        </div>
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

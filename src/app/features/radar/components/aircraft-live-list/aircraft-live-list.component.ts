import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import { Aircraft } from '../../models/aircraft.model';

type SortMode = 'altitude' | 'speed' | 'recent';

@Component({
  selector: 'app-aircraft-live-list', host: { class: 'block min-w-0' }, imports: [ReactiveFormsModule, LucideAngularModule], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-card border border-border bg-white shadow-card" aria-labelledby="live-list-title">
      <div class="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
        <div><h2 id="live-list-title" class="font-bold">Tráfico en vivo</h2><p class="text-xs text-ink-secondary">{{ filteredAircraft().length > 250 ? 'Mostrando 250 de ' + filteredAircraft().length.toLocaleString() : filteredAircraft().length + ' aeronaves visibles' }}</p></div>
        <div class="ml-auto grid w-full gap-2 sm:flex sm:w-auto">
          <label class="flex min-h-11 min-w-0 items-center gap-2 rounded-lg border border-border px-3 sm:w-56"><span class="sr-only">Buscar aeronave</span><lucide-angular [img]="searchIcon" [size]="16" class="text-ink-muted"/><input [formControl]="searchControl" class="min-w-0 flex-1 outline-none" placeholder="Callsign, matrícula o ICAO" /></label>
          <label><span class="sr-only">Ordenar aeronaves</span><select [value]="sortMode()" (change)="changeSort($event)" class="min-h-11 w-full rounded-lg border border-border bg-white px-3 text-sm sm:w-auto"><option value="recent">Más recientes</option><option value="altitude">Mayor altitud</option><option value="speed">Mayor velocidad</option></select></label>
        </div>
      </div>
      <div class="max-h-80 overflow-y-auto" aria-label="Lista alternativa accesible al mapa">
        @for (item of visibleAircraft(); track item.id) {
          <button type="button" (click)="aircraftSelected.emit(item.id)" class="grid min-h-16 w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-4 py-3 text-left hover:bg-surface-muted" [class.bg-primary-soft]="selectedId() === item.id" [attr.aria-pressed]="selectedId() === item.id">
            <span class="min-w-0"><span class="flex items-center gap-2"><strong class="truncate">{{ item.callsign ?? item.icao24 }}</strong><span class="rounded-full px-2 py-0.5 text-[10px] font-bold" [class.bg-success-soft]="!item.isOnGround" [class.text-success]="!item.isOnGround" [class.bg-warning-soft]="item.isOnGround" [class.text-amber-700]="item.isOnGround">{{ item.isOnGround ? 'TIERRA' : 'VUELO' }}</span></span><span class="mt-1 block truncate text-xs text-ink-secondary">{{ item.originCountry ?? 'Origen no disponible' }} · ICAO {{ item.icao24 }}</span></span>
            <span class="text-right text-xs"><strong class="block text-sm">{{ item.altitudeFeet === null ? '—' : item.altitudeFeet.toLocaleString() + ' ft' }}</strong><span class="text-ink-secondary">{{ item.groundSpeedKnots === null ? '—' : item.groundSpeedKnots.toLocaleString() + ' kt' }}</span></span>
          </button>
        } @empty { <div class="p-8 text-center text-sm text-ink-secondary">No hay aeronaves que coincidan con la búsqueda.</div> }
      </div>
    </section>
  `,
})
export class AircraftLiveListComponent {
  readonly aircraft = input.required<readonly Aircraft[]>(); readonly selectedId = input<string | null>(null); readonly aircraftSelected = output<string>();
  protected readonly searchIcon = Search; protected readonly sortMode = signal<SortMode>('recent');
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly searchTerm = toSignal(this.searchControl.valueChanges.pipe(startWith(''), debounceTime(180), distinctUntilChanged(), map((value) => value.trim().toLowerCase())), { initialValue: '' });
  protected readonly filteredAircraft = computed(() => {
    const term = this.searchTerm();
    const matches = this.aircraft().filter((item) => !term || [item.callsign, item.registration, item.icao24, item.originCountry].some((value) => value?.toLowerCase().includes(term)));
    return [...matches].sort((a, b) => {
      if (this.sortMode() === 'altitude') return (b.altitudeFeet ?? -1) - (a.altitudeFeet ?? -1);
      if (this.sortMode() === 'speed') return (b.groundSpeedKnots ?? -1) - (a.groundSpeedKnots ?? -1);
      return (a.secondsSinceLastMessage ?? Number.MAX_VALUE) - (b.secondsSinceLastMessage ?? Number.MAX_VALUE);
    });
  });
  protected readonly visibleAircraft = computed(() => this.filteredAircraft().slice(0, 250));
  protected changeSort(event: Event): void { this.sortMode.set((event.target as HTMLSelectElement).value as SortMode); }
}

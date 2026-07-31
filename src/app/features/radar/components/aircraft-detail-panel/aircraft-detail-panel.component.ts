import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Crosshair, LucideAngularModule, Radar, Star } from 'lucide-angular';
import { Aircraft } from '../../models/aircraft.model';

@Component({
  selector: 'app-aircraft-detail-panel', host: { class: 'block min-w-0' }, imports: [LucideAngularModule], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-card border border-border bg-white shadow-card" aria-labelledby="aircraft-detail-title">
      <div class="border-b border-border p-4"><p class="text-xs font-bold uppercase tracking-[.15em] text-primary">Aeronave seleccionada</p><h2 id="aircraft-detail-title" class="mt-1 text-xl font-bold">{{ aircraft()?.callsign ?? aircraft()?.registration ?? 'Sin selección' }}</h2></div>
      @if (aircraft(); as item) {
        @if (missing()) { <div class="m-4 rounded-lg bg-warning-soft p-3 text-sm font-semibold text-amber-800">Ya no se detecta en la actualización actual. Se conserva el último dato recibido.</div> }
        <dl class="grid grid-cols-2 gap-x-4 gap-y-4 p-4 text-sm">
          @for (field of fields(item); track field.label) { <div><dt class="text-xs font-semibold text-ink-muted">{{ field.label }}</dt><dd class="mt-1 break-words font-bold text-ink">{{ field.value }}</dd></div> }
        </dl>
        <div class="grid gap-2 border-t border-border p-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <button type="button" (click)="center.emit()" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-bold text-white hover:bg-primary-dark"><lucide-angular [img]="icons.Crosshair" [size]="16" />Centrar</button>
          <button type="button" disabled class="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-bold text-ink-muted"><lucide-angular [img]="icons.Radar" [size]="16" />Explorador</button>
          <button type="button" disabled class="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-bold text-ink-muted"><lucide-angular [img]="icons.Star" [size]="16" />Seguimiento</button>
        </div>
      } @else {
        <div class="grid min-h-56 place-items-center p-6 text-center"><div><span class="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft text-primary"><lucide-angular [img]="icons.Radar" [size]="23" /></span><p class="mt-3 font-bold">Selecciona una aeronave</p><p class="mt-1 text-sm text-ink-secondary">Haz clic en el mapa o en la lista para inspeccionar sus datos.</p></div></div>
      }
    </section>
  `,
})
export class AircraftDetailPanelComponent {
  readonly aircraft = input<Aircraft | null>(null); readonly missing = input(false); readonly center = output<void>();
  protected readonly icons = { Crosshair, Radar, Star };
  protected fields(item: Aircraft): readonly { label: string; value: string }[] {
    const text = (value: string | null): string => value ?? 'No disponible';
    const number = (value: number | null, suffix: string): string => value === null ? 'No disponible' : `${value.toLocaleString()} ${suffix}`;
    return [
      { label: 'ICAO', value: item.icao24 }, { label: 'Matrícula', value: text(item.registration) },
      { label: 'Tipo', value: text(item.aircraftType) }, { label: 'Operador', value: text(item.operator) },
      { label: 'Estado', value: item.isOnGround ? 'En tierra' : 'En vuelo' }, { label: 'Altitud', value: number(item.altitudeFeet, 'ft') },
      { label: 'Velocidad', value: number(item.groundSpeedKnots, 'kt') }, { label: 'Rumbo', value: number(item.headingDegrees, '°') },
      { label: 'Vel. vertical', value: number(item.verticalRateFeetPerMinute, 'ft/min') }, { label: 'Squawk', value: text(item.squawk) },
      { label: 'Coordenadas', value: item.latitude === null || item.longitude === null ? 'No disponible' : `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}` },
      { label: 'Último mensaje', value: item.secondsSinceLastMessage === null ? 'No disponible' : `hace ${item.secondsSinceLastMessage.toFixed(1)} s` },
      { label: 'Emergencia', value: item.emergency === 'none' ? 'Ninguna' : text(item.emergency) },
    ];
  }
}

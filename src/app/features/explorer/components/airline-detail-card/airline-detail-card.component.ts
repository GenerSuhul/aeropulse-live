import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Building2, LucideAngularModule } from 'lucide-angular';
import { Airline } from '../../models/airline.model';
import { FlightRoute } from '../../models/flight-route.model';

@Component({ selector: 'app-airline-detail-card', imports: [LucideAngularModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `<div class="space-y-4">@for (airline of airlines(); track airline.icao ?? airline.name ?? $index) {<article class="rounded-card border border-border bg-white p-4 shadow-card sm:p-5"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3"><div class="flex min-w-0 items-center gap-3"><span class="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><lucide-angular [img]="buildingIcon" [size]="20" aria-hidden="true"/></span><div class="min-w-0"><h3 class="truncate text-lg font-bold">{{ airline.name ?? 'Aerolínea' }}</h3><p class="truncate text-xs font-semibold text-ink-secondary">{{ airline.callsign ?? 'No disponible' }}</p></div></div><div class="flex flex-wrap gap-2">@if (airline.icao) {<span class="inline-flex items-center rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">ICAO {{ airline.icao }}</span>}@if (airline.iata) {<span class="inline-flex items-center rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">IATA {{ airline.iata }}</span>}</div></div><dl class="mt-4 grid gap-4 sm:grid-cols-2"><div class="min-w-0"><dt class="text-xs font-bold uppercase tracking-wide text-ink-muted">País</dt><dd class="mt-0.5 truncate text-sm font-semibold text-ink">{{ code(airline.country) }}</dd></div><div class="min-w-0"><dt class="text-xs font-bold uppercase tracking-wide text-ink-muted">Código de país</dt><dd class="mt-0.5 truncate text-sm font-semibold text-ink">{{ code(airline.countryIso) }}</dd></div></dl><div class="mt-4 border-t border-border pt-3"><h4 class="text-sm font-bold">Rutas consultadas</h4>@if (routesFor(airline).length > 0) {<ul class="mt-2 space-y-2">@for (route of routesFor(airline); track route.callsign) {<li class="flex min-h-12 items-center gap-3 rounded-lg bg-surface-muted px-3"><span class="shrink-0 font-bold">{{ route.callsign }}</span><span class="truncate text-xs font-semibold text-ink-secondary">{{ routeLabel(route) }}</span></li>}</ul>}@else {<p class="mt-1 text-sm text-ink-muted">Aún no hay rutas consultadas para esta aerolínea.</p>}</div></article>}</div>` })
export class AirlineDetailCardComponent {
  readonly airlines = input.required<readonly Airline[]>();
  readonly routes = input.required<readonly FlightRoute[]>();
  protected readonly buildingIcon = Building2;

  protected code(value: string | null): string { return value ?? '—'; }

  protected routesFor(airline: Airline): readonly FlightRoute[] {
    return this.routes().filter((route) => route.airline !== null
      && (route.airline.icao !== null && route.airline.icao === airline.icao
        || route.airline.iata !== null && route.airline.iata === airline.iata));
  }

  protected routeLabel(route: FlightRoute): string {
    const origin = route.origin?.icaoCode ?? route.origin?.iataCode ?? '—';
    const destination = route.destination?.icaoCode ?? route.destination?.iataCode ?? '—';
    return `${origin} → ${destination}`;
  }
}

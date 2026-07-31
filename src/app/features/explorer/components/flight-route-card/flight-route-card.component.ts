import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ArrowRight, LucideAngularModule, Route } from 'lucide-angular';
import { Airport } from '../../models/airport.model';
import { FlightRoute } from '../../models/flight-route.model';

interface AirportView {
  readonly code: string;
  readonly city: string;
  readonly name: string;
  readonly country: string;
}

@Component({ selector: 'app-flight-route-card', imports: [LucideAngularModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `<article class="rounded-card border border-border bg-white p-4 shadow-card sm:p-5"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3"><div class="flex min-w-0 items-center gap-3"><span class="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><lucide-angular [img]="routeIcon" [size]="20" aria-hidden="true"/></span><div class="min-w-0"><h3 class="truncate text-lg font-bold">{{ route().callsign }}</h3><p class="truncate text-xs font-semibold text-ink-secondary">{{ flightIdentifier() }}</p></div></div>@if (route().airline; as airline) {<span class="inline-flex max-w-full items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary"><span class="truncate">{{ airline.name }}</span>@if (airline.icao) {<span class="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px]">{{ airline.icao }}</span>}</span>}</div><div class="grid gap-4 pt-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">@let origin = airportView(route().origin);@let destination = airportView(route().destination);<div class="min-w-0"><p class="text-xs font-bold uppercase tracking-wide text-ink-muted">Origen</p><p class="mt-1 text-xl font-bold tracking-tight">{{ origin.code }}</p><p class="truncate text-sm font-semibold text-ink-secondary">{{ origin.city }}</p><p class="truncate text-xs text-ink-muted">{{ origin.name }}@if (origin.country !== '—') { · {{ origin.country }}}</p></div><span class="mx-auto grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"><lucide-angular [img]="arrowIcon" [size]="18" aria-hidden="true"/></span><div class="min-w-0"><p class="text-xs font-bold uppercase tracking-wide text-ink-muted">Destino</p><p class="mt-1 text-xl font-bold tracking-tight">{{ destination.code }}</p><p class="truncate text-sm font-semibold text-ink-secondary">{{ destination.city }}</p><p class="truncate text-xs text-ink-muted">{{ destination.name }}@if (destination.country !== '—') { · {{ destination.country }}}</p></div></div></article>` })
export class FlightRouteCardComponent {
  readonly route = input.required<FlightRoute>();
  protected readonly routeIcon = Route;
  protected readonly arrowIcon = ArrowRight;

  protected flightIdentifier(): string {
    const identifier = this.route().callsignIata ?? this.route().callsignIcao;
    return identifier ? `Vuelo ${identifier}` : 'Ruta establecida';
  }

  protected airportView(airport: Airport | null): AirportView {
    if (!airport) return { code: '—', city: '—', name: 'No disponible', country: '—' };
    return {
      code: airport.icaoCode ?? airport.iataCode ?? '—',
      city: airport.municipality ?? '—',
      name: airport.name ?? 'No disponible',
      country: airport.countryName ?? '—',
    };
  }
}

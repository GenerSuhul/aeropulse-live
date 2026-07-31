import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Clock, LucideAngularModule } from 'lucide-angular';
import { FlightRoute } from '../../models/flight-route.model';

@Component({ selector: 'app-consulted-flights-list', imports: [LucideAngularModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `<section class="rounded-card border border-border bg-white shadow-card" aria-label="Vuelos consultados"><div class="flex items-center gap-2 border-b border-border px-4 py-3"><lucide-angular [img]="clockIcon" [size]="18" class="text-primary" aria-hidden="true"/><h2 class="font-bold">Vuelos consultados</h2><span class="ml-auto rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">{{ flights().length }}</span></div>@if (flights().length > 0) {<ul class="divide-y divide-border">@for (route of flights(); track route.callsign) {<li><button type="button" (click)="flightSelect.emit(route)" [attr.aria-pressed]="isSelected(route)" class="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-surface-muted" [class.bg-primary-soft]="isSelected(route)"><div class="min-w-0 flex-1"><p class="truncate font-bold" [class.text-primary]="isSelected(route)">{{ route.callsign }}</p><p class="truncate text-xs font-semibold text-ink-secondary">{{ route.airline?.name ?? '—' }}</p></div><span class="shrink-0 text-xs font-bold text-ink-muted">{{ routeLabel(route) }}</span></button></li>}</ul>}@else {<div class="p-4"><p class="text-sm text-ink-muted">Los vuelos que consultes aparecerán aquí.</p></div>}</section>` })
export class ConsultedFlightsListComponent {
  readonly flights = input.required<readonly FlightRoute[]>();
  readonly selectedRoute = input.required<FlightRoute | null>();
  readonly flightSelect = output<FlightRoute>();
  protected readonly clockIcon = Clock;

  protected isSelected(route: FlightRoute): boolean {
    const selected = this.selectedRoute();
    return selected !== null && selected.callsign === route.callsign;
  }

  protected routeLabel(route: FlightRoute): string {
    const origin = route.origin?.icaoCode ?? route.origin?.iataCode ?? '—';
    const destination = route.destination?.icaoCode ?? route.destination?.iataCode ?? '—';
    return `${origin} → ${destination}`;
  }
}

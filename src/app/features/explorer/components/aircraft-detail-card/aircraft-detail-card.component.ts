import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule, Plane } from 'lucide-angular';
import { AircraftDetails } from '../../models/aircraft-details.model';

interface DetailRow {
  readonly label: string;
  readonly value: string;
}

@Component({ selector: 'app-aircraft-detail-card', imports: [LucideAngularModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `<article class="rounded-card border border-border bg-white p-4 shadow-card sm:p-5"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3"><div class="flex min-w-0 items-center gap-3"><span class="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><lucide-angular [img]="planeIcon" [size]="20" aria-hidden="true"/></span><div class="min-w-0"><h3 class="truncate text-lg font-bold">{{ aircraft().registration ?? 'Aeronave' }}</h3><p class="truncate text-xs font-semibold text-ink-secondary">{{ aircraft().type ?? 'No disponible' }}</p></div></div>@if (aircraft().operatorFlagCode; as code) {<span class="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">Operador {{ code }}</span>}</div>@if (aircraft().photoUrl; as photo) {<img [src]="photo" [alt]="'Fotografía de la aeronave ' + (aircraft().registration ?? '')" class="mt-4 h-40 w-full rounded-lg object-cover" loading="lazy"/>}<dl class="mt-4 grid gap-4 sm:grid-cols-2">@for (row of rows(); track row.label) {<div class="min-w-0"><dt class="text-xs font-bold uppercase tracking-wide text-ink-muted">{{ row.label }}</dt><dd class="mt-0.5 truncate text-sm font-semibold text-ink" [title]="row.value">{{ row.value }}</dd></div>}</dl></article>` })
export class AircraftDetailCardComponent {
  readonly aircraft = input.required<AircraftDetails>();
  protected readonly planeIcon = Plane;

  protected rows(): readonly DetailRow[] {
    const aircraft = this.aircraft();
    return [
      { label: 'Fabricante', value: aircraft.manufacturer ?? '—' },
      { label: 'Modelo', value: aircraft.icaoType ?? '—' },
      { label: 'Código hex (Mode S)', value: aircraft.modeS ?? '—' },
      { label: 'Dueño registrado', value: aircraft.registeredOwner ?? '—' },
      { label: 'País del propietario', value: aircraft.ownerCountryName ?? '—' },
      { label: 'Matrícula', value: aircraft.registration ?? '—' },
    ];
  }
}

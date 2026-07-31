import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Activity, Gauge, LucideAngularModule, Navigation, PlaneLanding } from 'lucide-angular';
import { RadarMetrics } from '../../models/radar-metrics.model';

@Component({
  selector: 'app-radar-stats', host: { class: 'block min-w-0' }, imports: [LucideAngularModule], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4" aria-label="Métricas del radar">
      @for (card of cards(); track card.label) {
        <article class="min-w-0 overflow-hidden rounded-card border border-border bg-white p-3 shadow-card sm:p-4">
          <div class="flex items-start justify-between gap-2 sm:gap-3"><div class="min-w-0"><p class="truncate text-[11px] font-semibold text-ink-secondary sm:text-sm">{{ card.label }}</p><p class="mt-1 truncate text-xl font-bold tracking-tight sm:mt-2 sm:text-3xl">{{ card.value }}</p><p class="mt-1 hidden truncate text-xs text-ink-muted sm:block">{{ card.note }}</p></div><span class="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary sm:size-10 sm:rounded-xl"><lucide-angular [img]="card.icon" [size]="19" aria-hidden="true" /></span></div>
        </article>
      }
    </section>
  `,
})
export class RadarStatsComponent {
  readonly metrics = input.required<RadarMetrics>();
  protected readonly cards = computed(() => {
    const value = this.metrics();
    return [
      { label: 'Aeronaves detectadas', value: value.totalAircraft.toLocaleString(), note: 'En la cobertura elegida', icon: Activity },
      { label: 'En vuelo', value: value.airborneAircraft.toLocaleString(), note: 'Posiciones activas', icon: Navigation },
      { label: 'En tierra', value: value.onGroundAircraft.toLocaleString(), note: 'Confirmadas por ADS-B', icon: PlaneLanding },
      { label: 'Altitud promedio', value: value.averageAltitude === null ? '—' : `${value.averageAltitude.toLocaleString()} ft`, note: value.averageSpeed === null ? 'Velocidad no disponible' : `${value.averageSpeed.toLocaleString()} kt promedio`, icon: Gauge },
    ];
  });
}

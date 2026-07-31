import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Activity, Gauge, LucideAngularModule, Navigation, PlaneLanding } from 'lucide-angular';
import { RadarMetrics } from '../../models/radar-metrics.model';

@Component({
  selector: 'app-radar-stats', host: { class: 'block min-w-0' }, imports: [LucideAngularModule], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Métricas del radar">
      @for (card of cards(); track card.label) {
        <article class="min-w-0 overflow-hidden rounded-card border border-border bg-white p-4 shadow-card sm:p-5">
          <div class="flex items-start justify-between gap-3"><div><p class="text-xs font-semibold text-ink-secondary sm:text-sm">{{ card.label }}</p><p class="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{{ card.value }}</p><p class="mt-1 text-xs text-ink-muted">{{ card.note }}</p></div><span class="grid size-10 shrink-0 place-items-center rounded-xl" [class]="card.iconClass"><lucide-angular [img]="card.icon" [size]="21" aria-hidden="true" /></span></div>
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
      { label: 'Aeronaves detectadas', value: value.totalAircraft.toLocaleString(), note: 'Dentro del radio', icon: Activity, iconClass: 'bg-primary-soft text-primary' },
      { label: 'En vuelo', value: value.airborneAircraft.toLocaleString(), note: 'Posiciones activas', icon: Navigation, iconClass: 'bg-success-soft text-success' },
      { label: 'En tierra', value: value.onGroundAircraft.toLocaleString(), note: 'Altitud ground', icon: PlaneLanding, iconClass: 'bg-warning-soft text-warning' },
      { label: 'Altitud promedio', value: value.averageAltitude === null ? '—' : `${value.averageAltitude.toLocaleString()} ft`, note: value.averageSpeed === null ? 'Velocidad no disponible' : `${value.averageSpeed.toLocaleString()} kt promedio`, icon: Gauge, iconClass: 'bg-purple-50 text-secondary' },
    ];
  });
}

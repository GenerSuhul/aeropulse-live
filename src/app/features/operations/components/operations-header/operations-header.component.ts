import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-operations-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Centro de operaciones</h1>
        <p class="mt-1 max-w-2xl text-sm text-ink-secondary">Supervisa tu flota de interés: watchlist, alertas por umbral y registro de eventos operativos.</p>
      </div>
      <dl class="grid grid-cols-3 gap-2">
        @for (metric of metrics(); track metric.label) {
          <div class="rounded-card border border-border bg-white px-4 py-3 text-center shadow-card">
            <dt class="text-xs font-semibold text-ink-muted">{{ metric.label }}</dt>
            <dd class="mt-0.5 text-2xl font-bold tracking-tight text-primary">{{ metric.value }}</dd>
          </div>
        }
      </dl>
    </header>
  `,
})
export class OperationsHeaderComponent {
  readonly watchlistCount = input(0);
  readonly alertsCount = input(0);
  readonly eventsCount = input(0);
  protected readonly metrics = computed(() => [
    { label: 'En seguimiento', value: this.watchlistCount() },
    { label: 'Alertas activas', value: this.alertsCount() },
    { label: 'Eventos', value: this.eventsCount() },
  ]);
}

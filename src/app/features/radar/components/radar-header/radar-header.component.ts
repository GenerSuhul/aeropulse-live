import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, RefreshCw } from 'lucide-angular';
import { RadarProviderMode } from '../../services/radar.facade';

@Component({
  selector: 'app-radar-header',
  host: { class: 'block min-w-0' },
  imports: [DatePipe, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <nav class="mb-2 flex items-center gap-2 text-sm text-ink-secondary" aria-label="Breadcrumb"><span class="font-semibold text-primary">Monitoreo</span><span aria-hidden="true">/</span><span>Radar Live</span></nav>
        <div class="flex flex-wrap items-center gap-3"><h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Radar Live</h1><span class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold" [class]="status().classes"><span class="size-2 rounded-full" [class.animate-pulse]="refreshing()" [class]="status().dot"></span>{{ status().label }}</span></div>
        <p class="mt-2 max-w-2xl text-sm text-ink-secondary sm:text-base">Seguimiento geoespacial de aeronaves con actualización periódica desde ADSB.lol.</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-right text-xs text-ink-secondary"><span class="block font-semibold text-ink">Última actualización</span>{{ lastUpdated() ? (lastUpdated() | date:'HH:mm:ss') : 'Pendiente' }}</span>
        <button type="button" (click)="refresh.emit()" [disabled]="refreshing()" class="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 font-bold text-white shadow-sm hover:bg-primary-dark disabled:opacity-60"><lucide-angular [img]="refreshIcon" [size]="17" [class.animate-spin]="refreshing()" aria-hidden="true" />Actualizar</button>
      </div>
    </header>
  `,
})
export class RadarHeaderComponent {
  readonly refreshing = input(false);
  readonly online = input(true);
  readonly providerMode = input<RadarProviderMode>('real');
  readonly lastUpdated = input<Date | null>(null);
  readonly refresh = output<void>();
  protected readonly refreshIcon = RefreshCw;
  protected readonly status = computed(() => {
    if (!this.online()) return { label: 'Sin conexión', classes: 'bg-danger-soft text-danger', dot: 'bg-danger' };
    if (this.providerMode() === 'mock') return { label: 'Datos simulados', classes: 'bg-warning-soft text-warning', dot: 'bg-warning' };
    if (this.refreshing()) return { label: 'Actualizando', classes: 'bg-primary-soft text-primary', dot: 'bg-primary' };
    return { label: 'En vivo', classes: 'bg-success-soft text-success', dot: 'bg-success' };
  });
}

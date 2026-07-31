import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, RefreshCw } from 'lucide-angular';

@Component({
  selector: 'app-radar-header',
  host: { class: 'block min-w-0' },
  imports: [DatePipe, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="min-w-0">
        <nav class="mb-2 hidden items-center gap-2 text-sm text-ink-secondary sm:flex" aria-label="Breadcrumb"><span class="font-semibold text-primary">Monitoreo</span><span aria-hidden="true">/</span><span>Radar Live</span></nav>
        <div class="flex flex-wrap items-center gap-2 sm:gap-3"><h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Radar Live</h1><span class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold" [class]="status().classes"><span class="size-2 rounded-full" [class.animate-pulse]="refreshing()" [class]="status().dot"></span>{{ status().label }}</span></div>
        <p class="mt-2 hidden max-w-2xl text-sm text-ink-secondary sm:block sm:text-base">Explora el tráfico aéreo mundial en tiempo real y cambia de continente o país sin introducir coordenadas.</p>
      </div>
      <div class="flex shrink-0 items-center justify-between gap-3 sm:justify-start">
        <span class="text-right text-xs text-ink-secondary"><span class="block font-semibold text-ink">Última actualización</span>{{ lastUpdated() ? (lastUpdated() | date:'HH:mm:ss') : 'Pendiente' }}</span>
        <button type="button" (click)="refresh.emit()" [disabled]="refreshing()" class="inline-flex size-11 items-center justify-center gap-2 rounded-lg bg-primary font-bold text-white shadow-sm hover:bg-primary-dark disabled:opacity-60 sm:w-auto sm:px-4" aria-label="Actualizar tráfico"><lucide-angular [img]="refreshIcon" [size]="17" [class.animate-spin]="refreshing()" aria-hidden="true" /><span class="hidden sm:inline">Actualizar</span></button>
      </div>
    </header>
  `,
})
export class RadarHeaderComponent {
  readonly refreshing = input(false);
  readonly online = input(true);
  readonly lastUpdated = input<Date | null>(null);
  readonly refresh = output<void>();
  protected readonly refreshIcon = RefreshCw;
  protected readonly status = computed(() => {
    if (!this.online()) return { label: 'Sin conexión', classes: 'bg-danger-soft text-danger', dot: 'bg-danger' };
    if (this.refreshing()) return { label: 'Actualizando', classes: 'bg-primary-soft text-primary', dot: 'bg-primary' };
    return { label: 'En vivo', classes: 'bg-success-soft text-success', dot: 'bg-success' };
  });
}

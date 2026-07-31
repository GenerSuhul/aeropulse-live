import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Database, LucideAngularModule } from 'lucide-angular';

@Component({ selector: 'app-explorer-header', imports: [LucideAngularModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `<header class="flex flex-wrap items-end justify-between gap-4"><div class="min-w-0"><h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Explorador de vuelos</h1><p class="mt-1 max-w-2xl text-sm text-ink-secondary">Rutas establecidas, aeronaves y operadores reales desde ADSBDB, sin seguimiento geográfico.</p></div><div class="flex flex-wrap items-center gap-3"><span class="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-bold" [class.text-success]="online()" [class.text-danger]="!online()"><span class="size-2 rounded-full" [class.bg-success]="online()" [class.bg-danger]="!online()"></span>ADSBDB · {{ online() ? 'en línea' : 'no disponible' }}</span><p class="flex items-center gap-1.5 text-xs font-semibold text-ink-muted"><lucide-angular [img]="databaseIcon" [size]="14" aria-hidden="true"/>Última consulta: {{ lastUpdatedLabel() }}</p></div></header>` })
export class ExplorerHeaderComponent {
  readonly online = input.required<boolean>();
  readonly lastUpdated = input.required<Date | null>();
  protected readonly databaseIcon = Database;

  protected lastUpdatedLabel(): string {
    const date = this.lastUpdated();
    if (!date) return '—';
    return date.toLocaleTimeString();
  }
}

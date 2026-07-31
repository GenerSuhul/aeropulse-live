import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({ selector: 'app-explorer-loading', changeDetection: ChangeDetectionStrategy.OnPush, template: `<div class="grid min-h-64 place-items-center rounded-card border border-border bg-white p-6 shadow-card" role="status"><div class="text-center"><span class="mx-auto block size-10 animate-spin rounded-full border-4 border-primary-soft border-t-primary"></span><p class="mt-3 font-bold">Consultando ADSBDB</p><p class="mt-1 text-sm text-ink-secondary">Resolviendo aeronave, operador y ruta establecida…</p></div></div>` })
export class ExplorerLoadingComponent {}

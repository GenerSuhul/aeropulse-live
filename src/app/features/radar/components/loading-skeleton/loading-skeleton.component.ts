import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({ selector: 'app-loading-skeleton', changeDetection: ChangeDetectionStrategy.OnPush, template: `<div class="absolute inset-0 z-10 grid place-items-center bg-white/90" role="status"><div class="text-center"><span class="mx-auto block size-10 animate-spin rounded-full border-4 border-primary-soft border-t-primary"></span><p class="mt-3 font-bold">Preparando Radar Live</p><p class="mt-1 text-sm text-ink-secondary">Consultando aeronaves y cargando el mapa…</p></div></div>` })
export class LoadingSkeletonComponent {}

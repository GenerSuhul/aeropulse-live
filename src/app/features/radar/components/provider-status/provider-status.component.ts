import { ChangeDetectionStrategy, Component } from '@angular/core';
@Component({ selector: 'app-provider-status', host: { class: 'block min-w-0' }, changeDetection: ChangeDetectionStrategy.OnPush, template: `<p class="flex items-center gap-2 text-xs font-semibold text-ink-secondary"><span class="size-2 rounded-full bg-success"></span>Fuente: OpenSky Network · datos reales</p>` })
export class ProviderStatusComponent {}

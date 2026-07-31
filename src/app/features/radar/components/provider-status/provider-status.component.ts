import { ChangeDetectionStrategy, Component } from '@angular/core';
@Component({ selector: 'app-provider-status', host: { class: 'block min-w-0' }, changeDetection: ChangeDetectionStrategy.OnPush, template: `<p class="flex items-center gap-2 text-xs font-semibold text-ink-secondary"><span class="size-2 shrink-0 rounded-full bg-success"></span><span class="truncate">OpenSky Network · datos reales</span></p>` })
export class ProviderStatusComponent {}

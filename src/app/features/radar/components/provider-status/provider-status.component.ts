import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RadarProviderMode } from '../../services/radar.facade';

@Component({ selector: 'app-provider-status', host: { class: 'block min-w-0' }, changeDetection: ChangeDetectionStrategy.OnPush, template: `<p class="flex items-center gap-2 text-xs font-semibold text-ink-secondary"><span class="size-2 rounded-full" [class.bg-success]="mode() === 'real'" [class.bg-warning]="mode() === 'mock'"></span>Fuente: {{ mode() === 'real' ? 'ADSB.lol' : 'simulador local' }}</p>` })
export class ProviderStatusComponent { readonly mode = input<RadarProviderMode>('real'); }

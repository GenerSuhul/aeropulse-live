import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Crosshair, Eye, EyeOff, LocateFixed, LucideAngularModule, Pause, Play, RefreshCw } from 'lucide-angular';

@Component({
  selector: 'app-radar-toolbar', host: { class: 'block min-w-0' }, imports: [LucideAngularModule], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap items-center gap-2 border-b border-border bg-white p-3" role="toolbar" aria-label="Herramientas del mapa">
      <button type="button" (click)="refresh.emit()" class="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-xs font-bold text-ink-secondary hover:bg-surface-muted hover:text-ink"><lucide-angular [img]="icons.RefreshCw" [size]="16" />Actualizar</button>
      <button type="button" (click)="autoRefreshChange.emit(!autoRefresh())" class="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-xs font-bold text-ink-secondary hover:bg-surface-muted hover:text-ink"><lucide-angular [img]="autoRefresh() ? icons.Pause : icons.Play" [size]="16" />{{ autoRefresh() ? 'Pausar' : 'Reanudar' }}</button>
      <button type="button" (click)="fitAll.emit()" class="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-xs font-bold text-ink-secondary hover:bg-surface-muted hover:text-ink"><lucide-angular [img]="icons.LocateFixed" [size]="16" />Ver todos</button>
      <button type="button" (click)="centerSelected.emit()" [disabled]="!hasSelection()" class="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-xs font-bold text-ink-secondary hover:bg-surface-muted hover:text-ink disabled:opacity-45"><lucide-angular [img]="icons.Crosshair" [size]="16" />Centrar</button>
      <button type="button" (click)="trajectoryChange.emit(!showTrajectory())" class="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-xs font-bold text-ink-secondary hover:bg-surface-muted hover:text-ink"><lucide-angular [img]="showTrajectory() ? icons.EyeOff : icons.Eye" [size]="16" />{{ showTrajectory() ? 'Ocultar ruta' : 'Mostrar ruta' }}</button>
    </div>
  `,
})
export class RadarToolbarComponent {
  readonly autoRefresh = input(true); readonly hasSelection = input(false); readonly showTrajectory = input(true);
  readonly refresh = output<void>(); readonly autoRefreshChange = output<boolean>(); readonly fitAll = output<void>(); readonly centerSelected = output<void>(); readonly trajectoryChange = output<boolean>();
  protected readonly icons = { Crosshair, Eye, EyeOff, LocateFixed, Pause, Play, RefreshCw };
}

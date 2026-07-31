import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Crosshair, Eye, EyeOff, LocateFixed, LucideAngularModule, Pause, Play, RefreshCw } from 'lucide-angular';

@Component({
  selector: 'app-radar-toolbar', host: { class: 'block min-w-0' }, imports: [LucideAngularModule], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-5 gap-2 border-b border-border bg-white p-3 sm:flex sm:flex-wrap sm:items-center" role="toolbar" aria-label="Herramientas del mapa">
      <button type="button" (click)="refresh.emit()" class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg border border-border text-xs font-bold text-ink-secondary hover:bg-surface-muted hover:text-ink sm:px-3" aria-label="Actualizar posiciones" title="Actualizar"><lucide-angular [img]="icons.RefreshCw" [size]="17" aria-hidden="true" /><span class="hidden truncate sm:inline">Actualizar</span></button>
      <button type="button" (click)="autoRefreshChange.emit(!autoRefresh())" class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg border border-border text-xs font-bold text-ink-secondary hover:bg-surface-muted hover:text-ink sm:px-3" [attr.aria-label]="autoRefresh() ? 'Pausar actualización automática' : 'Reanudar actualización automática'" [attr.title]="autoRefresh() ? 'Pausar' : 'Reanudar'"><lucide-angular [img]="autoRefresh() ? icons.Pause : icons.Play" [size]="17" aria-hidden="true" /><span class="hidden truncate sm:inline">{{ autoRefresh() ? 'Pausar' : 'Reanudar' }}</span></button>
      <button type="button" (click)="fitAll.emit()" class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg border border-border text-xs font-bold text-ink-secondary hover:bg-surface-muted hover:text-ink sm:px-3" aria-label="Ver todas las aeronaves" title="Ver todos"><lucide-angular [img]="icons.LocateFixed" [size]="17" aria-hidden="true" /><span class="hidden truncate sm:inline">Ver todos</span></button>
      <button type="button" (click)="centerSelected.emit()" [disabled]="!hasSelection()" class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg border border-border text-xs font-bold text-ink-secondary hover:bg-surface-muted hover:text-ink disabled:opacity-45 sm:px-3" aria-label="Centrar aeronave seleccionada" title="Centrar"><lucide-angular [img]="icons.Crosshair" [size]="17" aria-hidden="true" /><span class="hidden truncate sm:inline">Centrar</span></button>
      <button type="button" (click)="trajectoryChange.emit(!showTrajectory())" class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg border border-border text-xs font-bold text-ink-secondary hover:bg-surface-muted hover:text-ink sm:ml-auto sm:px-3" [attr.aria-label]="showTrajectory() ? 'Ocultar ruta' : 'Mostrar ruta'" [attr.title]="showTrajectory() ? 'Ocultar ruta' : 'Mostrar ruta'"><lucide-angular [img]="showTrajectory() ? icons.EyeOff : icons.Eye" [size]="17" aria-hidden="true" /><span class="hidden truncate sm:inline">{{ showTrajectory() ? 'Ocultar ruta' : 'Mostrar ruta' }}</span></button>
    </div>
  `,
})
export class RadarToolbarComponent {
  readonly autoRefresh = input(true); readonly hasSelection = input(false); readonly showTrajectory = input(true);
  readonly refresh = output<void>(); readonly autoRefreshChange = output<boolean>(); readonly fitAll = output<void>(); readonly centerSelected = output<void>(); readonly trajectoryChange = output<boolean>();
  protected readonly icons = { Crosshair, Eye, EyeOff, LocateFixed, Pause, Play, RefreshCw };
}

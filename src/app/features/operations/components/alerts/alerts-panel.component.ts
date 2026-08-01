import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Bell, Plus, LucideAngularModule } from 'lucide-angular';
import { OperationsAlert, OperationsAlertDraft } from '../../models/operations-alert.model';
import { WatchlistDraft } from '../../models/watchlist-item.model';
import { AlertFormComponent } from './alert-form.component';
import { AlertItemComponent } from './alert-item.component';

@Component({
  selector: 'app-alerts-panel',
  imports: [LucideAngularModule, AlertFormComponent, AlertItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-3" aria-label="Alertas">
      <div class="flex items-center gap-2">
        <h2 class="text-xl font-bold">Alertas</h2>
        <span class="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">{{ items().length }}</span>
        <button type="button" (click)="adding.update((open) => !open)" class="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white hover:bg-primary-dark">
          <lucide-angular [img]="icons.Plus" [size]="17" aria-hidden="true" />Nueva alerta
        </button>
      </div>
      @if (adding()) {
        <app-alert-form [initial]="prefill()" (create)="create.emit($event)" (dismiss)="adding.set(false)" />
      }
      @if (items().length === 0 && !adding()) {
        <div class="rounded-card border border-border bg-white p-8 text-center shadow-card">
          <span class="mx-auto grid size-14 place-items-center rounded-full bg-primary-soft text-primary">
            <lucide-angular [img]="icons.Bell" [size]="26" aria-hidden="true" />
          </span>
          <p class="mt-4 font-bold">Sin alertas configuradas</p>
          <p class="mt-1 text-sm text-ink-secondary">Crea un umbral de altitud, velocidad o velocidad vertical para una aeronave.</p>
        </div>
      } @else {
        <ul class="space-y-3">
          @for (alert of items(); track alert.id) {
            <app-alert-item [item]="alert" (toggleAlert)="toggleAlert.emit($event)" (remove)="remove.emit($event)" />
          }
        </ul>
      }
    </section>
  `,
})
export class AlertsPanelComponent {
  readonly items = input.required<readonly OperationsAlert[]>();
  readonly prefill = input<WatchlistDraft | null>(null);
  readonly create = output<OperationsAlertDraft>();
  readonly toggleAlert = output<string>();
  readonly remove = output<string>();
  protected readonly adding = signal(false);
  protected readonly icons = { Bell, Plus };
}

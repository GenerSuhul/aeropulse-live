import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CalendarDays, Plus, LucideAngularModule } from 'lucide-angular';
import { OperationsEvent, OperationsEventDraft } from '../../models/operations-event.model';
import { EventFormComponent } from './event-form.component';
import { EventItemComponent } from './event-item.component';

@Component({
  selector: 'app-events-panel',
  imports: [LucideAngularModule, EventFormComponent, EventItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-3" aria-label="Eventos">
      <div class="flex items-center gap-2">
        <h2 class="text-xl font-bold">Eventos</h2>
        <span class="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">{{ items().length }}</span>
        <button type="button" (click)="adding.update((open) => !open)" class="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white hover:bg-primary-dark">
          <lucide-angular [img]="icons.Plus" [size]="17" aria-hidden="true" />Registrar evento
        </button>
      </div>
      @if (adding()) {
        <app-event-form [initial]="prefillAircraftId()" (create)="create.emit($event)" (cancel)="adding.set(false)" />
      }
      @if (items().length === 0 && !adding()) {
        <div class="rounded-card border border-border bg-white p-8 text-center shadow-card">
          <span class="mx-auto grid size-14 place-items-center rounded-full bg-primary-soft text-primary">
            <lucide-angular [img]="icons.CalendarDays" [size]="26" aria-hidden="true" />
          </span>
          <p class="mt-4 font-bold">Sin eventos registrados</p>
          <p class="mt-1 text-sm text-ink-secondary">Documenta salidas, arribos, incidentes o tareas de mantenimiento.</p>
        </div>
      } @else {
        <ul class="space-y-3">
          @for (event of items(); track event.id) {
            <app-event-item [item]="event" (remove)="remove.emit($event)" />
          }
        </ul>
      }
    </section>
  `,
})
export class EventsPanelComponent {
  readonly items = input.required<readonly OperationsEvent[]>();
  readonly prefillAircraftId = input<string | null>(null);
  readonly create = output<OperationsEventDraft>();
  readonly remove = output<string>();
  protected readonly adding = signal(false);
  protected readonly icons = { CalendarDays, Plus };
}

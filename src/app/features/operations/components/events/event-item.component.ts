import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CalendarDays, Plane, Trash2, LucideAngularModule } from 'lucide-angular';
import { OperationsEvent, OperationsEventType } from '../../models/operations-event.model';

const TYPE_LABELS: Record<OperationsEventType, string> = {
  departure: 'Salida',
  arrival: 'Arribo',
  incident: 'Incidente',
  maintenance: 'Mantenimiento',
  other: 'Otro',
};

@Component({
  selector: 'app-event-item',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <li class="rounded-card border border-border bg-white p-4 shadow-card">
      <div class="flex items-start gap-3">
        <span class="grid size-11 shrink-0 place-items-center rounded-lg" [class]="typeTone()">
          <lucide-angular [img]="icons.Plane" [size]="20" aria-hidden="true" />
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-bold">{{ item().title }}</p>
            <span class="rounded-full px-2.5 py-0.5 text-xs font-bold" [class]="typeTone()">{{ typeLabel() }}</span>
          </div>
          @if (item().description) { <p class="mt-1 text-sm text-ink-secondary">{{ item().description }}</p> }
          <p class="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
            <lucide-angular [img]="icons.CalendarDays" [size]="14" aria-hidden="true" />{{ occurredAtLabel() }}
            @if (item().aircraftId; as aircraftId) { · ICAO {{ aircraftId.toUpperCase() }} }
          </p>
        </div>
        <button type="button" (click)="remove.emit(item().id)" class="grid size-11 shrink-0 place-items-center rounded-lg text-ink-secondary hover:bg-danger-soft hover:text-danger" [attr.aria-label]="'Eliminar evento ' + item().title">
          <lucide-angular [img]="icons.Trash2" [size]="18" aria-hidden="true" />
        </button>
      </div>
    </li>
  `,
})
export class EventItemComponent {
  readonly item = input.required<OperationsEvent>();
  readonly remove = output<string>();
  protected readonly icons = { CalendarDays, Plane, Trash2 };

  protected typeLabel(): string { return TYPE_LABELS[this.item().type]; }
  protected typeTone(): string {
    const type = this.item().type;
    if (type === 'incident') return 'bg-danger-soft text-danger';
    if (type === 'maintenance') return 'bg-warning-soft text-warning';
    if (type === 'departure') return 'bg-primary-soft text-primary';
    if (type === 'arrival') return 'bg-success-soft text-success';
    return 'border border-border bg-surface-muted text-ink-secondary';
  }
  protected occurredAtLabel(): string { return this.item().occurredAt.toLocaleString(); }
}

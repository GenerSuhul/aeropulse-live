import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Bell, Power, Trash2, LucideAngularModule } from 'lucide-angular';
import { AlertMetric, AlertOperator, AlertSeverity, OperationsAlert } from '../../models/operations-alert.model';

const METRIC_LABELS: Record<AlertMetric, string> = {
  altitude: 'Altitud',
  groundSpeed: 'Velocidad',
  verticalRate: 'Velocidad vertical',
};

const METRIC_UNITS: Record<AlertMetric, string> = {
  altitude: 'ft',
  groundSpeed: 'kt',
  verticalRate: 'ft/min',
};

const OPERATOR_LABELS: Record<AlertOperator, string> = {
  above: 'supera',
  below: 'desciende por debajo de',
};

const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  info: 'Informativa',
  warning: 'Precaución',
  critical: 'Crítica',
};

@Component({
  selector: 'app-alert-item',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <li class="rounded-card border border-border bg-white p-4 shadow-card" [class.opacity-60]="!item().enabled">
      <div class="flex items-start gap-3">
        <span class="grid size-11 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
          <lucide-angular [img]="icons.Bell" [size]="20" aria-hidden="true" />
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-bold">{{ item().name }}</p>
            <span class="rounded-full px-2.5 py-0.5 text-xs font-bold" [class]="severityClass()">{{ severityLabel() }}</span>
          </div>
          <p class="mt-1 text-sm font-semibold text-ink-secondary">
            {{ metricLabel() }} {{ operatorLabel() }} {{ item().threshold.toLocaleString() }} {{ metricUnit() }}
          </p>
          <p class="mt-0.5 text-xs font-semibold text-ink-muted">
            {{ target() }} · creada {{ createdAtLabel() }}
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-1">
          <button type="button" (click)="toggleAlert.emit(item().id)" [attr.aria-pressed]="item().enabled"
            class="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-bold"
            [class.bg-success-soft]="item().enabled" [class.text-success]="item().enabled" [class.text-ink-secondary]="!item().enabled">
            <lucide-angular [img]="icons.Power" [size]="16" aria-hidden="true" />{{ item().enabled ? 'Activa' : 'Pausada' }}
          </button>
          <button type="button" (click)="remove.emit(item().id)" class="grid size-11 shrink-0 place-items-center rounded-lg text-ink-secondary hover:bg-danger-soft hover:text-danger" [attr.aria-label]="'Eliminar alerta ' + item().name">
            <lucide-angular [img]="icons.Trash2" [size]="18" aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  `,
})
export class AlertItemComponent {
  readonly item = input.required<OperationsAlert>();
  readonly toggleAlert = output<string>();
  readonly remove = output<string>();
  protected readonly icons = { Bell, Power, Trash2 };

  protected metricLabel(): string { return METRIC_LABELS[this.item().metric]; }
  protected metricUnit(): string { return METRIC_UNITS[this.item().metric]; }
  protected operatorLabel(): string { return OPERATOR_LABELS[this.item().operator]; }
  protected severityLabel(): string { return SEVERITY_LABELS[this.item().severity]; }
  protected severityClass(): string {
    const severity = this.item().severity;
    if (severity === 'critical') return 'bg-danger-soft text-danger';
    if (severity === 'warning') return 'bg-warning-soft text-warning';
    return 'border border-border bg-surface-muted text-ink-secondary';
  }
  protected target(): string { return this.item().callsign ?? this.item().aircraftId.toUpperCase(); }
  protected createdAtLabel(): string { return this.item().createdAt.toLocaleString(); }
}

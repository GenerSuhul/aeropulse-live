import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Plus, X, LucideAngularModule } from 'lucide-angular';
import { AlertMetric, AlertOperator, AlertSeverity, OperationsAlertDraft } from '../../models/operations-alert.model';
import { WatchlistDraft } from '../../models/watchlist-item.model';

const ICAO24_PATTERN = /^[0-9a-fA-F]{6}$/;

@Component({
  selector: 'app-alert-form',
  imports: [ReactiveFormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="rounded-card border border-border bg-white p-4 shadow-card sm:p-5" novalidate>
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="font-bold">Crear alerta</h3>
          <p class="mt-1 text-sm text-ink-secondary">Define un umbral sobre el tráfico de la aeronave.</p>
        </div>
        <button type="button" (click)="dismiss.emit()" class="grid size-11 shrink-0 place-items-center rounded-lg text-ink-secondary hover:bg-surface-muted" aria-label="Cancelar">
          <lucide-angular [img]="icons.X" [size]="19" aria-hidden="true" />
        </button>
      </div>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-secondary" for="alert-name">Nombre</label>
          <input id="alert-name" formControlName="name" autocomplete="off" spellcheck="false" placeholder="Ej. Ascenso UAL1234"
            class="min-h-11 w-full rounded-lg border border-border px-3 focus:border-primary focus:outline-none"
            [class.border-danger]="form.controls.name.invalid && form.controls.name.touched" aria-describedby="alert-name-error" />
          @if (form.controls.name.invalid && form.controls.name.touched) { <p id="alert-name-error" class="mt-1 text-xs font-semibold text-danger">Ingresa un nombre para la alerta.</p> }
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-secondary" for="alert-aircraft-id">ICAO (hex)</label>
          <input id="alert-aircraft-id" formControlName="aircraftId" autocomplete="off" spellcheck="false" placeholder="Ej. a9972b"
            class="min-h-11 w-full rounded-lg border border-border px-3 focus:border-primary focus:outline-none"
            [class.border-danger]="form.controls.aircraftId.invalid && form.controls.aircraftId.touched" aria-describedby="alert-aircraft-id-error" />
          @if (form.controls.aircraftId.invalid && form.controls.aircraftId.touched) { <p id="alert-aircraft-id-error" class="mt-1 text-xs font-semibold text-danger">Ingresa un código hexadecimal de 6 caracteres.</p> }
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-secondary" for="alert-metric">Métrica</label>
          <select id="alert-metric" formControlName="metric" class="min-h-11 w-full rounded-lg border border-border bg-white px-3 focus:border-primary focus:outline-none">
            @for (option of metricOptions; track option.id) { <option [value]="option.id">{{ option.label }}</option> }
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-secondary" for="alert-operator">Condición</label>
          <select id="alert-operator" formControlName="operator" class="min-h-11 w-full rounded-lg border border-border bg-white px-3 focus:border-primary focus:outline-none">
            @for (option of operatorOptions; track option.id) { <option [value]="option.id">{{ option.label }}</option> }
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-secondary" for="alert-threshold">Umbral {{ unit() }}</label>
          <input id="alert-threshold" formControlName="threshold" type="number" min="0" step="1" placeholder="Ej. 10000"
            class="min-h-11 w-full rounded-lg border border-border px-3 focus:border-primary focus:outline-none"
            [class.border-danger]="form.controls.threshold.invalid && form.controls.threshold.touched" aria-describedby="alert-threshold-error" />
          @if (form.controls.threshold.invalid && form.controls.threshold.touched) { <p id="alert-threshold-error" class="mt-1 text-xs font-semibold text-danger">El umbral debe ser un número mayor o igual a 0.</p> }
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-secondary" for="alert-severity">Severidad</label>
          <select id="alert-severity" formControlName="severity" class="min-h-11 w-full rounded-lg border border-border bg-white px-3 focus:border-primary focus:outline-none">
            @for (option of severityOptions; track option.id) { <option [value]="option.id">{{ option.label }}</option> }
          </select>
        </div>
        <label class="flex min-h-11 items-center gap-3 sm:col-span-2">
          <input formControlName="enabled" type="checkbox" class="size-5 rounded border-border text-primary focus:border-primary focus:outline-none" />
          <span class="text-sm font-semibold">Activar inmediatamente</span>
        </label>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <button type="submit" [disabled]="form.invalid" class="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 font-bold text-white hover:bg-primary-dark disabled:opacity-50">
          <lucide-angular [img]="icons.Plus" [size]="17" aria-hidden="true" />Crear alerta
        </button>
        <button type="button" (click)="dismiss.emit()" class="min-h-11 rounded-lg border border-border bg-white px-4 font-bold text-ink-secondary hover:bg-surface-muted">Cancelar</button>
      </div>
    </form>
  `,
})
export class AlertFormComponent {
  readonly initial = input<WatchlistDraft | null>(null);
  readonly create = output<OperationsAlertDraft>();
  readonly dismiss = output<void>();
  protected readonly icons = { Plus, X };
  protected readonly metricOptions: readonly { id: AlertMetric; label: string }[] = [
    { id: 'altitude', label: 'Altitud' },
    { id: 'groundSpeed', label: 'Velocidad' },
    { id: 'verticalRate', label: 'Velocidad vertical' },
  ];
  protected readonly operatorOptions: readonly { id: AlertOperator; label: string }[] = [
    { id: 'above', label: 'Supera' },
    { id: 'below', label: 'Desciende por debajo de' },
  ];
  protected readonly severityOptions: readonly { id: AlertSeverity; label: string }[] = [
    { id: 'info', label: 'Informativa' },
    { id: 'warning', label: 'Precaución' },
    { id: 'critical', label: 'Crítica' },
  ];
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    aircraftId: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(ICAO24_PATTERN)] }),
    metric: new FormControl<AlertMetric>('altitude', { nonNullable: true }),
    operator: new FormControl<AlertOperator>('above', { nonNullable: true }),
    threshold: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
    severity: new FormControl<AlertSeverity>('warning', { nonNullable: true }),
    enabled: new FormControl(true, { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const value = this.initial();
      if (value && !this.form.dirty) {
        this.form.patchValue({ aircraftId: value.aircraftId }, { emitEvent: false });
      }
    });
  }

  protected unit(): string {
    const metric = this.form.controls.metric.value;
    if (metric === 'altitude') return '(ft)';
    if (metric === 'groundSpeed') return '(kt)';
    return '(ft/min)';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.create.emit({
      name: raw.name.trim(),
      aircraftId: raw.aircraftId.trim().toLowerCase(),
      callsign: null,
      metric: raw.metric,
      operator: raw.operator,
      threshold: raw.threshold as number,
      severity: raw.severity,
      enabled: raw.enabled,
    });
    this.form.reset({ metric: 'altitude', operator: 'above', severity: 'warning', enabled: true });
  }
}

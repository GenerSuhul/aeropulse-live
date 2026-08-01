import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Plus, X, LucideAngularModule } from 'lucide-angular';
import { OperationsEventDraft, OperationsEventType } from '../../models/operations-event.model';

const ICAO24_PATTERN = /^[0-9a-fA-F]{6}$/;

function toLocalDateTimeValue(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

@Component({
  selector: 'app-event-form',
  imports: [ReactiveFormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="rounded-card border border-border bg-white p-4 shadow-card sm:p-5" novalidate>
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="font-bold">Registrar evento</h3>
          <p class="mt-1 text-sm text-ink-secondary">Documenta una ocurrencia operativa con fecha y hora.</p>
        </div>
        <button type="button" (click)="dismiss.emit()" class="grid size-11 shrink-0 place-items-center rounded-lg text-ink-secondary hover:bg-surface-muted" aria-label="Cancelar">
          <lucide-angular [img]="icons.X" [size]="19" aria-hidden="true" />
        </button>
      </div>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-secondary" for="event-type">Tipo</label>
          <select id="event-type" formControlName="type" class="min-h-11 w-full rounded-lg border border-border bg-white px-3 focus:border-primary focus:outline-none">
            @for (option of typeOptions; track option.id) { <option [value]="option.id">{{ option.label }}</option> }
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-secondary" for="event-occurred-at">Fecha y hora</label>
          <input id="event-occurred-at" formControlName="occurredAt" type="datetime-local"
            class="min-h-11 w-full rounded-lg border border-border px-3 focus:border-primary focus:outline-none"
            [class.border-danger]="form.controls.occurredAt.invalid && form.controls.occurredAt.touched" aria-describedby="event-occurred-at-error" />
          @if (form.controls.occurredAt.invalid && form.controls.occurredAt.touched) { <p id="event-occurred-at-error" class="mt-1 text-xs font-semibold text-danger">Selecciona una fecha y hora.</p> }
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-secondary" for="event-title">Título</label>
          <input id="event-title" formControlName="title" autocomplete="off" spellcheck="false" placeholder="Ej. Despegue en 20R"
            class="min-h-11 w-full rounded-lg border border-border px-3 focus:border-primary focus:outline-none"
            [class.border-danger]="form.controls.title.invalid && form.controls.title.touched" aria-describedby="event-title-error" />
          @if (form.controls.title.invalid && form.controls.title.touched) { <p id="event-title-error" class="mt-1 text-xs font-semibold text-danger">El título debe tener al menos 3 caracteres.</p> }
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-secondary" for="event-aircraft-id">ICAO (hex, opcional)</label>
          <input id="event-aircraft-id" formControlName="aircraftId" autocomplete="off" spellcheck="false" placeholder="Ej. a9972b"
            class="min-h-11 w-full rounded-lg border border-border px-3 focus:border-primary focus:outline-none"
            [class.border-danger]="form.controls.aircraftId.invalid && form.controls.aircraftId.touched" aria-describedby="event-aircraft-id-error" />
          @if (form.controls.aircraftId.invalid && form.controls.aircraftId.touched) { <p id="event-aircraft-id-error" class="mt-1 text-xs font-semibold text-danger">Si lo indicas, usa un código hexadecimal de 6 caracteres.</p> }
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-secondary" for="event-description">Descripción</label>
          <textarea id="event-description" formControlName="description" rows="3" spellcheck="false" placeholder="Contexto de la ocurrencia"
            class="w-full rounded-lg border border-border px-3 py-2 focus:border-primary focus:outline-none"></textarea>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <button type="submit" [disabled]="form.invalid" class="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 font-bold text-white hover:bg-primary-dark disabled:opacity-50">
          <lucide-angular [img]="icons.Plus" [size]="17" aria-hidden="true" />Registrar
        </button>
        <button type="button" (click)="dismiss.emit()" class="min-h-11 rounded-lg border border-border bg-white px-4 font-bold text-ink-secondary hover:bg-surface-muted">Cancelar</button>
      </div>
    </form>
  `,
})
export class EventFormComponent {
  readonly initial = input<string | null>(null);
  readonly create = output<OperationsEventDraft>();
  readonly dismiss = output<void>();
  protected readonly icons = { Plus, X };
  protected readonly typeOptions: readonly { id: OperationsEventType; label: string }[] = [
    { id: 'departure', label: 'Salida' },
    { id: 'arrival', label: 'Arribo' },
    { id: 'incident', label: 'Incidente' },
    { id: 'maintenance', label: 'Mantenimiento' },
    { id: 'other', label: 'Otro' },
  ];
  protected readonly form = new FormGroup({
    type: new FormControl<OperationsEventType>('other', { nonNullable: true }),
    occurredAt: new FormControl(toLocalDateTimeValue(new Date()), { nonNullable: true, validators: [Validators.required] }),
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    description: new FormControl('', { nonNullable: true }),
    aircraftId: new FormControl('', { nonNullable: true, validators: [Validators.pattern(ICAO24_PATTERN)] }),
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const occurredAt = new Date(raw.occurredAt);
    this.create.emit({
      type: raw.type,
      occurredAt: Number.isNaN(occurredAt.getTime()) ? new Date() : occurredAt,
      title: raw.title.trim(),
      description: raw.description.trim(),
      aircraftId: this.form.controls.aircraftId.value.trim() || this.initial(),
    });
    this.form.reset({ type: 'other', occurredAt: toLocalDateTimeValue(new Date()), title: '', description: '', aircraftId: '' });
  }
}

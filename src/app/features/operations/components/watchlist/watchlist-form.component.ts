import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Plus, X, LucideAngularModule } from 'lucide-angular';
import { WatchlistDraft, WatchlistSubmitPayload } from '../../models/watchlist-item.model';

const ICAO24_PATTERN = /^[0-9a-fA-F]{6}$/;

@Component({
  selector: 'app-watchlist-form',
  imports: [ReactiveFormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="rounded-card border border-border bg-white p-4 shadow-card sm:p-5" novalidate>
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="font-bold">Agregar a la watchlist</h3>
          <p class="mt-1 text-sm text-ink-secondary">Si hay una aeronave seleccionada en el radar, sus datos se rellenan solos.</p>
        </div>
        <button type="button" (click)="dismiss.emit()" class="grid size-11 shrink-0 place-items-center rounded-lg text-ink-secondary hover:bg-surface-muted" aria-label="Cancelar">
          <lucide-angular [img]="icons.X" [size]="19" aria-hidden="true" />
        </button>
      </div>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-secondary" for="watchlist-aircraft-id">ICAO (hex)</label>
          <input id="watchlist-aircraft-id" formControlName="aircraftId" autocomplete="off" spellcheck="false" placeholder="Ej. a9972b"
            class="min-h-11 w-full rounded-lg border border-border px-3 focus:border-primary focus:outline-none"
            [class.border-danger]="form.controls.aircraftId.invalid && form.controls.aircraftId.touched" aria-describedby="watchlist-aircraft-id-error" />
          @if (form.controls.aircraftId.invalid && form.controls.aircraftId.touched) {
            <p id="watchlist-aircraft-id-error" class="mt-1 text-xs font-semibold text-danger">Ingresa un código hexadecimal de 6 caracteres.</p>
          }
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-secondary" for="watchlist-callsign">Callsign</label>
          <input id="watchlist-callsign" formControlName="callsign" autocomplete="off" spellcheck="false" placeholder="Ej. UAL1234"
            class="min-h-11 w-full rounded-lg border border-border px-3 focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-secondary" for="watchlist-registration">Matrícula</label>
          <input id="watchlist-registration" formControlName="registration" autocomplete="off" spellcheck="false" placeholder="Ej. N717MK"
            class="min-h-11 w-full rounded-lg border border-border px-3 focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-secondary" for="watchlist-note">Nota</label>
          <input id="watchlist-note" formControlName="note" autocomplete="off" spellcheck="false" placeholder="Motivo del seguimiento"
            class="min-h-11 w-full rounded-lg border border-border px-3 focus:border-primary focus:outline-none" />
        </div>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <button type="submit" [disabled]="form.invalid" class="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 font-bold text-white hover:bg-primary-dark disabled:opacity-50">
          <lucide-angular [img]="icons.Plus" [size]="17" aria-hidden="true" />Agregar
        </button>
        <button type="button" (click)="dismiss.emit()" class="min-h-11 rounded-lg border border-border bg-white px-4 font-bold text-ink-secondary hover:bg-surface-muted">Cancelar</button>
      </div>
    </form>
  `,
})
export class WatchlistFormComponent {
  readonly initial = input<WatchlistDraft | null>(null);
  readonly add = output<WatchlistSubmitPayload>();
  readonly dismiss = output<void>();
  protected readonly icons = { Plus, X };
  protected readonly form = new FormGroup({
    aircraftId: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(ICAO24_PATTERN)] }),
    callsign: new FormControl('', { nonNullable: true }),
    registration: new FormControl('', { nonNullable: true }),
    note: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const value = this.initial();
      if (value && !this.form.dirty) {
        this.form.patchValue(
          { aircraftId: value.aircraftId, callsign: value.callsign ?? '', registration: value.registration ?? '' },
          { emitEvent: false },
        );
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const initial = this.initial();
    this.add.emit({
      aircraftId: raw.aircraftId.trim().toLowerCase(),
      callsign: (raw.callsign.trim() || initial?.callsign) ?? null,
      registration: (raw.registration.trim() || initial?.registration) ?? null,
      aircraftType: initial?.aircraftType ?? null,
      note: raw.note.trim(),
    });
    this.form.reset();
  }
}

import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LocateFixed, LucideAngularModule, RotateCcw, Search } from 'lucide-angular';
import { RadarQuery } from '../../models/radar-query.model';
import { RadarProviderMode } from '../../services/radar.facade';
import { RADAR_API_CONFIG } from '../../data-access/radar-api.config';
import { finiteRangeValidator, positiveRadiusValidator } from './radar-query.validators';

@Component({
  selector: 'app-radar-query-panel', host: { class: 'block min-w-0' }, imports: [ReactiveFormsModule, LucideAngularModule], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <details id="radar-query-panel" class="group rounded-card border border-border bg-white shadow-card" open>
      <summary class="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 py-3 font-bold"><span>Área de consulta</span><span class="text-xs font-semibold text-ink-muted group-open:hidden">Mostrar filtros</span></summary>
      <form [formGroup]="form" (ngSubmit)="submit()" class="grid gap-4 border-t border-border p-4 sm:grid-cols-2 xl:grid-cols-4">
        <label class="block text-sm font-semibold">Latitud<input type="number" step="0.0001" formControlName="latitude" class="mt-2 min-h-11 w-full rounded-lg border border-border px-3 font-normal focus:border-primary" aria-describedby="latitude-error" /><span id="latitude-error" class="mt-1 block min-h-4 text-xs text-danger">{{ form.controls.latitude.touched && form.controls.latitude.invalid ? 'Ingresa una latitud entre -90 y 90.' : '' }}</span></label>
        <label class="block text-sm font-semibold">Longitud<input type="number" step="0.0001" formControlName="longitude" class="mt-2 min-h-11 w-full rounded-lg border border-border px-3 font-normal focus:border-primary" aria-describedby="longitude-error" /><span id="longitude-error" class="mt-1 block min-h-4 text-xs text-danger">{{ form.controls.longitude.touched && form.controls.longitude.invalid ? 'Ingresa una longitud entre -180 y 180.' : '' }}</span></label>
        <label class="block text-sm font-semibold">Radio (NM)<input type="number" min="1" max="250" formControlName="radiusNm" class="mt-2 min-h-11 w-full rounded-lg border border-border px-3 font-normal focus:border-primary" aria-describedby="radius-error" /><span id="radius-error" class="mt-1 block min-h-4 text-xs text-danger">{{ form.controls.radiusNm.touched && form.controls.radiusNm.invalid ? 'El radio debe estar entre 1 y 250 NM.' : '' }}</span></label>
        <label class="block text-sm font-semibold">Fuente<select formControlName="providerMode" (change)="providerModeChanged.emit(form.controls.providerMode.value)" class="mt-2 min-h-11 w-full rounded-lg border border-border bg-white px-3 font-normal"><option value="real">ADSB.lol (real)</option><option value="mock">Datos simulados</option></select><span class="mt-1 block min-h-4 text-xs text-ink-muted">Configurable sin editar componentes.</span></label>
        <div class="flex flex-wrap items-end gap-2 sm:col-span-2 xl:col-span-4">
          <button type="submit" [disabled]="form.invalid" class="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 font-bold text-white hover:bg-primary-dark disabled:opacity-50"><lucide-angular [img]="icons.Search" [size]="17" />Buscar aeronaves</button>
          <button type="button" (click)="useLocation()" class="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 font-bold text-ink-secondary hover:bg-surface-muted"><lucide-angular [img]="icons.LocateFixed" [size]="17" />Usar mi ubicación</button>
          <button type="button" (click)="reset()" class="inline-flex min-h-11 items-center gap-2 rounded-lg px-4 font-bold text-ink-secondary hover:bg-surface-muted"><lucide-angular [img]="icons.RotateCcw" [size]="17" />Restablecer</button>
          <label class="ml-auto flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" formControlName="autoRefresh" (change)="autoRefreshChanged.emit(form.controls.autoRefresh.value)" class="size-4 accent-primary" />Actualización automática</label>
          <label class="flex items-center gap-2 text-sm font-semibold">Intervalo<select formControlName="refreshIntervalSeconds" (change)="intervalChanged.emit(form.controls.refreshIntervalSeconds.value)" class="min-h-11 rounded-lg border border-border bg-white px-3"><option [ngValue]="10">10 s</option><option [ngValue]="12">12 s</option><option [ngValue]="15">15 s</option><option [ngValue]="30">30 s</option></select></label>
        </div>
        @if (locationMessage()) { <p class="sm:col-span-2 xl:col-span-4" role="status" [class.text-danger]="locationError()" [class.text-success]="!locationError()">{{ locationMessage() }}</p> }
      </form>
    </details>
  `,
})
export class RadarQueryPanelComponent {
  private readonly fb = inject(FormBuilder);
  private readonly config = inject(RADAR_API_CONFIG);
  readonly query = input.required<RadarQuery>();
  readonly providerMode = input<RadarProviderMode>('real');
  readonly querySubmitted = output<RadarQuery>();
  readonly autoRefreshChanged = output<boolean>();
  readonly intervalChanged = output<number>();
  readonly providerModeChanged = output<RadarProviderMode>();
  protected readonly locationMessage = signal<string | null>(null);
  protected readonly locationError = signal(false);
  protected readonly icons = { LocateFixed, RotateCcw, Search };
  protected readonly form = this.fb.nonNullable.group({
    latitude: [0, finiteRangeValidator(-90, 90)], longitude: [0, finiteRangeValidator(-180, 180)], radiusNm: [150, positiveRadiusValidator],
    autoRefresh: true, refreshIntervalSeconds: 12, providerMode: 'real' as RadarProviderMode,
  });

  constructor() {
    effect(() => {
      const query = this.query();
      this.form.patchValue({ ...query, providerMode: this.providerMode() }, { emitEvent: false });
    });
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { latitude, longitude, radiusNm } = this.form.getRawValue();
    this.querySubmitted.emit({ latitude, longitude, radiusNm });
  }

  protected reset(): void {
    const query = this.config.defaultQuery;
    this.form.reset({ ...query, autoRefresh: true, refreshIntervalSeconds: 12, providerMode: this.providerMode() });
    this.autoRefreshChanged.emit(true); this.intervalChanged.emit(12); this.locationMessage.set(null);
  }

  protected useLocation(): void {
    if (!navigator.geolocation) { this.locationError.set(true); this.locationMessage.set('Este navegador no admite geolocalización. Ingresa las coordenadas manualmente.'); return; }
    this.locationMessage.set('Solicitando ubicación…'); this.locationError.set(false);
    navigator.geolocation.getCurrentPosition(
      (position) => { this.form.patchValue({ latitude: Number(position.coords.latitude.toFixed(5)), longitude: Number(position.coords.longitude.toFixed(5)) }); this.locationMessage.set('Ubicación aplicada solo a esta consulta.'); },
      () => { this.locationError.set(true); this.locationMessage.set('No fue posible obtener la ubicación. Puedes ingresarla manualmente.'); },
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 60_000 },
    );
  }
}

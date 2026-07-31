import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { LoaderCircle, LucideAngularModule, Search } from 'lucide-angular';
import { ExplorerSearchMode } from '../../services/explorer.facade';

interface SearchModeOption {
  readonly id: ExplorerSearchMode;
  readonly label: string;
  readonly hint: string;
}

@Component({ selector: 'app-flight-search', imports: [LucideAngularModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `<section class="rounded-card border border-border bg-white p-4 shadow-card sm:p-5"><div class="flex flex-wrap gap-2" role="group" aria-label="Tipo de consulta">@for (option of modes; track option.id) {<button type="button" (click)="selectMode(option.id)" [attr.aria-pressed]="mode() === option.id" class="min-h-11 rounded-lg px-4 text-sm font-bold transition-colors" [class.bg-primary-soft]="mode() === option.id" [class.text-primary]="mode() === option.id" [class.border]="mode() === option.id" [class.border-primary]="mode() === option.id" [class.text-ink-secondary]="mode() !== option.id" [class.hover:bg-surface-muted]="mode() !== option.id">{{ option.label }}</button>}</div><form class="mt-4 flex flex-col gap-3 sm:flex-row" (submit)="submit($event)"><div class="min-w-0 flex-1"><label class="sr-only" for="explorer-query">Consulta</label><input #queryInput id="explorer-query" [value]="query()" (input)="onInput($any($event.target).value)" [disabled]="loading()" autocomplete="off" spellcheck="false" [attr.aria-describedby]="'explorer-hint'" class="min-h-11 w-full rounded-lg border border-border px-3 focus:border-primary focus:outline-none disabled:opacity-50" placeholder="Ej. UAL1234"/><p id="explorer-hint" class="mt-2 text-xs font-semibold text-ink-secondary">{{ hint() }}</p></div><button type="submit" [disabled]="loading()" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-bold text-white hover:bg-primary-dark disabled:opacity-50"><lucide-angular [img]="loading() ? loaderIcon : searchIcon" [size]="18" aria-hidden="true"/>Buscar</button></form></section>` })
export class FlightSearchComponent {
  readonly mode = input.required<ExplorerSearchMode>();
  readonly query = input.required<string>();
  readonly loading = input.required<boolean>();
  readonly modeChange = output<ExplorerSearchMode>();
  readonly queryChange = output<string>();
  readonly searchRequest = output<void>();
  private readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('queryInput');
  protected readonly modes: readonly SearchModeOption[] = [
    { id: 'flight', label: 'Vuelo', hint: 'Número de vuelo, ej. UAL1234' },
    { id: 'aircraft', label: 'Aeronave', hint: 'Matrícula o código hex, ej. N717MK o A9972B' },
    { id: 'airline', label: 'Aerolínea', hint: 'Código IATA o ICAO, ej. UA o UAL' },
  ];
  protected readonly searchIcon = Search;
  protected readonly loaderIcon = LoaderCircle;

  focus(): void { this.inputElement()?.nativeElement.focus(); }

  protected hint(): string {
    return this.modes.find((option) => option.id === this.mode())?.hint ?? '';
  }

  protected selectMode(mode: ExplorerSearchMode): void { this.modeChange.emit(mode); }

  protected onInput(value: string): void { this.queryChange.emit(value); }

  protected submit(event: Event): void {
    event.preventDefault();
    if (!this.loading()) this.searchRequest.emit();
  }
}

import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Plus, Star, LucideAngularModule } from 'lucide-angular';
import { WatchlistDraft, WatchlistItem, WatchlistSubmitPayload } from '../../models/watchlist-item.model';
import { WatchlistFormComponent } from './watchlist-form.component';
import { WatchlistItemComponent } from './watchlist-item.component';

@Component({
  selector: 'app-watchlist-panel',
  imports: [LucideAngularModule, WatchlistFormComponent, WatchlistItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-3" aria-label="Watchlist">
      <div class="flex items-center gap-2">
        <h2 class="text-xl font-bold">Watchlist</h2>
        <span class="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">{{ items().length }}</span>
        <button type="button" (click)="adding.update((open) => !open)" class="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white hover:bg-primary-dark">
          <lucide-angular [img]="icons.Plus" [size]="17" aria-hidden="true" />Agregar aeronave
        </button>
      </div>
      @if (adding()) {
        <app-watchlist-form [initial]="prefill()" (add)="add.emit($event)" (dismiss)="adding.set(false)" />
      }
      @if (items().length === 0 && !adding()) {
        <div class="rounded-card border border-border bg-white p-8 text-center shadow-card">
          <span class="mx-auto grid size-14 place-items-center rounded-full bg-primary-soft text-primary">
            <lucide-angular [img]="icons.Star" [size]="26" aria-hidden="true" />
          </span>
          <p class="mt-4 font-bold">Sin aeronaves en seguimiento</p>
          <p class="mt-1 text-sm text-ink-secondary">Agrega una aeronave desde el radar o crea una entrada manual para mantenerla vigilada.</p>
        </div>
      } @else {
        <ul class="space-y-3">
          @for (item of items(); track item.id) {
            <app-watchlist-item [item]="item" (remove)="remove.emit($event)" />
          }
        </ul>
      }
    </section>
  `,
})
export class WatchlistPanelComponent {
  readonly items = input.required<readonly WatchlistItem[]>();
  readonly prefill = input<WatchlistDraft | null>(null);
  readonly add = output<WatchlistSubmitPayload>();
  readonly remove = output<string>();
  protected readonly adding = signal(false);
  protected readonly icons = { Plus, Star };
}

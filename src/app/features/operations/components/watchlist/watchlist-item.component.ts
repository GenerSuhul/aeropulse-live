import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Plane, Trash2, LucideAngularModule } from 'lucide-angular';
import { WatchlistItem } from '../../models/watchlist-item.model';

@Component({
  selector: 'app-watchlist-item',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <li class="rounded-card border border-border bg-white p-4 shadow-card">
      <div class="flex items-start gap-3">
        <span class="grid size-11 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
          <lucide-angular [img]="icons.Plane" [size]="20" aria-hidden="true" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate font-bold">{{ item().callsign ?? item().registration ?? item().aircraftId.toUpperCase() }}</p>
          <p class="mt-0.5 truncate text-xs font-semibold text-ink-secondary">
            {{ secondaryLabel() }}
          </p>
          <p class="mt-1 text-xs font-semibold text-ink-muted">ICAO {{ item().aircraftId.toUpperCase() }} · añadido {{ addedLabel() }}</p>
          @if (item().note) { <p class="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-sm text-ink-secondary">{{ item().note }}</p> }
        </div>
        <button type="button" (click)="remove.emit(item().id)" class="grid size-11 shrink-0 place-items-center rounded-lg text-ink-secondary hover:bg-danger-soft hover:text-danger" [attr.aria-label]="'Quitar ' + (item().callsign ?? item().aircraftId) + ' de la watchlist'">
          <lucide-angular [img]="icons.Trash2" [size]="18" aria-hidden="true" />
        </button>
      </div>
    </li>
  `,
})
export class WatchlistItemComponent {
  readonly item = input.required<WatchlistItem>();
  readonly remove = output<string>();
  protected readonly icons = { Plane, Trash2 };

  protected addedLabel(): string {
    return this.item().createdAt.toLocaleString();
  }

  protected secondaryLabel(): string {
    const parts = [this.item().registration, this.item().aircraftType].filter((value): value is string => value !== null);
    return parts.length > 0 ? parts.join(' · ') : 'Datos de registro no disponibles';
  }
}

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Bell, CalendarDays, Star, LucideAngularModule } from 'lucide-angular';
import { WatchlistDraft } from '../../models/watchlist-item.model';
import { OperationsFacade, OperationsSection } from '../../services/operations.facade';
import { AlertsPanelComponent } from '../alerts/alerts-panel.component';
import { EventsPanelComponent } from '../events/events-panel.component';
import { OperationsHeaderComponent } from '../operations-header/operations-header.component';
import { WatchlistPanelComponent } from '../watchlist/watchlist-panel.component';

@Component({
  selector: 'app-operations-page',
  host: { class: 'block min-w-0' },
  imports: [LucideAngularModule, OperationsHeaderComponent, WatchlistPanelComponent, AlertsPanelComponent, EventsPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-[1800px] space-y-4">
      <app-operations-header [watchlistCount]="facade.counts().watchlist" [alertsCount]="facade.counts().alerts" [eventsCount]="facade.counts().events" />
      <div class="flex flex-wrap gap-2" role="group" aria-label="Sección del centro de operaciones">
        @for (tab of tabs; track tab.id) {
          <button type="button" (click)="facade.setSection(tab.id)" [attr.aria-pressed]="facade.section() === tab.id"
            class="inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-bold transition-colors"
            [class.bg-primary]="facade.section() === tab.id" [class.text-white]="facade.section() === tab.id"
            [class.border]="facade.section() !== tab.id" [class.border-border]="facade.section() !== tab.id"
            [class.bg-white]="facade.section() !== tab.id" [class.text-ink-secondary]="facade.section() !== tab.id"
            [class.hover:bg-surface-muted]="facade.section() !== tab.id">
            <lucide-angular [img]="tab.icon" [size]="18" aria-hidden="true" />{{ tab.label }}
          </button>
        }
      </div>
      @switch (facade.section()) {
        @case ('watchlist') {
          <app-watchlist-panel [items]="facade.watchlist()" [prefill]="prefill()" (add)="facade.addToWatchlist($event)" (remove)="facade.removeFromWatchlist($event)" />
        }
        @case ('alerts') {
          <app-alerts-panel [items]="facade.alerts()" [prefill]="prefill()" (create)="facade.addAlert($event)" (toggleAlert)="facade.toggleAlert($event)" (remove)="facade.removeAlert($event)" />
        }
        @case ('events') {
          <app-events-panel [items]="facade.events()" [prefillAircraftId]="prefill()?.aircraftId ?? null" (create)="facade.addEvent($event)" (remove)="facade.removeEvent($event)" />
        }
      }
    </div>
  `,
})
export class OperationsPageComponent {
  readonly facade = inject(OperationsFacade);
  protected readonly tabs: readonly { id: OperationsSection; label: string; icon: typeof Star }[] = [
    { id: 'watchlist', label: 'Watchlist', icon: Star },
    { id: 'alerts', label: 'Alertas', icon: Bell },
    { id: 'events', label: 'Eventos', icon: CalendarDays },
  ];
  protected readonly prefill = computed<WatchlistDraft | null>(() => {
    const aircraft = this.facade.selectedAircraft();
    if (!aircraft || this.facade.trackedIds().has(aircraft.icao24)) return null;
    return {
      aircraftId: aircraft.icao24,
      callsign: aircraft.callsign,
      registration: aircraft.registration,
      aircraftType: aircraft.aircraftType,
    };
  });
}

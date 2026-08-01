import { computed, Injectable, inject, signal } from '@angular/core';
import { AircraftSelectionService } from '../../../core/aircraft-selection.service';
import { OperationsStorageService } from '../data-access/operations-storage.service';
import { OperationsAlert, OperationsAlertDraft } from '../models/operations-alert.model';
import { OperationsEvent, OperationsEventDraft } from '../models/operations-event.model';
import { WatchlistItem, WatchlistSubmitPayload } from '../models/watchlist-item.model';

export type OperationsSection = 'watchlist' | 'alerts' | 'events';

@Injectable()
export class OperationsFacade {
  private readonly storage = inject(OperationsStorageService);
  private readonly selection = inject(AircraftSelectionService);

  private readonly watchlistState = signal<readonly WatchlistItem[]>(this.storage.loadWatchlist());
  private readonly alertsState = signal<readonly OperationsAlert[]>(this.storage.loadAlerts());
  private readonly eventsState = signal<readonly OperationsEvent[]>(this.storage.loadEvents());
  private readonly sectionState = signal<OperationsSection>('watchlist');

  readonly watchlist = this.watchlistState.asReadonly();
  readonly alerts = this.alertsState.asReadonly();
  readonly events = this.eventsState.asReadonly();
  readonly section = this.sectionState.asReadonly();
  readonly selectedAircraft = this.selection.selectedAircraft;
  readonly trackedIds = computed(() => new Set(this.watchlistState().map((item) => item.aircraftId)));
  readonly counts = computed(() => ({
    watchlist: this.watchlistState().length,
    alerts: this.alertsState().filter((alert) => alert.enabled).length,
    events: this.eventsState().length,
  }));

  setSection(section: OperationsSection): void { this.sectionState.set(section); }

  addToWatchlist(payload: WatchlistSubmitPayload): WatchlistItem | null {
    const aircraftId = normalizeHex(payload.aircraftId);
    if (aircraftId.length === 0 || this.trackedIds().has(aircraftId)) return null;
    const item: WatchlistItem = {
      id: createId(),
      aircraftId,
      callsign: toNull(payload.callsign),
      registration: toNull(payload.registration),
      aircraftType: toNull(payload.aircraftType),
      note: payload.note.trim(),
      createdAt: new Date(),
    };
    this.watchlistState.update((items) => [item, ...items]);
    this.storage.saveWatchlist(this.watchlistState());
    return item;
  }

  removeFromWatchlist(id: string): void {
    this.watchlistState.update((items) => items.filter((item) => item.id !== id));
    this.storage.saveWatchlist(this.watchlistState());
  }

  addAlert(draft: OperationsAlertDraft): OperationsAlert | null {
    const aircraftId = normalizeHex(draft.aircraftId);
    if (aircraftId.length === 0) return null;
    const alert: OperationsAlert = {
      ...draft,
      id: createId(),
      aircraftId,
      callsign: toNull(draft.callsign),
      name: draft.name.trim(),
      createdAt: new Date(),
    };
    this.alertsState.update((alerts) => [alert, ...alerts]);
    this.storage.saveAlerts(this.alertsState());
    return alert;
  }

  toggleAlert(id: string): void {
    this.alertsState.update((alerts) => alerts.map((alert) => (alert.id === id ? { ...alert, enabled: !alert.enabled } : alert)));
    this.storage.saveAlerts(this.alertsState());
  }

  removeAlert(id: string): void {
    this.alertsState.update((alerts) => alerts.filter((alert) => alert.id !== id));
    this.storage.saveAlerts(this.alertsState());
  }

  addEvent(draft: OperationsEventDraft): OperationsEvent | null {
    const event: OperationsEvent = {
      ...draft,
      id: createId(),
      title: draft.title.trim(),
      description: draft.description.trim(),
      aircraftId: toNull(draft.aircraftId),
      createdAt: new Date(),
    };
    if (event.title.length === 0) return null;
    this.eventsState.update((events) => [event, ...events]);
    this.storage.saveEvents(this.eventsState());
    return event;
  }

  removeEvent(id: string): void {
    this.eventsState.update((events) => events.filter((event) => event.id !== id));
    this.storage.saveEvents(this.eventsState());
  }
}

function normalizeHex(value: string): string {
  return value.trim().toLowerCase();
}

function toNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

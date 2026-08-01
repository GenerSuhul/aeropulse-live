import { Injectable } from '@angular/core';
import { OperationsAlert } from '../models/operations-alert.model';
import { OperationsEvent } from '../models/operations-event.model';
import { WatchlistItem } from '../models/watchlist-item.model';

const WATCHLIST_KEY = 'aeropulse.operations.watchlist';
const ALERTS_KEY = 'aeropulse.operations.alerts';
const EVENTS_KEY = 'aeropulse.operations.events';

@Injectable()
export class OperationsStorageService {
  private readonly storage = typeof window === 'undefined' ? null : window.localStorage;

  loadWatchlist(): readonly WatchlistItem[] {
    return this.read<WatchlistItem>(WATCHLIST_KEY, (item) => ({ ...item, createdAt: new Date(item.createdAt) }));
  }

  saveWatchlist(items: readonly WatchlistItem[]): void {
    this.write(WATCHLIST_KEY, items);
  }

  loadAlerts(): readonly OperationsAlert[] {
    return this.read<OperationsAlert>(ALERTS_KEY, (item) => ({ ...item, createdAt: new Date(item.createdAt) }));
  }

  saveAlerts(items: readonly OperationsAlert[]): void {
    this.write(ALERTS_KEY, items);
  }

  loadEvents(): readonly OperationsEvent[] {
    return this.read<OperationsEvent>(EVENTS_KEY, (item) => ({
      ...item,
      occurredAt: new Date(item.occurredAt),
      createdAt: new Date(item.createdAt),
    }));
  }

  saveEvents(items: readonly OperationsEvent[]): void {
    this.write(EVENTS_KEY, items);
  }

  private read<T>(key: string, revive: (raw: T) => T): readonly T[] {
    try {
      const raw = this.storage?.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as T[];
      return Array.isArray(parsed) ? parsed.map(revive) : [];
    } catch {
      return [];
    }
  }

  private write<T>(key: string, items: readonly T[]): void {
    try {
      this.storage?.setItem(key, JSON.stringify(items));
    } catch {
      return;
    }
  }
}

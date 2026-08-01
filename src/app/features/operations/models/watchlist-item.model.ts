export interface WatchlistDraft {
  readonly aircraftId: string;
  readonly callsign: string | null;
  readonly registration: string | null;
  readonly aircraftType: string | null;
}

export interface WatchlistSubmitPayload extends WatchlistDraft {
  readonly note: string;
}

export interface WatchlistItem extends WatchlistDraft {
  readonly id: string;
  readonly note: string;
  readonly createdAt: Date;
}

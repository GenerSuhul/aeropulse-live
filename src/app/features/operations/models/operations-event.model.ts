export type OperationsEventType = 'departure' | 'arrival' | 'incident' | 'maintenance' | 'other';

export interface OperationsEventDraft {
  readonly type: OperationsEventType;
  readonly title: string;
  readonly description: string;
  readonly aircraftId: string | null;
  readonly occurredAt: Date;
}

export interface OperationsEvent extends OperationsEventDraft {
  readonly id: string;
  readonly createdAt: Date;
}

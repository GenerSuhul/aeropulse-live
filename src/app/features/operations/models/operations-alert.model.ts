export type AlertMetric = 'altitude' | 'groundSpeed' | 'verticalRate';

export type AlertOperator = 'above' | 'below';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface OperationsAlertDraft {
  readonly name: string;
  readonly aircraftId: string;
  readonly callsign: string | null;
  readonly metric: AlertMetric;
  readonly operator: AlertOperator;
  readonly threshold: number;
  readonly severity: AlertSeverity;
  readonly enabled: boolean;
}

export interface OperationsAlert extends OperationsAlertDraft {
  readonly id: string;
  readonly createdAt: Date;
}

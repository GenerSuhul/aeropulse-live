export type RadarErrorKind = 'network' | 'timeout' | 'invalid-response' | 'invalid-query' | 'rate-limit' | 'unknown';

export interface RadarError {
  readonly kind: RadarErrorKind;
  readonly message: string;
}

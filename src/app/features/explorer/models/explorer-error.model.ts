export type ExplorerErrorKind = 'not-found' | 'rate-limit' | 'timeout' | 'network' | 'invalid-query' | 'unknown';

export interface ExplorerError {
  readonly kind: ExplorerErrorKind;
  readonly message: string;
}

export type GeographicAreaKind = 'world' | 'continent' | 'country';

export interface GeographicBounds {
  readonly west: number;
  readonly south: number;
  readonly east: number;
  readonly north: number;
}

export interface GeographicArea {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly kind: GeographicAreaKind;
  readonly bounds: GeographicBounds | null;
}

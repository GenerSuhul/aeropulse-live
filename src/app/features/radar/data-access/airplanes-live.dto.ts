export interface AirplanesLiveAircraftDto {
  readonly r?: unknown;
  readonly t?: unknown;
  readonly desc?: unknown;
  readonly ownOp?: unknown;
  readonly year?: unknown;
}

export interface AirplanesLiveResponseDto {
  readonly ac?: readonly AirplanesLiveAircraftDto[];
  readonly total?: number;
}

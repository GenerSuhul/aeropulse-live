export interface AirplanesLiveAircraftDto {
  readonly hex?: unknown;
  readonly flight?: unknown;
  readonly r?: unknown;
  readonly t?: unknown;
  readonly desc?: unknown;
  readonly ownOp?: unknown;
  readonly year?: unknown;
  readonly lat?: unknown;
  readonly lon?: unknown;
  readonly alt_baro?: unknown;
  readonly alt_geom?: unknown;
  readonly gs?: unknown;
  readonly track?: unknown;
  readonly true_heading?: unknown;
  readonly mag_heading?: unknown;
  readonly baro_rate?: unknown;
  readonly geom_rate?: unknown;
  readonly squawk?: unknown;
  readonly category?: unknown;
  readonly emergency?: unknown;
  readonly seen?: unknown;
  readonly seen_pos?: unknown;
}

export interface AirplanesLiveResponseDto {
  readonly ac?: readonly AirplanesLiveAircraftDto[];
  readonly total?: number;
}

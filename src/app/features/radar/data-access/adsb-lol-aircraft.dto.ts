export interface AdsbLolAircraftDto {
  readonly hex: string;
  readonly type: string;
  readonly flight?: string | null;
  readonly r?: string | null;
  readonly t?: string | null;
  readonly alt_baro?: number | string | null;
  readonly alt_geom?: number | null;
  readonly gs?: number | null;
  readonly track?: number | null;
  readonly true_heading?: number | null;
  readonly baro_rate?: number | null;
  readonly geom_rate?: number | null;
  readonly squawk?: string | null;
  readonly emergency?: string | null;
  readonly category?: string | null;
  readonly lat?: number | null;
  readonly lon?: number | null;
  readonly seen: number;
  readonly seen_pos?: number | null;
  readonly messages: number;
  readonly mlat: readonly string[];
  readonly tisb: readonly string[];
  readonly rssi: number;
}

export interface AdsbLolResponseDto {
  readonly ac: readonly AdsbLolAircraftDto[];
  readonly msg: string;
  readonly now: number;
  readonly total: number;
  readonly ctime: number;
  readonly ptime: number;
}

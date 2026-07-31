export interface AircraftDetails {
  readonly type: string | null;
  readonly icaoType: string | null;
  readonly manufacturer: string | null;
  readonly modeS: string | null;
  readonly registration: string | null;
  readonly ownerCountryIso: string | null;
  readonly ownerCountryName: string | null;
  readonly operatorFlagCode: string | null;
  readonly registeredOwner: string | null;
  readonly photoUrl: string | null;
  readonly photoThumbnailUrl: string | null;
}

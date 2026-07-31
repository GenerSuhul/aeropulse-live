import { Airline } from './airline.model';
import { Airport } from './airport.model';

export interface FlightRoute {
  readonly callsign: string;
  readonly callsignIcao: string | null;
  readonly callsignIata: string | null;
  readonly airline: Airline | null;
  readonly origin: Airport | null;
  readonly destination: Airport | null;
}

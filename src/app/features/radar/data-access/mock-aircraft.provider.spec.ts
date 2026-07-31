import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { MockAircraftProvider } from './mock-aircraft.provider';

describe('MockAircraftProvider', () => {
  it('genera datos deterministas alrededor de la consulta', async () => {
    const aircraft = await firstValueFrom(new MockAircraftProvider().getAircraft({ latitude: 16, longitude: -89, radiusNm: 100 }));
    expect(aircraft).toHaveLength(8); expect(aircraft.every((item) => item.id.startsWith('mock'))).toBe(true); expect(aircraft.some((item) => item.isOnGround)).toBe(true);
  });
});

export const environment = {
  production: true,
  radar: {
    apiBaseUrl: '/opensky-api',
    mapStyleUrl: 'https://tiles.openfreemap.org/styles/liberty',
    defaultAreaId: 'world',
    pollIntervalMs: 60_000,
  },
} as const;

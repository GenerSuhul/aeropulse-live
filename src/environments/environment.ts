export const environment = {
  production: true,
  radar: {
    apiBaseUrl: '/adsb-api',
    mapStyleUrl: 'https://tiles.openfreemap.org/styles/liberty',
    defaultQuery: { latitude: 16.3258, longitude: -89.4161, radiusNm: 150 },
    pollIntervalMs: 12_000,
    useMockProvider: false,
  },
} as const;

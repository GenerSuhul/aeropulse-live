export const environment = {
  production: true,
  radar: {
    apiBaseUrl: '/opensky-api',
    metadataApiBaseUrl: 'https://api.airplanes.live/v2',
    mapTileUrls: [
      'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
    ],
    defaultAreaId: 'world',
    pollIntervalMs: 15_000,
  },
} as const;

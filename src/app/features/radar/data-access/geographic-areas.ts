import { GeographicArea } from '../models/geographic-area.model';

export const GEOGRAPHIC_AREAS: readonly GeographicArea[] = [
  { id: 'world', name: 'Todo el mundo', shortName: 'Mundo', kind: 'world', bounds: null },
  { id: 'north-america', name: 'Norteamérica', shortName: 'Norteamérica', kind: 'continent', bounds: { west: -168, south: 7, east: -52, north: 72 } },
  { id: 'central-america', name: 'Centroamérica y Caribe', shortName: 'Centroamérica', kind: 'continent', bounds: { west: -95, south: 5, east: -58, north: 27 } },
  { id: 'south-america', name: 'Sudamérica', shortName: 'Sudamérica', kind: 'continent', bounds: { west: -82, south: -56, east: -34, north: 13 } },
  { id: 'europe', name: 'Europa', shortName: 'Europa', kind: 'continent', bounds: { west: -25, south: 34, east: 45, north: 72 } },
  { id: 'africa', name: 'África', shortName: 'África', kind: 'continent', bounds: { west: -20, south: -36, east: 53, north: 38 } },
  { id: 'asia', name: 'Asia', shortName: 'Asia', kind: 'continent', bounds: { west: 25, south: -10, east: 180, north: 78 } },
  { id: 'oceania', name: 'Oceanía', shortName: 'Oceanía', kind: 'continent', bounds: { west: 110, south: -50, east: 180, north: 5 } },
  { id: 'guatemala', name: 'Guatemala', shortName: 'Guatemala', kind: 'country', bounds: { west: -92.3, south: 13.7, east: -88.1, north: 17.9 } },
  { id: 'belize', name: 'Belice', shortName: 'Belice', kind: 'country', bounds: { west: -89.3, south: 15.8, east: -87.7, north: 18.6 } },
  { id: 'el-salvador', name: 'El Salvador', shortName: 'El Salvador', kind: 'country', bounds: { west: -90.2, south: 13.1, east: -87.7, north: 14.5 } },
  { id: 'honduras', name: 'Honduras', shortName: 'Honduras', kind: 'country', bounds: { west: -89.4, south: 12.9, east: -83.1, north: 16.6 } },
  { id: 'nicaragua', name: 'Nicaragua', shortName: 'Nicaragua', kind: 'country', bounds: { west: -87.8, south: 10.7, east: -82.5, north: 15.1 } },
  { id: 'costa-rica', name: 'Costa Rica', shortName: 'Costa Rica', kind: 'country', bounds: { west: -86, south: 8, east: -82.5, north: 11.3 } },
  { id: 'panama', name: 'Panamá', shortName: 'Panamá', kind: 'country', bounds: { west: -83.1, south: 7, east: -77, north: 9.8 } },
  { id: 'mexico', name: 'México', shortName: 'México', kind: 'country', bounds: { west: -118.5, south: 14.3, east: -86.5, north: 32.8 } },
  { id: 'united-states', name: 'Estados Unidos continental', shortName: 'EE. UU.', kind: 'country', bounds: { west: -125, south: 24, east: -66, north: 50 } },
  { id: 'canada', name: 'Canadá', shortName: 'Canadá', kind: 'country', bounds: { west: -141, south: 41, east: -52, north: 84 } },
  { id: 'colombia', name: 'Colombia', shortName: 'Colombia', kind: 'country', bounds: { west: -79.2, south: -4.5, east: -66.7, north: 13.8 } },
  { id: 'ecuador', name: 'Ecuador', shortName: 'Ecuador', kind: 'country', bounds: { west: -81.2, south: -5.2, east: -75, north: 1.7 } },
  { id: 'peru', name: 'Perú', shortName: 'Perú', kind: 'country', bounds: { west: -81.4, south: -18.4, east: -68.6, north: 0.1 } },
  { id: 'chile', name: 'Chile', shortName: 'Chile', kind: 'country', bounds: { west: -75.8, south: -56, east: -66, north: -17.4 } },
  { id: 'argentina', name: 'Argentina', shortName: 'Argentina', kind: 'country', bounds: { west: -73.6, south: -55.1, east: -53.6, north: -21.7 } },
  { id: 'brazil', name: 'Brasil', shortName: 'Brasil', kind: 'country', bounds: { west: -74, south: -34, east: -34, north: 6 } },
  { id: 'spain', name: 'España', shortName: 'España', kind: 'country', bounds: { west: -10, south: 35.5, east: 4.5, north: 44 } },
  { id: 'france', name: 'Francia', shortName: 'Francia', kind: 'country', bounds: { west: -5.5, south: 41, east: 9.8, north: 51.5 } },
  { id: 'germany', name: 'Alemania', shortName: 'Alemania', kind: 'country', bounds: { west: 5.5, south: 47, east: 15.5, north: 55.2 } },
  { id: 'united-kingdom', name: 'Reino Unido', shortName: 'Reino Unido', kind: 'country', bounds: { west: -8.7, south: 49.8, east: 2, north: 60.9 } },
  { id: 'japan', name: 'Japón', shortName: 'Japón', kind: 'country', bounds: { west: 122, south: 24, east: 146, north: 46 } },
  { id: 'australia', name: 'Australia', shortName: 'Australia', kind: 'country', bounds: { west: 112, south: -44, east: 154, north: -10 } },
] as const;

export function getGeographicArea(areaId: string): GeographicArea {
  return GEOGRAPHIC_AREAS.find((area) => area.id === areaId) ?? GEOGRAPHIC_AREAS[0];
}

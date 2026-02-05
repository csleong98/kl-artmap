// KL Rail Line Geometries
// Using station coordinates to create approximate line routes

import { stationCoordinates } from './stationCoordinates';

export interface RailLineData {
  id: string;
  name: string;
  type: 'LRT' | 'MRT' | 'KTM' | 'Monorail';
  color: string;
  stations: string[];
}

export const railLines: RailLineData[] = [
  {
    id: 'lrt-kelana-jaya',
    name: 'LRT Kelana Jaya Line',
    type: 'LRT',
    color: '#FF6B35',
    stations: ['KL Sentral', 'Masjid Jamek LRT', 'KLCC', 'Ampang Park']
  },
  {
    id: 'mrt-kajang',
    name: 'MRT Kajang Line',
    type: 'MRT',
    color: '#4ECDC4',
    stations: ['KL Sentral', 'Pasar Seni', 'Muzium Negara MRT']
  },
  {
    id: 'mrt-putrajaya',
    name: 'MRT Putrajaya Line',
    type: 'MRT',
    color: '#9B59B6',
    stations: ['Persiaran KLCC']
  },
  {
    id: 'lrt-ampang',
    name: 'LRT Ampang Line',
    type: 'LRT',
    color: '#E74C3C',
    stations: ['Masjid Jamek LRT']
  },
  {
    id: 'ktm-komuter',
    name: 'KTM Komuter',
    type: 'KTM',
    color: '#2ECC71',
    stations: ['KL Sentral', 'Brickfields', 'Bandaraya']
  }
];

// Convert station names to coordinate arrays for line geometry
export const getRailLineGeometry = (lineId: string) => {
  const line = railLines.find(l => l.id === lineId);
  if (!line) return null;

  const coordinates = line.stations
    .map(stationName => {
      const stationData = stationCoordinates[stationName];
      return stationData ? stationData.coordinates : null;
    })
    .filter(coord => coord !== null);

  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates
    },
    properties: {
      id: line.id,
      name: line.name,
      type: line.type,
      color: line.color
    }
  };
};

// Get all rail lines as GeoJSON FeatureCollection
export const getAllRailLinesGeoJSON = () => {
  const features = railLines
    .map(line => getRailLineGeometry(line.id))
    .filter(feature => feature !== null);

  return {
    type: 'FeatureCollection',
    features
  };
};
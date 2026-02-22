// Station coordinates for KL rail network
// Coordinates format: [longitude, latitude] to match GeoJSON standard

export interface StationData {
  name: string;
  coordinates: [number, number];
  lines: string[];
  type: 'LRT' | 'MRT' | 'KTM' | 'Monorail';
}

export const stationCoordinates: Record<string, StationData> = {
  'KL Sentral': {
    name: 'KL Sentral',
    coordinates: [101.6860, 3.1340],
    lines: ['KTM', 'LRT Kelana Jaya Line', 'MRT Kajang Line', 'KLIA Transit'],
    type: 'KTM'
  },
  'Masjid Jamek LRT': {
    name: 'Masjid Jamek LRT',
    coordinates: [101.69646, 3.14968],
    lines: ['LRT Ampang Line', 'LRT Sri Petaling Line', 'LRT Kelana Jaya Line'],
    type: 'LRT'
  },
  'Pasar Seni': {
    name: 'Pasar Seni',
    coordinates: [101.69531, 3.14247],
    lines: ['LRT Kelana Jaya Line', 'MRT Kajang Line'],
    type: 'LRT'
  },
  'KLCC': {
    name: 'KLCC',
    coordinates: [101.71396, 3.15933],
    lines: ['LRT Kelana Jaya Line'],
    type: 'LRT'
  },
  'Persiaran KLCC': {
    name: 'Persiaran KLCC',
    coordinates: [101.718422, 3.1573407],
    lines: ['MRT Putrajaya Line'],
    type: 'MRT'
  },
  'Ampang Park': {
    name: 'Ampang Park',
    coordinates: [101.7183, 3.1588],
    lines: ['LRT Kelana Jaya Line'],
    type: 'LRT'
  },
  'Brickfields': {
    name: 'Brickfields',
    coordinates: [101.6847, 3.1329],
    lines: ['KTM Komuter'],
    type: 'KTM'
  },
  'Muzium Negara MRT': {
    name: 'Muzium Negara MRT',
    coordinates: [101.6878027561305, 3.1375158655082434],
    lines: ['MRT Kajang Line'],
    type: 'MRT'
  },
  'Bandaraya': {
    name: 'Bandaraya',
    coordinates: [101.69442589509586, 3.1556520223802424],
    lines: ['LRT Kelana Jaya Line'],
    type: 'LRT'
  },
  'Bukit Bintang Monorail': {
    name: 'Bukit Bintang Monorail',
    coordinates: [101.7111, 3.1458],
    lines: ['KL Monorail'],
    type: 'Monorail'
  },
  'Bukit Bintang MRT': {
    name: 'Bukit Bintang MRT',
    coordinates: [101.7100, 3.1468],
    lines: ['MRT Kajang Line'],
    type: 'MRT'
  },
  'Raja Chulan Monorail': {
    name: 'Raja Chulan Monorail',
    coordinates: [101.7104, 3.1508],
    lines: ['KL Monorail'],
    type: 'Monorail'
  }
};

// Helper function to get station data by name (case-insensitive, fuzzy matching)
export const getStationData = (stationName: string): StationData | null => {
  // Direct match first
  if (stationCoordinates[stationName]) {
    return stationCoordinates[stationName];
  }

  // Try case-insensitive match
  const lowerName = stationName.toLowerCase();
  for (const [key, data] of Object.entries(stationCoordinates)) {
    if (key.toLowerCase() === lowerName) {
      return data;
    }
  }

  // Try partial match (contains)
  for (const [key, data] of Object.entries(stationCoordinates)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      return data;
    }
  }

  return null;
};

/**
 * Haversine distance between two [lng, lat] points in meters.
 */
function haversineMeters(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6_371_000; // Earth radius in meters
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const sin2 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
}

/**
 * Returns the N nearest stations to the given coordinates,
 * sorted closest-first.
 */
export const getNearestStations = (
  coordinates: [number, number],
  count: number = 3
): StationData[] => {
  return Object.values(stationCoordinates)
    .map(station => ({
      station,
      dist: haversineMeters(coordinates, station.coordinates),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map(entry => entry.station);
};

/**
 * Returns all stations within a straight-line radius (meters),
 * sorted closest-first. Used as a pre-filter before checking
 * real walking times via the Mapbox API.
 */
export const getStationsWithinRadius = (
  coordinates: [number, number],
  radiusMeters: number = 1500
): StationData[] => {
  return Object.values(stationCoordinates)
    .map(station => ({
      station,
      dist: haversineMeters(coordinates, station.coordinates),
    }))
    .filter(entry => entry.dist <= radiusMeters)
    .sort((a, b) => a.dist - b.dist)
    .map(entry => entry.station);
};

// Route colors for different stations/lines
export const routeColors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Light Yellow
  '#BB8FCE', // Light Purple
  '#85C1E9'  // Light Blue
];

// Get a color for a route (deterministic based on station name)
export const getRouteColor = (stationName: string, index: number = 0): string => {
  const hash = stationName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return routeColors[(Math.abs(hash) + index) % routeColors.length];
};
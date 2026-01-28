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
    coordinates: [101.6883, 3.1329],
    lines: ['MRT Kajang Line'],
    type: 'MRT'
  },
  'Bandaraya': {
    name: 'Bandaraya',
    coordinates: [101.6958, 3.1428],
    lines: ['LRT Kelana Jaya Line'],
    type: 'LRT'
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
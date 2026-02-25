// Station coordinates for KL rail network
// Coordinates format: [longitude, latitude] to match GeoJSON standard

export interface StationExit {
  exitName: string;
  coordinates: [number, number];
  description?: string;
}

export interface StationData {
  name: string;
  exits: StationExit[]; // Changed from single coordinates to array of exits
  lines: string[];
  type: 'LRT' | 'MRT' | 'KTM' | 'Monorail';
}

export const stationCoordinates: Record<string, StationData> = {
  'KL Sentral': {
    name: 'KL Sentral',
    exits: [
      {
        exitName: 'Exit A - Street Level',
        coordinates: [101.6852, 3.1337],
        description: 'Jalan Stesen Sentral, near taxi stand'
      },
      {
        exitName: 'NU Sentral Mall',
        coordinates: [101.6869, 3.1334],
        description: 'Direct access to NU Sentral Shopping Centre'
      },
      {
        exitName: 'Hilton Hotel Exit',
        coordinates: [101.6855, 3.1348],
        description: 'Nearest to Hilton KL and office towers'
      }
    ],
    lines: ['KTM', 'LRT Kelana Jaya Line', 'MRT Kajang Line', 'KLIA Transit'],
    type: 'KTM'
  },
  'Masjid Jamek LRT': {
    name: 'Masjid Jamek LRT',
    exits: [
      {
        exitName: 'Main Exit',
        coordinates: [101.69646, 3.14968],
        description: 'Temporary - needs exit research'
      }
    ],
    lines: ['LRT Ampang Line', 'LRT Sri Petaling Line', 'LRT Kelana Jaya Line'],
    type: 'LRT'
  },
  'Pasar Seni': {
    name: 'Pasar Seni',
    exits: [
      {
        exitName: 'Entrance A - Jalan Sultan',
        coordinates: [101.6947, 3.1419],
        description: 'Central Market side (MRT/LRT shared)'
      },
      {
        exitName: 'Entrance B - Jalan Sultan Mohamed',
        coordinates: [101.6951, 3.1428],
        description: 'Petaling Street/Chinatown side'
      },
      {
        exitName: 'Entrance D - Jln Tun Tan Cheng Lock',
        coordinates: [101.6959, 3.1425],
        description: 'Kasturi Walk side'
      }
    ],
    lines: ['LRT Kelana Jaya Line', 'MRT Kajang Line'],
    type: 'LRT'
  },
  'KLCC': {
    name: 'KLCC',
    exits: [
      {
        exitName: 'Main Exit',
        coordinates: [101.71396, 3.15933],
        description: 'Temporary - needs exit research'
      }
    ],
    lines: ['LRT Kelana Jaya Line'],
    type: 'LRT'
  },
  'Persiaran KLCC': {
    name: 'Persiaran KLCC',
    exits: [
      {
        exitName: 'Main Exit',
        coordinates: [101.718422, 3.1573407],
        description: 'Temporary - needs exit research'
      }
    ],
    lines: ['MRT Putrajaya Line'],
    type: 'MRT'
  },
  'Ampang Park': {
    name: 'Ampang Park',
    exits: [
      {
        exitName: 'Main Exit',
        coordinates: [101.7183, 3.1588],
        description: 'Temporary - needs exit research'
      }
    ],
    lines: ['LRT Kelana Jaya Line'],
    type: 'LRT'
  },
  'Brickfields': {
    name: 'Brickfields',
    exits: [
      {
        exitName: 'Main Exit',
        coordinates: [101.6847, 3.1329],
        description: 'Temporary - needs exit research'
      }
    ],
    lines: ['KTM Komuter'],
    type: 'KTM'
  },
  'Muzium Negara MRT': {
    name: 'Muzium Negara MRT',
    exits: [
      {
        exitName: 'Main Exit',
        coordinates: [101.6878027561305, 3.1375158655082434],
        description: 'Temporary - needs exit research'
      }
    ],
    lines: ['MRT Kajang Line'],
    type: 'MRT'
  },
  'Bandaraya': {
    name: 'Bandaraya',
    exits: [
      {
        exitName: 'Main Exit',
        coordinates: [101.69442589509586, 3.1556520223802424],
        description: 'Temporary - needs exit research'
      }
    ],
    lines: ['LRT Kelana Jaya Line'],
    type: 'LRT'
  },
  'Bukit Bintang Monorail': {
    name: 'Bukit Bintang Monorail',
    exits: [
      {
        exitName: 'Main Exit',
        coordinates: [101.7111, 3.1458],
        description: 'Temporary - needs exit research'
      }
    ],
    lines: ['KL Monorail'],
    type: 'Monorail'
  },
  'Bukit Bintang MRT': {
    name: 'Bukit Bintang MRT',
    exits: [
      {
        exitName: 'Main Exit',
        coordinates: [101.7100, 3.1468],
        description: 'Temporary - needs exit research'
      }
    ],
    lines: ['MRT Kajang Line'],
    type: 'MRT'
  },
  'Raja Chulan Monorail': {
    name: 'Raja Chulan Monorail',
    exits: [
      {
        exitName: 'Main Exit',
        coordinates: [101.7104, 3.1508],
        description: 'Temporary - needs exit research'
      }
    ],
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
 * sorted closest-first. Distance is calculated to the nearest exit of each station.
 */
export const getNearestStations = (
  coordinates: [number, number],
  count: number = 3
): StationData[] => {
  return Object.values(stationCoordinates)
    .map(station => {
      // Calculate distance to the closest exit from this station
      const minDist = Math.min(
        ...station.exits.map(exit => haversineMeters(coordinates, exit.coordinates))
      );
      return { station, dist: minDist };
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map(entry => entry.station);
};

/**
 * Returns all stations within a straight-line radius (meters),
 * sorted closest-first. Distance is calculated to the nearest exit.
 * Used as a pre-filter before checking real walking times via the Mapbox API.
 */
export const getStationsWithinRadius = (
  coordinates: [number, number],
  radiusMeters: number = 1500
): StationData[] => {
  return Object.values(stationCoordinates)
    .map(station => {
      // Calculate distance to the closest exit from this station
      const minDist = Math.min(
        ...station.exits.map(exit => haversineMeters(coordinates, exit.coordinates))
      );
      return { station, dist: minDist };
    })
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
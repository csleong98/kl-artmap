import indoorConnectionsData from './indoorConnections.json';
import trainLinesData from './trainLines.json';
import locationsData from './locations.json';
import type { IndoorConnection, TrainLine, TrainStation, Location, StationExit } from '@/types';

// Type assertions for JSON imports
const indoorConnections = indoorConnectionsData as IndoorConnection[];
const trainLines = trainLinesData.lines as TrainLine[];
const locations = locationsData as Location[];

// ============================================
// TRAIN LINE & STATION HELPERS
// ============================================

/**
 * Get a train line by its ID
 */
export function getLineById(lineId: string): TrainLine | null {
  return trainLines.find(line => line.id === lineId) || null;
}

/**
 * Get a station by its code (e.g., "SBK15")
 * Returns the station object with its line information
 */
export function getStationByCode(code: string): (TrainStation & { lineId: string; lineName: string; lineColor: string; lineType: string }) | null {
  for (const line of trainLines) {
    const station = line.stations.find(s => s.code === code);
    if (station) {
      return {
        ...station,
        lineId: line.id,
        lineName: line.name,
        lineColor: line.color,
        lineType: line.type
      };
    }
  }
  return null;
}

/**
 * Get a station by its name (fuzzy matching)
 * Returns the first match found
 */
export function getStationByName(name: string): (TrainStation & { lineId: string; lineName: string; lineColor: string }) | null {
  const lowerName = name.toLowerCase().trim();

  // Try exact match first
  for (const line of trainLines) {
    const station = line.stations.find(s => s.name.toLowerCase() === lowerName);
    if (station) {
      return {
        ...station,
        lineId: line.id,
        lineName: line.name,
        lineColor: line.color
      };
    }
  }

  // Try partial match (contains)
  for (const line of trainLines) {
    const station = line.stations.find(s =>
      s.name.toLowerCase().includes(lowerName) ||
      lowerName.includes(s.name.toLowerCase())
    );
    if (station) {
      return {
        ...station,
        lineId: line.id,
        lineName: line.name,
        lineColor: line.color
      };
    }
  }

  return null;
}

/**
 * Get station with full metadata (for walking routes)
 * Returns StationWithMetadata structure compatible with useWalkingRoutes
 */
export function getStationWithMetadata(name: string): StationWithMetadata | null {
  const lowerName = name.toLowerCase().trim();

  // Try exact match first
  for (const line of trainLines) {
    const station = line.stations.find(s => s.name.toLowerCase() === lowerName);
    if (station) {
      const servingLines = getLinesAtStationByCode(station.code).map(l => l.name);

      return {
        name: station.name,
        code: station.code,
        coordinates: station.coordinates,
        exits: station.exits || [{
          exitName: 'Main Exit',
          coordinates: station.coordinates,
          description: 'Main station exit'
        }],
        lines: servingLines.length > 0 ? servingLines : [line.name],
        type: line.type,
        lineId: line.id,
        lineName: line.name,
        lineColor: line.color,
        interchangeLines: station.interchangeLines
      };
    }
  }

  // Try partial match
  for (const line of trainLines) {
    const station = line.stations.find(s =>
      s.name.toLowerCase().includes(lowerName) ||
      lowerName.includes(s.name.toLowerCase())
    );
    if (station) {
      const servingLines = getLinesAtStationByCode(station.code).map(l => l.name);

      return {
        name: station.name,
        code: station.code,
        coordinates: station.coordinates,
        exits: station.exits || [{
          exitName: 'Main Exit',
          coordinates: station.coordinates,
          description: 'Main station exit'
        }],
        lines: servingLines.length > 0 ? servingLines : [line.name],
        type: line.type,
        lineId: line.id,
        lineName: line.name,
        lineColor: line.color,
        interchangeLines: station.interchangeLines
      };
    }
  }

  return null;
}

/**
 * Get all lines that serve a particular station (by station name)
 * Useful for interchange stations
 */
export function getLinesAtStation(stationName: string): TrainLine[] {
  const lowerName = stationName.toLowerCase().trim();
  const lines: TrainLine[] = [];

  for (const line of trainLines) {
    const hasStation = line.stations.some(s =>
      s.name.toLowerCase() === lowerName ||
      s.name.toLowerCase().includes(lowerName)
    );
    if (hasStation) {
      lines.push(line);
    }
  }

  return lines;
}

/**
 * Get all lines that serve a particular station (by station code)
 */
export function getLinesAtStationByCode(code: string): TrainLine[] {
  const lines: TrainLine[] = [];

  for (const line of trainLines) {
    const hasStation = line.stations.some(s => s.code === code);
    if (hasStation) {
      lines.push(line);
    }
  }

  return lines;
}

/**
 * Check if a station is an interchange station
 */
export function isInterchangeStation(stationCode: string): boolean {
  const station = getStationByCode(stationCode);
  return station?.interchangeLines && station.interchangeLines.length > 0 || false;
}

/**
 * Get nearby stations on the same line
 * @param stationCode The station code to start from
 * @param count Number of stations before and after to return
 * @returns Array of stations including the current station
 */
export function getNearbyStationsOnLine(
  stationCode: string,
  count: number = 2
): TrainStation[] {
  // Find which line this station is on
  let targetLine: TrainLine | null = null;
  let stationIndex = -1;

  for (const line of trainLines) {
    const index = line.stations.findIndex(s => s.code === stationCode);
    if (index !== -1) {
      targetLine = line;
      stationIndex = index;
      break;
    }
  }

  if (!targetLine || stationIndex === -1) {
    return [];
  }

  // Get stations before and after
  const startIndex = Math.max(0, stationIndex - count);
  const endIndex = Math.min(targetLine.stations.length, stationIndex + count + 1);

  return targetLine.stations.slice(startIndex, endIndex);
}

/**
 * Get all stations on a specific line
 */
export function getStationsByLine(lineId: string): TrainStation[] {
  const line = getLineById(lineId);
  return line?.stations || [];
}

/**
 * Get interchange information for a station
 */
export function getInterchangeInfo(stationCode: string): {
  station: TrainStation;
  interchangeLines: TrainLine[];
} | null {
  const station = getStationByCode(stationCode);
  if (!station || !station.interchangeLines || station.interchangeLines.length === 0) {
    return null;
  }

  const lines = station.interchangeLines
    .map(lineId => getLineById(lineId))
    .filter(line => line !== null) as TrainLine[];

  return {
    station,
    interchangeLines: lines
  };
}

// ============================================
// INDOOR CONNECTION HELPERS
// ============================================

/**
 * Haversine distance between two [lng, lat] points in meters
 */
export function haversineMeters(a: [number, number], b: [number, number]): number {
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
 * Find indoor connections that can be used between two points
 * @param from Starting coordinates
 * @param to Ending coordinates
 * @param maxDetourMeters Allow this much detour to use indoor route (default 100m)
 * @returns Array of relevant indoor connections
 */
export function findRelevantIndoorConnections(
  from: [number, number],
  to: [number, number],
  maxDetourMeters: number = 100
): IndoorConnection[] {
  const relevant: IndoorConnection[] = [];

  for (const connection of indoorConnections) {
    // Calculate distance from 'from' point to connection start
    const distToStart = haversineMeters(from, connection.start.coordinates);
    const distFromEnd = haversineMeters(connection.end.coordinates, to);

    // Check if connection is useful (within acceptable detour)
    if (distToStart <= maxDetourMeters && distFromEnd <= maxDetourMeters) {
      relevant.push(connection);
    }

    // Check reverse direction if bidirectional
    if (connection.isBidirectional) {
      const distToEnd = haversineMeters(from, connection.end.coordinates);
      const distFromStart = haversineMeters(connection.start.coordinates, to);

      if (distToEnd <= maxDetourMeters && distFromStart <= maxDetourMeters) {
        // Create reversed connection
        relevant.push({
          ...connection,
          id: `${connection.id}-reverse`,
          name: connection.name.split('↔').reverse().join('↔'),
          start: connection.end,
          end: connection.start,
        });
      }
    }
  }

  return relevant;
}

/**
 * Get all indoor connections
 */
export function getAllIndoorConnections(): IndoorConnection[] {
  return indoorConnections;
}

// ============================================
// LOCATION HELPERS
// ============================================

/**
 * Get all locations
 */
export function getAllLocations(): Location[] {
  return locations;
}

/**
 * Get a location by name
 */
export function getLocationByName(name: string): Location | null {
  return locations.find(loc => loc.name === name) || null;
}

// Type for station with metadata (backwards compatible with old StationData)
export interface StationWithMetadata {
  name: string;
  code: string;
  coordinates: [number, number];
  exits: StationExit[];
  lines: string[]; // All lines serving this station
  type: 'LRT' | 'MRT' | 'KTM' | 'Monorail' | 'ETS' | 'KLIA';
  lineId: string;
  lineName: string;
  lineColor: string;
  distance?: number;
  interchangeLines?: string[];
}

/**
 * Returns the N nearest stations to the given coordinates,
 * sorted closest-first. Distance is calculated to the station's main coordinates.
 */
export function getNearestStations(
  coordinates: [number, number],
  count: number = 3
): StationWithMetadata[] {
  const allStations: StationWithMetadata[] = [];

  // Collect all stations from all lines
  for (const line of trainLines) {
    for (const station of line.stations) {
      const distance = haversineMeters(coordinates, station.coordinates);

      // Get all lines serving this station
      const servingLines = getLinesAtStationByCode(station.code).map(l => l.name);

      allStations.push({
        name: station.name,
        code: station.code,
        coordinates: station.coordinates,
        exits: station.exits || [{
          exitName: 'Main Exit',
          coordinates: station.coordinates,
          description: 'Main station exit'
        }],
        lines: servingLines.length > 0 ? servingLines : [line.name],
        type: line.type,
        lineId: line.id,
        lineName: line.name,
        lineColor: line.color,
        distance,
        interchangeLines: station.interchangeLines
      });
    }
  }

  // Sort by distance and return top N
  return allStations
    .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    .slice(0, count);
}

/**
 * Returns all stations within a straight-line radius (meters),
 * sorted closest-first.
 * Used as a pre-filter before checking real walking times via the Mapbox API.
 */
export function getStationsWithinRadius(
  coordinates: [number, number],
  radiusMeters: number = 1500
): StationWithMetadata[] {
  const allStations: StationWithMetadata[] = [];

  // Collect all stations from all lines
  for (const line of trainLines) {
    for (const station of line.stations) {
      const distance = haversineMeters(coordinates, station.coordinates);
      if (distance <= radiusMeters) {
        // Get all lines serving this station
        const servingLines = getLinesAtStationByCode(station.code).map(l => l.name);

        allStations.push({
          name: station.name,
          code: station.code,
          coordinates: station.coordinates,
          exits: station.exits || [{
            exitName: 'Main Exit',
            coordinates: station.coordinates,
            description: 'Main station exit'
          }],
          lines: servingLines.length > 0 ? servingLines : [line.name],
          type: line.type,
          lineId: line.id,
          lineName: line.name,
          lineColor: line.color,
          distance,
          interchangeLines: station.interchangeLines
        });
      }
    }
  }

  // Sort by distance
  return allStations.sort((a, b) => a.distance! - b.distance!);
}

// ============================================
// LEGACY HELPERS (for backwards compatibility)
// ============================================

/**
 * Route colors for different stations/lines (legacy)
 */
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

/**
 * Get a color for a route (deterministic based on station name) (legacy)
 */
export function getRouteColor(stationName: string, index: number = 0): string {
  const hash = stationName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return routeColors[(Math.abs(hash) + index) % routeColors.length];
}

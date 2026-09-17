import { useState, useCallback } from 'react';
import { Location } from '@/types';
import { getStationWithMetadata, getStationByCode, haversineMeters } from '@/data/helpers';
import {
  formatDistance,
  formatDuration,
} from '@/services/routeService';

export interface WalkingRouteData {
  stationName: string;
  stationCode: string;        // Station code (e.g., "SBK15")
  exitName: string;           // Specific exit to use
  coordinates: [number, number]; // The exit's coordinates
  exitDescription?: string;   // Optional helper text like "Near Central Market"
  lines: string[];
  distance: number;           // meters
  duration: number;           // seconds
  formattedDistance: string;
  formattedDuration: string;
  hasIndoorRoute: boolean;    // Route uses indoor connections
  indoorPercentage?: number;  // % of route that's indoor
  indoorFeatures?: string[];  // Indoor features (air-conditioned, etc.)
}

interface UseWalkingRoutesReturn {
  routeData: WalkingRouteData[];
  isLoading: boolean;
  error: string | null;
  fetchRoutes: (location: Location) => Promise<void>;
  clearRoutes: () => void;
  getStationRouteInfo: (stationName: string) => WalkingRouteData | undefined;
}

/**
 * Get stations for a location using the manually curated nearestStations list.
 * Returns full StationData objects with exits.
 */
function resolveStations(location: Location) {
  console.log('🔍 resolveStations called for:', location.name);
  console.log('📍 nearestStations:', location.nearestStations);

  if (!location.nearestStations || location.nearestStations.length === 0) {
    console.log('❌ No nearestStations found');
    return [];
  }

  const stations = location.nearestStations
    .map(stationIdentifier => {
      console.log('🔎 Looking up station:', stationIdentifier);

      // Check if it's a station code (e.g., "AG06", "SP06", "PY27", "KJ9")
      const isStationCode = /^[A-Z]{2,4}\d{1,2}$/.test(stationIdentifier);

      let result;
      if (isStationCode) {
        // Look up by code
        const stationData = getStationByCode(stationIdentifier);
        if (stationData) {
          // Convert to StationWithMetadata format
          result = {
            name: stationData.name,
            code: stationData.code,
            coordinates: stationData.coordinates,
            exits: stationData.exits || [{
              exitName: 'Main Exit',
              coordinates: stationData.coordinates,
              description: 'Main station exit'
            }],
            lines: [stationData.lineName],
            type: stationData.lineType,
            lineId: stationData.lineId,
            lineName: stationData.lineName,
            lineColor: stationData.lineColor,
            interchangeLines: stationData.interchangeLines
          };
        }
      } else {
        // Look up by name
        result = getStationWithMetadata(stationIdentifier);
      }

      console.log('✅ Result:', result ? `${result.name} (${result.code})` : 'NULL');
      return result;
    })
    .filter((station): station is NonNullable<typeof station> => station !== null);

  console.log('📊 Resolved stations count:', stations.length);
  return stations;
}

export function useWalkingRoutes(): UseWalkingRoutesReturn {
  const [routeData, setRouteData] = useState<WalkingRouteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearRoutes = useCallback(() => {
    setRouteData([]);
    setError(null);
  }, []);

  const fetchRoutes = useCallback(async (location: Location) => {
    const stations = resolveStations(location);
    if (stations.length === 0) {
      setRouteData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simply convert stations to route data without API calls
      const routes: WalkingRouteData[] = stations.map((station) => {
        // Use first exit or create default exit
        const exit = station.exits[0] || {
          exitName: 'Main Exit',
          coordinates: station.coordinates,
          description: 'Main station exit'
        };

        // Manual override for specific routes
        let distance: number;
        let duration: number;

        if (station.code === 'PY27' && location.name === 'National Art Gallery') {
          // Hospital Kuala Lumpur to National Art Gallery: 7 mins, 450m
          distance = 450;
          duration = 420; // 7 minutes in seconds
        } else if (station.code === 'PY27' && location.name === 'Istana Budaya (National Theater)') {
          // Hospital Kuala Lumpur to Istana Budaya: 3 mins, 150m
          distance = 150;
          duration = 180; // 3 minutes in seconds
        } else {
          // Calculate straight-line distance as estimate
          distance = Math.round(
            haversineMeters(exit.coordinates, location.coordinates)
          );
          // Estimate walking time: 5 km/h = 1.39 m/s
          duration = Math.round(distance / 1.39);
        }

        return {
          stationName: station.name,
          stationCode: station.code,
          exitName: exit.exitName,
          exitDescription: exit.description,
          coordinates: exit.coordinates,
          lines: station.lines,
          distance: distance,
          duration: duration,
          formattedDistance: formatDistance(distance),
          formattedDuration: formatDuration(duration),
          hasIndoorRoute: false,
          indoorPercentage: 0,
          indoorFeatures: [],
        };
      });

      console.log('🚶 Routes:', routes.length);
      console.log('📋 Route details:', routes.map(r => ({
        station: r.stationName,
        code: r.stationCode,
        exit: r.exitName,
        duration: r.formattedDuration,
        distance: r.formattedDistance
      })));

      setRouteData(routes);
    } catch (err) {
      console.error('Walking routes error:', err);
      setError('Failed to load walking directions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStationRouteInfo = useCallback(
    (stationName: string): WalkingRouteData | undefined => {
      const lower = stationName.toLowerCase();
      return routeData.find(r => {
        const rLower = r.stationName.toLowerCase();
        return rLower === lower || lower.includes(rLower) || rLower.includes(lower);
      });
    },
    [routeData]
  );

  return {
    routeData,
    isLoading,
    error,
    fetchRoutes,
    clearRoutes,
    getStationRouteInfo,
  };
}

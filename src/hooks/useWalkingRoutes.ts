import { useState, useRef, useCallback } from 'react';
import { Location } from '@/types';
import { getStationsWithinRadius, findRelevantIndoorConnections } from '@/data/helpers';
import {
  fetchDirectionsRoute,
  formatDistance,
  formatDuration,
} from '@/services/routeService';

export interface WalkingRouteData {
  stationName: string;
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

/** Maximum walking duration in seconds (15 minutes) */
const MAX_WALK_SECONDS = 900;

/** Haversine pre-filter radius in meters (~1.5km straight-line) */
const PREFILTER_RADIUS_M = 2000;

/**
 * Pre-filters stations within a straight-line radius.
 * Real walking time is checked after the Matrix API call.
 * Returns full StationData objects with exits.
 */
function resolveStations(location: Location) {
  return getStationsWithinRadius(location.coordinates, PREFILTER_RADIUS_M);
}

export function useWalkingRoutes(): UseWalkingRoutesReturn {
  const [routeData, setRouteData] = useState<WalkingRouteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const clearRoutes = useCallback(() => {
    // Cancel in-flight requests
    abortRef.current?.abort();
    abortRef.current = null;

    setRouteData([]);
    setError(null);
  }, []);

  const fetchRoutes = useCallback(async (location: Location) => {
    // Cancel any previous in-flight work
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const stations = resolveStations(location);
    if (stations.length === 0) {
      setRouteData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const origin = location.coordinates;
    const signal = controller.signal;

    try {
      // Build a flat list of all station-exit combinations
      const allExitCombos: Array<{
        station: typeof stations[0];
        exit: typeof stations[0]['exits'][0];
      }> = [];

      stations.forEach(station => {
        station.exits.forEach(exit => {
          allExitCombos.push({ station, exit });
        });
      });

      // Calculate routes from ALL exits to the art venue
      // First check for indoor connections, then use Mapbox API as fallback
      const directionsResults = await Promise.allSettled(
        allExitCombos.map(async (combo) => {
          // Check if there's an indoor connection for this route
          const indoorConns = findRelevantIndoorConnections(
            combo.exit.coordinates,
            origin,
            150 // Allow 150m detour to use indoor route
          );

          // If indoor connection exists and is better, use it
          if (indoorConns.length > 0) {
            const bestIndoor = indoorConns[0]; // Use first (best) match

            // Create synthetic route result with indoor connection data
            return {
              success: true,
              distance: bestIndoor.distance,
              duration: bestIndoor.duration,
              geometry: {
                type: 'LineString' as const,
                coordinates: [bestIndoor.start.coordinates, bestIndoor.end.coordinates]
              },
              steps: [{
                distance: bestIndoor.distance,
                duration: bestIndoor.duration,
                name: bestIndoor.name,
                instruction: bestIndoor.instructions,
                maneuverType: 'indoor',
                isCrossing: false,
              }],
              isIndoor: true,
              indoorFeatures: bestIndoor.features,
            };
          }

          // Fallback to Mapbox API
          const result = await fetchDirectionsRoute(
            combo.exit.coordinates,
            origin,
            signal
          );

          return {
            ...result,
            isIndoor: false,
          };
        })
      );

      // Check if aborted while awaiting
      if (signal.aborted) return;

      // Group results by station and pick best exit per station
      const stationBestExits: Map<string, {
        exit: typeof stations[0]['exits'][0];
        route: any;
        station: typeof stations[0];
      }> = new Map();

      allExitCombos.forEach((combo, index) => {
        const dirResult = directionsResults[index];
        if (dirResult.status !== 'fulfilled' || !dirResult.value.success) return;

        const route = dirResult.value;
        const existing = stationBestExits.get(combo.station.name);

        // Prefer indoor routes (boost priority), otherwise use shortest time
        const routeScore = route.isIndoor
          ? route.duration * 0.7  // 30% bonus for indoor routes
          : route.duration;

        const existingScore = existing
          ? (existing.route.isIndoor ? existing.route.duration * 0.7 : existing.route.duration)
          : Infinity;

        // Keep the exit with best score (shortest time, with indoor bonus)
        if (routeScore < existingScore) {
          stationBestExits.set(combo.station.name, {
            exit: combo.exit,
            route,
            station: combo.station
          });
        }
      });

      // Build final route data with exit information
      const routes: WalkingRouteData[] = Array.from(stationBestExits.values()).map((best) => {
        const isIndoor = best.route.isIndoor || false;
        const indoorPercentage = isIndoor ? 100 : 0; // Simplified - either fully indoor or outdoor

        return {
          stationName: best.station.name,
          exitName: best.exit.exitName,
          exitDescription: best.exit.description,
          coordinates: best.exit.coordinates,
          lines: best.station.lines,
          distance: best.route.distance,
          duration: best.route.duration,
          formattedDistance: formatDistance(best.route.distance),
          formattedDuration: formatDuration(best.route.duration),
          hasIndoorRoute: isIndoor,
          indoorPercentage: indoorPercentage,
          indoorFeatures: best.route.indoorFeatures || [],
        };
      });

      if (signal.aborted) return;

      // Keep only stations walkable within 15 minutes, sorted by duration (shortest first)
      const walkableRoutes = routes
        .filter(r => r.duration > 0 && r.duration <= MAX_WALK_SECONDS)
        .sort((a, b) => a.duration - b.duration);

      setRouteData(walkableRoutes);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      console.error('Walking routes error:', err);
      setError('Failed to load walking directions');
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
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

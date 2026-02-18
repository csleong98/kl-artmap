import { useState, useRef, useCallback } from 'react';
import { Location } from '@/types';
import { getNearestStations, getRouteColor } from '@/data/stationCoordinates';
import {
  fetchMatrixDistances,
  fetchDirectionsRoute,
  formatDistance,
  formatDuration,
} from '@/services/routeService';
import {
  addRouteLayer,
  clearRouteLayers,
  fitMapToBounds,
  addStationMarkers,
  clearStationMarkers,
} from '@/services/mapService';

export interface WalkingRouteData {
  stationName: string;
  coordinates: [number, number];
  lines: string[];
  distance: number;           // meters
  duration: number;           // seconds
  formattedDistance: string;
  formattedDuration: string;
  geometry: GeoJSON.LineString | null;
  color: string;
  routeId: string;
}

interface UseWalkingRoutesReturn {
  routeData: WalkingRouteData[];
  isLoading: boolean;
  error: string | null;
  fetchRoutes: (location: Location, map: any) => Promise<void>;
  clearRoutes: (map: any) => void;
  getStationRouteInfo: (stationName: string) => WalkingRouteData | undefined;
}

/**
 * Computes the 3 nearest stations to a location by haversine distance.
 * Ignores hardcoded nearestStations data — always uses coordinates.
 */
function resolveStations(location: Location): { name: string; coordinates: [number, number]; lines: string[] }[] {
  return getNearestStations(location.coordinates, 3).map(s => ({
    name: s.name,
    coordinates: s.coordinates,
    lines: s.lines,
  }));
}

export function useWalkingRoutes(): UseWalkingRoutesReturn {
  const [routeData, setRouteData] = useState<WalkingRouteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const activeRouteIds = useRef<string[]>([]);
  const stationMarkers = useRef<any[]>([]);

  const clearRoutes = useCallback((map: any) => {
    // Cancel in-flight requests
    abortRef.current?.abort();
    abortRef.current = null;

    // Remove map layers and station markers
    if (map) {
      clearRouteLayers(map, activeRouteIds.current);
    }
    clearStationMarkers(stationMarkers.current);
    stationMarkers.current = [];
    activeRouteIds.current = [];
    setRouteData([]);
    setError(null);
  }, []);

  const fetchRoutes = useCallback(async (location: Location, map: any) => {
    // Cancel any previous in-flight work
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Clean up previous route layers and station markers
    if (map) {
      clearRouteLayers(map, activeRouteIds.current);
    }
    clearStationMarkers(stationMarkers.current);
    stationMarkers.current = [];
    activeRouteIds.current = [];

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
      // Fire Matrix + Directions calls in parallel
      const [matrixResult, ...directionsResults] = await Promise.allSettled([
        fetchMatrixDistances(
          origin,
          stations.map(s => s.coordinates),
          signal
        ),
        ...stations.map(s =>
          fetchDirectionsRoute(origin, s.coordinates, signal)
        ),
      ]);

      // Check if aborted while awaiting
      if (signal.aborted) return;

      const matrix =
        matrixResult.status === 'fulfilled' ? matrixResult.value : null;

      const routes: WalkingRouteData[] = stations.map((station, i) => {
        const dirResult =
          directionsResults[i]?.status === 'fulfilled'
            ? directionsResults[i].value
            : null;

        // Prefer Matrix distances (single call, more consistent),
        // fall back to individual Directions result
        const distance =
          matrix?.success && matrix.distances[i] != null
            ? matrix.distances[i]
            : dirResult?.success
              ? dirResult.distance
              : 0;

        const duration =
          matrix?.success && matrix.durations[i] != null
            ? matrix.durations[i]
            : dirResult?.success
              ? dirResult.duration
              : 0;

        const geometry =
          dirResult?.success && dirResult.geometry.coordinates.length > 0
            ? dirResult.geometry
            : null;

        const color = getRouteColor(station.name, i);
        const routeId = `walking-route-${i}`;

        return {
          stationName: station.name,
          coordinates: station.coordinates,
          lines: station.lines,
          distance,
          duration,
          formattedDistance: distance > 0 ? formatDistance(distance) : '',
          formattedDuration: duration > 0 ? formatDuration(duration) : '',
          geometry,
          color,
          routeId,
        };
      });

      if (signal.aborted) return;

      // Draw route layers on map
      const boundsCoords: [number, number][] = [origin];
      const newRouteIds: string[] = [];

      for (const route of routes) {
        if (route.geometry && map) {
          addRouteLayer(map, route.routeId, route.geometry, route.color);
          newRouteIds.push(route.routeId);
          boundsCoords.push(route.coordinates);
        }
      }

      activeRouteIds.current = newRouteIds;

      // Add station markers
      if (map) {
        const markers = await addStationMarkers(
          map,
          routes.map(r => ({ name: r.stationName, coordinates: r.coordinates, color: r.color }))
        );
        stationMarkers.current = markers;
      }

      // Fit map to show all routes
      if (map && boundsCoords.length > 1) {
        fitMapToBounds(map, boundsCoords);
      }

      setRouteData(routes);
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

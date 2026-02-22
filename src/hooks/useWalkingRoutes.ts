import { useState, useRef, useCallback } from 'react';
import { Location } from '@/types';
import { getStationsWithinRadius } from '@/data/stationCoordinates';
import {
  fetchMatrixDistances,
  fetchDirectionsRoute,
  formatDistance,
  formatDuration,
  RouteStep,
} from '@/services/routeService';
import {
  addRouteLayer,
  clearRouteLayers,
  fitMapToBounds,
  setActiveRoute,
  addRouteEndpointMarkers,
  clearMarkers,
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
  steps: RouteStep[];
  routeId: string;
}

interface UseWalkingRoutesReturn {
  routeData: WalkingRouteData[];
  isLoading: boolean;
  error: string | null;
  activeRouteId: string | null;
  fetchRoutes: (location: Location, map: any) => Promise<void>;
  clearRoutes: (map: any) => void;
  switchActiveRoute: (routeId: string, map: any, locationCoordinates: [number, number]) => void;
  getStationRouteInfo: (stationName: string) => WalkingRouteData | undefined;
}

/** Maximum walking duration in seconds (15 minutes) */
const MAX_WALK_SECONDS = 900;

/** Haversine pre-filter radius in meters (~1.5km straight-line) */
const PREFILTER_RADIUS_M = 2000;

/**
 * Pre-filters stations within a straight-line radius.
 * Real walking time is checked after the Matrix API call.
 */
function resolveStations(location: Location): { name: string; coordinates: [number, number]; lines: string[] }[] {
  return getStationsWithinRadius(location.coordinates, PREFILTER_RADIUS_M).map(s => ({
    name: s.name,
    coordinates: s.coordinates,
    lines: s.lines,
  }));
}

export function useWalkingRoutes(): UseWalkingRoutesReturn {
  const [routeData, setRouteData] = useState<WalkingRouteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const activeRouteIds = useRef<string[]>([]);
  const endpointMarkers = useRef<any[]>([]);
  const routeDataRef = useRef<WalkingRouteData[]>([]);

  const clearRoutes = useCallback((map: any) => {
    // Cancel in-flight requests
    abortRef.current?.abort();
    abortRef.current = null;

    // Remove map layers and endpoint markers
    if (map) {
      clearRouteLayers(map, activeRouteIds.current);
    }
    clearMarkers(endpointMarkers.current);
    endpointMarkers.current = [];
    activeRouteIds.current = [];
    routeDataRef.current = [];
    setRouteData([]);
    setActiveRouteId(null);
    setError(null);
  }, []);

  const switchActiveRoute = useCallback((routeId: string, map: any, locationCoordinates: [number, number]) => {
    if (!map) return;

    // Swap colors on the map
    setActiveRoute(map, routeId, activeRouteIds.current);

    // Clear old endpoint markers
    clearMarkers(endpointMarkers.current);
    endpointMarkers.current = [];

    // Find the route from the ref (synchronous, no race condition)
    const route = routeDataRef.current.find(r => r.routeId === routeId);
    if (route) {
      addRouteEndpointMarkers(map, locationCoordinates, route.coordinates).then(markers => {
        // Guard: only assign if this route is still the active one
        if (activeRouteIds.current.length > 0) {
          endpointMarkers.current = markers;
        } else {
          // Routes were cleared while markers were being created — remove them immediately
          clearMarkers(markers);
        }
      });
    }

    setActiveRouteId(routeId);
  }, []);

  const fetchRoutes = useCallback(async (location: Location, map: any) => {
    // Cancel any previous in-flight work
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Clean up previous route layers and endpoint markers
    if (map) {
      clearRouteLayers(map, activeRouteIds.current);
    }
    clearMarkers(endpointMarkers.current);
    endpointMarkers.current = [];
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

        const routeId = `walking-route-${i}`;
        const steps = dirResult?.success ? dirResult.steps : [];

        return {
          stationName: station.name,
          coordinates: station.coordinates,
          lines: station.lines,
          distance,
          duration,
          formattedDistance: distance > 0 ? formatDistance(distance) : '',
          formattedDuration: duration > 0 ? formatDuration(duration) : '',
          geometry,
          steps,
          routeId,
        };
      });

      if (signal.aborted) return;

      // Keep only stations walkable within 15 minutes, sorted by duration (shortest first)
      const walkableRoutes = routes
        .filter(r => r.duration > 0 && r.duration <= MAX_WALK_SECONDS)
        .sort((a, b) => a.duration - b.duration);

      // Draw route layers on map — first route is active (best), rest are muted
      const boundsCoords: [number, number][] = [origin];
      const newRouteIds: string[] = [];

      for (let i = 0; i < walkableRoutes.length; i++) {
        const route = walkableRoutes[i];
        if (route.geometry && map) {
          addRouteLayer(map, route.routeId, route.geometry, i === 0);
          newRouteIds.push(route.routeId);
          boundsCoords.push(route.coordinates);
        }
      }

      activeRouteIds.current = newRouteIds;

      // Set the first route as active and add endpoint markers for it
      const bestRoute = walkableRoutes[0];
      if (bestRoute && map) {
        setActiveRouteId(bestRoute.routeId);
        const markers = await addRouteEndpointMarkers(map, origin, bestRoute.coordinates);
        if (signal.aborted) {
          clearMarkers(markers);
          return;
        }
        endpointMarkers.current = markers;
      }

      // Register click handlers and cursor for route layers
      if (map) {
        for (const route of walkableRoutes) {
          const layerIds = [route.routeId, `${route.routeId}-casing`];
          for (const layerId of layerIds) {
            if (!map.getLayer(layerId)) continue;

            map.on('click', layerId, () => {
              switchActiveRoute(route.routeId, map, origin);
            });
            map.on('mouseenter', layerId, () => {
              map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', layerId, () => {
              map.getCanvas().style.cursor = '';
            });
          }
        }
      }

      // Fit map to show all routes
      if (map && boundsCoords.length > 1) {
        fitMapToBounds(map, boundsCoords);
      }

      routeDataRef.current = walkableRoutes;
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
  }, [switchActiveRoute]);

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
    activeRouteId,
    fetchRoutes,
    clearRoutes,
    switchActiveRoute,
    getStationRouteInfo,
  };
}

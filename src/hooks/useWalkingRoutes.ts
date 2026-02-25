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
import { findRelevantIndoorConnections } from '@/data/indoorConnections';

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
  geometry: GeoJSON.LineString | null;
  steps: RouteStep[];
  routeId: string;
  hasIndoorRoute: boolean;    // NEW: Route uses indoor connections
  indoorPercentage?: number;  // NEW: % of route that's indoor
  indoorFeatures?: string[];  // NEW: Indoor features (air-conditioned, etc.)
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
 * Returns full StationData objects with exits.
 */
function resolveStations(location: Location) {
  return getStationsWithinRadius(location.coordinates, PREFILTER_RADIUS_M);
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
      const routes: WalkingRouteData[] = Array.from(stationBestExits.values()).map((best, i) => {
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
          geometry: best.route.geometry,
          steps: best.route.steps,
          routeId: `walking-route-${i}`,
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

// Custom hook for managing route display and state
import { useState, useCallback, useRef } from 'react';
import { fetchMultipleRoutes, RouteResult, formatDistance, formatDuration } from '@/services/routeService';
import { addRouteToMap, clearAllRoutes, RouteLayer, addStationMarkers, clearMarkers, fitMapToRoutes } from '@/services/mapService';
import { getStationData } from '@/data/stationCoordinates';
import { Location } from '@/types';

export interface RouteDisplayState {
  isLoading: boolean;
  error: string | null;
  routes: Array<RouteResult & { stationName: string; color: string }>;
  routeLayers: RouteLayer[];
  markerIds: string[];
}

export function useRouteDisplay() {
  const [state, setState] = useState<RouteDisplayState>({
    isLoading: false,
    error: null,
    routes: [],
    routeLayers: [],
    markerIds: []
  });

  const mapRef = useRef<any>(null);

  // Set the map instance
  const setMapInstance = useCallback((map: any) => {
    mapRef.current = map;
  }, []);

  // Display routes for a selected location
  const displayRoutesForLocation = useCallback(async (location: Location) => {
    if (!mapRef.current || !location.nearestStations) {
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      // Clear existing routes first
      if (state.routeLayers.length > 0) {
        clearAllRoutes(mapRef.current, state.routeLayers);
      }
      if (state.markerIds.length > 0) {
        clearMarkers(mapRef.current, state.markerIds);
      }

      // Get station coordinates for all nearest stations
      const stationCoords: Array<{ name: string; coords: [number, number] }> = [];

      for (const stationName of location.nearestStations) {
        const stationData = getStationData(stationName);
        if (stationData) {
          stationCoords.push({
            name: stationName,
            coords: stationData.coordinates
          });
        } else {
          console.warn(`Station coordinates not found for: ${stationName}`);
        }
      }

      if (stationCoords.length === 0) {
        throw new Error('No station coordinates found for this location');
      }

      // Fetch routes from all stations to the venue
      console.log('Fetching routes for location:', location.name, 'from stations:', stationCoords.map(s => s.name));
      const routes = await fetchMultipleRoutes(stationCoords, location.coordinates);

      if (routes.length === 0) {
        throw new Error('No routes could be calculated');
      }

      console.log('Routes fetched successfully:', routes.length);

      // Add routes to map
      const routeLayers: RouteLayer[] = [];
      const allCoordinates: Array<[number, number]> = [];

      // Add station coordinates and venue coordinates for map fitting
      stationCoords.forEach(station => allCoordinates.push(station.coords));
      allCoordinates.push(location.coordinates);

      routes.forEach(route => {
        if (route.geometry && route.success) {
          try {
            const routeLayer = addRouteToMap(
              mapRef.current,
              route.geometry,
              route.stationName,
              route.color
            );
            routeLayers.push(routeLayer);

            // Add route coordinates for better map fitting
            if (route.geometry.coordinates) {
              route.geometry.coordinates.forEach((coord: [number, number]) => {
                allCoordinates.push(coord);
              });
            }
          } catch (error) {
            console.error(`Failed to add route for ${route.stationName}:`, error);
          }
        }
      });

      // Add station and venue markers
      const stationMarkersData = stationCoords.map((station, index) => ({
        name: station.name,
        coords: station.coords,
        color: routes[index]?.color || '#666666'
      }));

      const markerIds = addStationMarkers(mapRef.current, stationMarkersData, location.coordinates, location.type);

      // Fit map to show all routes
      fitMapToRoutes(mapRef.current, allCoordinates);

      setState(prev => ({
        ...prev,
        isLoading: false,
        routes,
        routeLayers,
        markerIds,
        error: null
      }));

    } catch (error) {
      console.error('Error displaying routes:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load routes',
        routes: [],
        routeLayers: [],
        markerIds: []
      }));
    }
  }, [state.routeLayers, state.markerIds]);

  // Clear all routes from map
  const clearRoutes = useCallback(() => {
    if (!mapRef.current) return;

    if (state.routeLayers.length > 0) {
      clearAllRoutes(mapRef.current, state.routeLayers);
    }
    if (state.markerIds.length > 0) {
      clearMarkers(mapRef.current, state.markerIds);
    }

    setState(prev => ({
      ...prev,
      routes: [],
      routeLayers: [],
      markerIds: [],
      error: null
    }));
  }, [state.routeLayers, state.markerIds]);

  // Get route info for a specific station (for display in UI)
  const getRouteInfo = useCallback((stationName: string) => {
    const route = state.routes.find(r => r.stationName === stationName);
    if (!route || !route.success) return null;

    return {
      distance: formatDistance(route.distance),
      duration: formatDuration(route.duration),
      color: route.color,
      distanceMeters: route.distance,
      durationMinutes: Math.round(route.duration / 60)
    };
  }, [state.routes]);

  return {
    ...state,
    setMapInstance,
    displayRoutesForLocation,
    clearRoutes,
    getRouteInfo
  };
}
// MapLibre utilities for route visualization
// This service handles adding/removing route layers and sources on the map

/**
 * How MapLibre Layers Work:
 *
 * 1. Sources: Data containers that define WHERE the data comes from
 *    - GeoJSON sources hold geographical feature data
 *    - Each source has a unique ID and contains features (points, lines, polygons)
 *
 * 2. Layers: Visual representations that define HOW the data looks
 *    - Reference a source and define styling (color, width, opacity)
 *    - Different layer types: line, fill, circle, symbol, etc.
 *    - Multiple layers can reference the same source with different styling
 *
 * 3. Route Visualization Process:
 *    - Create GeoJSON source with route geometry
 *    - Add line layer that references the source
 *    - Style the layer with color, width, etc.
 *    - Remove source and layer when route should be hidden
 */

export interface RouteLayer {
  sourceId: string;
  layerId: string;
  stationName: string;
  color: string;
}

/**
 * Adds a walking route to the map as a styled line
 *
 * @param map - MapLibre GL JS map instance
 * @param routeGeometry - GeoJSON LineString geometry from OSRM
 * @param stationName - Station name for unique IDs
 * @param color - Line color for this route
 * @returns RouteLayer object with IDs for later removal
 */
export function addRouteToMap(
  map: any,
  routeGeometry: any,
  stationName: string,
  color: string
): RouteLayer {
  // Create unique IDs for this route
  const sourceId = `route-source-${stationName.replace(/\s+/g, '-').toLowerCase()}`;
  const layerId = `route-layer-${stationName.replace(/\s+/g, '-').toLowerCase()}`;

  // Create GeoJSON source with the route geometry
  // GeoJSON Feature format: { type: "Feature", geometry: {...}, properties: {...} }
  const routeGeoJSON = {
    type: 'Feature',
    properties: {
      stationName: stationName
    },
    geometry: routeGeometry
  };

  console.log(`Adding route layer for ${stationName}`, { sourceId, layerId, color });

  try {
    // Add the route as a GeoJSON source
    map.addSource(sourceId, {
      type: 'geojson',
      data: routeGeoJSON
    });

    // Add a line layer that visualizes the route
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': color,
        'line-width': 4,
        'line-opacity': 0.8
      }
    });

    return {
      sourceId,
      layerId,
      stationName,
      color
    };

  } catch (error) {
    console.error(`Error adding route for ${stationName}:`, error);
    throw error;
  }
}

/**
 * Removes a specific route from the map
 *
 * @param map - MapLibre GL JS map instance
 * @param routeLayer - RouteLayer object returned from addRouteToMap
 */
export function removeRouteFromMap(map: any, routeLayer: RouteLayer): void {
  try {
    console.log(`Removing route layer for ${routeLayer.stationName}`);

    // Remove the layer first, then the source
    if (map.getLayer(routeLayer.layerId)) {
      map.removeLayer(routeLayer.layerId);
    }

    if (map.getSource(routeLayer.sourceId)) {
      map.removeSource(routeLayer.sourceId);
    }

  } catch (error) {
    console.error(`Error removing route for ${routeLayer.stationName}:`, error);
  }
}

/**
 * Removes all route layers from the map
 *
 * @param map - MapLibre GL JS map instance
 * @param routeLayers - Array of RouteLayer objects to remove
 */
export function clearAllRoutes(map: any, routeLayers: RouteLayer[]): void {
  routeLayers.forEach(routeLayer => {
    removeRouteFromMap(map, routeLayer);
  });
}

/**
 * Adds station markers to the map
 *
 * @param map - MapLibre GL JS map instance
 * @param stations - Array of station data with coordinates
 * @param venueCoords - Venue coordinates for the destination marker
 * @returns Array of marker IDs for later removal
 */
export function addStationMarkers(
  map: any,
  stations: Array<{ name: string; coords: [number, number]; color: string }>,
  venueCoords: [number, number]
): string[] {
  const markerIds: string[] = [];

  try {
    // Add station markers
    stations.forEach((station, index) => {
      const sourceId = `station-marker-${station.name.replace(/\s+/g, '-').toLowerCase()}`;
      const layerId = `station-layer-${station.name.replace(/\s+/g, '-').toLowerCase()}`;

      const stationGeoJSON = {
        type: 'Feature',
        properties: {
          name: station.name,
          type: 'station'
        },
        geometry: {
          type: 'Point',
          coordinates: station.coords
        }
      };

      map.addSource(sourceId, {
        type: 'geojson',
        data: stationGeoJSON
      });

      map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': 8,
          'circle-color': station.color,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      });

      markerIds.push(sourceId, layerId);
    });

    // Add venue marker
    const venueSourceId = 'venue-marker';
    const venueLayerId = 'venue-layer';

    const venueGeoJSON = {
      type: 'Feature',
      properties: {
        type: 'venue'
      },
      geometry: {
        type: 'Point',
        coordinates: venueCoords
      }
    };

    map.addSource(venueSourceId, {
      type: 'geojson',
      data: venueGeoJSON
    });

    map.addLayer({
      id: venueLayerId,
      type: 'circle',
      source: venueSourceId,
      paint: {
        'circle-radius': 10,
        'circle-color': '#FF4444',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 3
      }
    });

    markerIds.push(venueSourceId, venueLayerId);

    return markerIds;

  } catch (error) {
    console.error('Error adding station markers:', error);
    return [];
  }
}

/**
 * Removes all markers from the map
 *
 * @param map - MapLibre GL JS map instance
 * @param markerIds - Array of source and layer IDs to remove
 */
export function clearMarkers(map: any, markerIds: string[]): void {
  markerIds.forEach(id => {
    try {
      if (map.getLayer(id)) {
        map.removeLayer(id);
      }
      if (map.getSource(id)) {
        map.removeSource(id);
      }
    } catch (error) {
      console.error(`Error removing marker ${id}:`, error);
    }
  });
}

/**
 * Fits the map view to show all routes and markers
 *
 * @param map - MapLibre GL JS map instance
 * @param bounds - Array of coordinates to fit [[lng, lat], [lng, lat], ...]
 */
export function fitMapToRoutes(
  map: any,
  bounds: Array<[number, number]>
): void {
  if (bounds.length === 0) return;

  try {
    // Calculate bounding box
    const lngs = bounds.map(coord => coord[0]);
    const lats = bounds.map(coord => coord[1]);

    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    // Fit map to bounds with padding
    map.fitBounds([
      [minLng, minLat],
      [maxLng, maxLat]
    ], {
      padding: 50,
      duration: 1000
    });

  } catch (error) {
    console.error('Error fitting map to routes:', error);
  }
}
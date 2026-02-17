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
 * Creates custom SVG icon for train stations
 * @param color - The color of the station marker
 * @returns Data URL for the SVG icon
 */
function createStationIcon(color: string): string {
  const svg = `
    <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="#ffffff" stroke-width="2" filter="url(#shadow)"/>
      <!-- Train icon -->
      <rect x="7" y="8" width="10" height="8" rx="1" fill="#ffffff"/>
      <rect x="8" y="9" width="8" height="4" rx="0.5" fill="${color}"/>
      <circle cx="10" cy="11" r="0.8" fill="#ffffff"/>
      <circle cx="14" cy="11" r="0.8" fill="#ffffff"/>
      <rect x="9" y="14" width="6" height="1.5" rx="0.5" fill="#ffffff"/>
      <!-- Train wheels -->
      <circle cx="9" cy="16.5" r="1" fill="#ffffff"/>
      <circle cx="15" cy="16.5" r="1" fill="#ffffff"/>
      <circle cx="9" cy="16.5" r="0.5" fill="${color}"/>
      <circle cx="15" cy="16.5" r="0.5" fill="${color}"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Creates custom SVG icon for art venues based on type
 * @param venueType - Type of venue (art_gallery, art_museum, monument, etc.)
 * @returns Data URL for the SVG icon
 */
function createVenueIcon(venueType: string = 'art_gallery'): string {
  let iconContent = '';
  let color = '#E53E3E';

  switch (venueType) {
    case 'art_museum':
      color = '#9F7AEA'; // Purple for museums
      iconContent = `
        <rect x="7" y="6" width="10" height="10" rx="1" fill="#ffffff"/>
        <rect x="6" y="6" width="2" height="12" fill="#ffffff"/>
        <rect x="16" y="6" width="2" height="12" fill="#ffffff"/>
        <rect x="6" y="4" width="12" height="2" fill="#ffffff"/>
        <rect x="9" y="9" width="2" height="1" fill="${color}"/>
        <rect x="13" y="9" width="2" height="1" fill="${color}"/>
        <rect x="9" y="11" width="6" height="1" fill="${color}"/>
        <rect x="9" y="13" width="4" height="1" fill="${color}"/>
      `;
      break;
    case 'art_gallery':
      color = '#38B2AC'; // Teal for galleries
      iconContent = `
        <rect x="7" y="7" width="10" height="8" rx="1" fill="#ffffff"/>
        <rect x="8" y="9" width="3" height="2" fill="${color}"/>
        <rect x="13" y="9" width="3" height="2" fill="${color}"/>
        <rect x="8" y="12" width="8" height="1" fill="${color}"/>
        <circle cx="10" cy="5" r="1" fill="#ffffff"/>
        <circle cx="14" cy="5" r="1" fill="#ffffff"/>
      `;
      break;
    case 'monument':
      color = '#D69E2E'; // Golden for monuments
      iconContent = `
        <polygon points="12,4 8,8 16,8" fill="#ffffff"/>
        <rect x="10" y="8" width="4" height="8" fill="#ffffff"/>
        <rect x="8" y="16" width="8" height="2" fill="#ffffff"/>
        <circle cx="12" cy="11" r="1" fill="${color}"/>
        <rect x="11" y="13" width="2" height="2" fill="${color}"/>
      `;
      break;
    default:
      iconContent = `
        <path d="M8 16h8v2H8v-2zm0-8h8v6H8V8z" fill="#ffffff"/>
        <rect x="6" y="6" width="2" height="12" fill="#ffffff"/>
        <rect x="16" y="6" width="2" height="12" fill="#ffffff"/>
        <rect x="6" y="6" width="12" height="2" fill="#ffffff"/>
        <circle cx="10" cy="11" r="1" fill="${color}"/>
        <circle cx="14" cy="11" r="1" fill="${color}"/>
      `;
  }

  const svg = `
    <svg width="36" height="36" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="venue-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.4"/>
        </filter>
      </defs>
      <circle cx="12" cy="12" r="11" fill="${color}" stroke="#ffffff" stroke-width="2" filter="url(#venue-shadow)"/>
      ${iconContent}
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Adds station markers to the map with custom icons
 *
 * @param map - MapLibre GL JS map instance
 * @param stations - Array of station data with coordinates
 * @param venueCoords - Venue coordinates for the destination marker
 * @param venueType - Type of venue for custom icon selection
 * @returns Array of marker IDs for later removal
 */
export function addStationMarkers(
  map: any,
  stations: Array<{ name: string; coords: [number, number]; color: string }>,
  venueCoords: [number, number],
  venueType?: string
): string[] {
  const markerIds: string[] = [];

  try {
    // Add station markers with simple circles
    stations.forEach((station, index) => {
      const sourceId = `station-marker-${station.name.replace(/\s+/g, '-').toLowerCase()}`;
      const layerId = `station-layer-${station.name.replace(/\s+/g, '-').toLowerCase()}`;

      const stationGeoJSON = {
        type: 'Feature',
        properties: {
          name: station.name,
          type: 'station',
          color: station.color
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

      // Use simple circle markers
      map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 8, 15, 12, 18, 16],
          'circle-color': ['get', 'color'],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-opacity': 0.8
        }
      });

      // Add text labels
      const textLayerId = `station-text-${station.name.replace(/\s+/g, '-').toLowerCase()}`;
      map.addLayer({
        id: textLayerId,
        type: 'symbol',
        source: sourceId,
        layout: {
          'text-field': ['get', 'name'],
        'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 2],
          'text-anchor': 'top',
          'text-size': ['interpolate', ['linear'], ['zoom'], 10, 9, 15, 11, 18, 13],
          'text-max-width': 8
        },
        paint: {
          'text-color': '#333333',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5
        }
      });

      markerIds.push(sourceId, layerId, textLayerId);
    });

    // Add venue marker with simple circle
    const venueSourceId = 'venue-marker';
    const venueLayerId = 'venue-layer';

    // Choose color based on venue type
    let venueColor = '#E53E3E'; // Red default
    switch (venueType) {
      case 'art_museum':
        venueColor = '#9F7AEA'; // Purple for museums
        break;
      case 'art_gallery':
        venueColor = '#38B2AC'; // Teal for galleries
        break;
      case 'monument':
        venueColor = '#D69E2E'; // Golden for monuments
        break;
    }

    const venueGeoJSON = {
      type: 'Feature',
      properties: {
        type: 'venue',
        color: venueColor
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

    // Use larger circle for venue
    map.addLayer({
      id: venueLayerId,
      type: 'circle',
      source: venueSourceId,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 12, 15, 18, 18, 24],
        'circle-color': ['get', 'color'],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 3,
        'circle-opacity': 0.9
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
 * @param markerIds - Array of source, layer, and icon IDs to remove
 */
export function clearMarkers(map: any, markerIds: string[]): void {
  markerIds.forEach(id => {
    try {
      // Remove layer if it exists
      if (map.getLayer(id)) {
        map.removeLayer(id);
      }

      // Remove source if it exists
      if (map.getSource(id)) {
        map.removeSource(id);
      }

      // Remove image/icon if it exists
      if (map.hasImage && map.hasImage(id)) {
        map.removeImage(id);
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

/**
 * Adds all stations and venues to the map for debugging/verification
 * @param map - MapLibre GL JS map instance
 * @returns Array of marker IDs for later removal
 */
export function addAllMarkersForDebug(map: any): string[] {
  const markerIds: string[] = [];

  try {
    // Import station and location data
    const { stationCoordinates } = require('../data/stationCoordinates');
    const { mockLocations } = require('../data/mockLocations');

    // Add all stations
    Object.values(stationCoordinates).forEach((station: any) => {
      const sourceId = `debug-station-${station.name.replace(/\s+/g, '-').toLowerCase()}`;
      const layerId = `debug-station-layer-${station.name.replace(/\s+/g, '-').toLowerCase()}`;
      const textLayerId = `debug-station-text-${station.name.replace(/\s+/g, '-').toLowerCase()}`;

      const stationGeoJSON = {
        type: 'Feature',
        properties: {
          name: station.name,
          type: 'station',
          color: '#FF6B6B' // Red for stations
        },
        geometry: {
          type: 'Point',
          coordinates: station.coordinates
        }
      };

      map.addSource(sourceId, {
        type: 'geojson',
        data: stationGeoJSON
      });

      // Station circle
      map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': 10,
          'circle-color': '#FF6B6B',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-opacity': 0.8
        }
      });

      // Station label
      map.addLayer({
        id: textLayerId,
        type: 'symbol',
        source: sourceId,
        layout: {
          'text-field': ['get', 'name'],
        'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 2],
          'text-anchor': 'top',
          'text-size': 11,
          'text-max-width': 8
        },
        paint: {
          'text-color': '#333333',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5
        }
      });

      markerIds.push(sourceId, layerId, textLayerId);
    });

    // Add all venues
    mockLocations.forEach((location: any) => {
      const sourceId = `debug-venue-${location.id}`;
      const layerId = `debug-venue-layer-${location.id}`;
      const textLayerId = `debug-venue-text-${location.id}`;

      // Choose color based on venue type
      let venueColor = '#E53E3E'; // Red default
      switch (location.type) {
        case 'art_museum':
          venueColor = '#9F7AEA'; // Purple
          break;
        case 'art_gallery':
          venueColor = '#38B2AC'; // Teal
          break;
        case 'monument':
          venueColor = '#D69E2E'; // Gold
          break;
      }

      const venueGeoJSON = {
        type: 'Feature',
        properties: {
          name: location.name,
          type: 'venue',
          color: venueColor
        },
        geometry: {
          type: 'Point',
          coordinates: location.coordinates
        }
      };

      map.addSource(sourceId, {
        type: 'geojson',
        data: venueGeoJSON
      });

      // Venue circle (larger)
      map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': 15,
          'circle-color': venueColor,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 3,
          'circle-opacity': 0.9
        }
      });

      // Venue label
      map.addLayer({
        id: textLayerId,
        type: 'symbol',
        source: sourceId,
        layout: {
          'text-field': ['get', 'name'],
        'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 2.5],
          'text-anchor': 'top',
          'text-size': 12,
          'text-max-width': 10
        },
        paint: {
          'text-color': '#333333',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2
        }
      });

      markerIds.push(sourceId, layerId, textLayerId);
    });

    return markerIds;

  } catch (error) {
    console.error('Error adding debug markers:', error);
    return [];
  }
}
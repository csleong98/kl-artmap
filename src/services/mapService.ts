import { animate } from 'motion';

// Map marker utilities for placing custom SVG pins on the map

/**
 * Creates a custom SVG pin marker DOM element
 * @param fillColor - The fill color of the pin body
 * @param strokeColor - The stroke/accent color (also used for inner circle)
 * @param markerId - Optional ID for linking markers to list items
 * @returns HTMLDivElement containing the SVG pin
 */
function createPinElement(fillColor: string, strokeColor: string = '#154C66', markerId?: string): HTMLDivElement {
  const el = document.createElement('div');
  el.style.width = '40px';
  el.style.height = '40px';
  el.style.cursor = 'pointer';
  if (markerId) {
    el.setAttribute('data-marker-id', markerId);
  }
  el.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.0005 3.85742C27.3427 3.85765 33.2855 9.7772 33.2856 17.0684C33.2856 20.72 31.4305 25.5425 28.729 29.4834C27.3873 31.4406 25.8704 33.13 24.3325 34.3193C22.782 35.5185 21.2982 36.1434 20.0005 36.1436C18.7027 36.1436 17.2182 35.5186 15.6675 34.3193C14.1296 33.13 12.6127 31.4406 11.271 29.4834C8.56949 25.5425 6.71436 20.72 6.71436 17.0684C6.71449 9.77706 12.6581 3.85742 20.0005 3.85742Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
      <circle cx="19.9999" cy="17.1434" r="6.42857" fill="${strokeColor}"/>
    </svg>
  `;

  // Animate the SVG inside (not the container, which Mapbox controls)
  const svg = el.querySelector('svg')!;
  svg.style.transformOrigin = 'center bottom';

  el.addEventListener('mouseenter', () => {
    animate(svg, { scale: 1.2 }, { duration: 0.2 });
  });
  el.addEventListener('mouseleave', () => {
    animate(svg, { scale: 1 }, { duration: 0.2 });
  });

  return el;
}

/**
 * Removes all markers from the map
 *
 * @param markers - Array of Mapbox Marker instances to remove
 */
export function clearMarkers(markers: any[]): void {
  markers.forEach(marker => {
    try {
      if (marker && typeof marker.remove === 'function') {
        marker.remove();
      }
    } catch (error) {
      console.error('Error removing marker:', error);
    }
  });
}

/**
 * Adds all stations and venues to the map using custom SVG pin markers
 * @param map - Mapbox GL JS map instance
 * @returns Array of Mapbox Marker instances
 */
export async function addAllMarkers(map: any): Promise<any[]> {
  const markers: any[] = [];

  try {
    const mapboxgl = (await import('mapbox-gl')).default;
    const { mockLocations } = require('../data/mockLocations');

    // Add all venues
    mockLocations.forEach((location: any) => {
      let venueColor = '#E53E3E';
      let strokeColor = '#154C66';
      switch (location.type) {
        case 'art_museum':
          venueColor = '#9F7AEA';
          strokeColor = '#553C9A';
          break;
        case 'art_gallery':
          venueColor = '#38B2AC';
          strokeColor = '#1D4044';
          break;
        case 'monument':
          venueColor = '#D69E2E';
          strokeColor = '#744210';
          break;
      }

      const el = createPinElement(venueColor, strokeColor, location.name);
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(location.coordinates)
        .addTo(map);
      markers.push(marker);
    });

    return markers;

  } catch (error) {
    console.error('Error adding markers:', error);
    return [];
  }
}

// ── Station markers (shown only when viewing nearby stations) ─────

/**
 * Adds station pin markers for nearby stations when routes are displayed.
 * Returns an array of Marker instances so they can be removed later.
 */
export async function addStationMarkers(
  map: any,
  stations: { name: string; coordinates: [number, number]; color: string }[]
): Promise<any[]> {
  const mapboxgl = (await import('mapbox-gl')).default;
  return stations.map(station => {
    const el = createPinElement(station.color, '#1a1a2e', `station-${station.name}`);
    return new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(station.coordinates)
      .addTo(map);
  });
}

/**
 * Removes station markers from the map.
 */
export function clearStationMarkers(markers: any[]): void {
  markers.forEach(m => {
    try { m.remove(); } catch (_) {}
  });
}

// ── Route drawing ──────────────────────────────────────────────────

/**
 * Adds a walking route line to the map as a dashed GeoJSON layer.
 */
export function addRouteLayer(
  map: any,
  routeId: string,
  geometry: GeoJSON.LineString,
  color: string
): void {
  // Avoid duplicates
  if (map.getSource(routeId)) return;

  const casingId = `${routeId}-casing`;

  map.addSource(routeId, {
    type: 'geojson',
    data: { type: 'Feature', geometry, properties: {} },
  });

  // Casing (outline) layer — wider, dark, drawn underneath
  map.addLayer({
    id: casingId,
    type: 'line',
    source: routeId,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': '#1a1a2e',
      'line-width': 8,
      'line-opacity': 0.3,
    },
  });

  // Main route line — colored, dashed, on top of casing
  map.addLayer({
    id: routeId,
    type: 'line',
    source: routeId,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': color,
      'line-width': 5,
      'line-opacity': 0.9,
      'line-dasharray': [3, 1.5],
    },
  });
}

/**
 * Removes route layers and their sources from the map.
 */
export function clearRouteLayers(map: any, routeIds: string[]): void {
  for (const id of routeIds) {
    try {
      const casingId = `${id}-casing`;
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getLayer(casingId)) map.removeLayer(casingId);
      if (map.getSource(id)) map.removeSource(id);
    } catch (err) {
      console.error('Error clearing route layer:', id, err);
    }
  }
}

/**
 * Highlights the selected route and dims all others.
 */
export function highlightRoute(map: any, selectedRouteId: string, allRouteIds: string[]): void {
  for (const id of allRouteIds) {
    const casingId = `${id}-casing`;
    if (id === selectedRouteId) {
      if (map.getLayer(id)) {
        map.setPaintProperty(id, 'line-opacity', 1);
        map.setPaintProperty(id, 'line-width', 6);
      }
      if (map.getLayer(casingId)) {
        map.setPaintProperty(casingId, 'line-opacity', 0.4);
        map.setPaintProperty(casingId, 'line-width', 10);
      }
    } else {
      if (map.getLayer(id)) {
        map.setPaintProperty(id, 'line-opacity', 0.15);
      }
      if (map.getLayer(casingId)) {
        map.setPaintProperty(casingId, 'line-opacity', 0.05);
      }
    }
  }
}

/**
 * Restores all routes to their default opacity.
 */
export function unhighlightRoutes(map: any, allRouteIds: string[]): void {
  for (const id of allRouteIds) {
    const casingId = `${id}-casing`;
    if (map.getLayer(id)) {
      map.setPaintProperty(id, 'line-opacity', 0.9);
      map.setPaintProperty(id, 'line-width', 5);
    }
    if (map.getLayer(casingId)) {
      map.setPaintProperty(casingId, 'line-opacity', 0.3);
      map.setPaintProperty(casingId, 'line-width', 8);
    }
  }
}

/**
 * Fits the map view to contain all given coordinates with padding.
 */
export function fitMapToBounds(map: any, coordinates: [number, number][]): void {
  if (coordinates.length < 2) return;

  const bounds = coordinates.reduce(
    (b, coord) => {
      return {
        minLng: Math.min(b.minLng, coord[0]),
        maxLng: Math.max(b.maxLng, coord[0]),
        minLat: Math.min(b.minLat, coord[1]),
        maxLat: Math.max(b.maxLat, coord[1]),
      };
    },
    { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
  );

  map.fitBounds(
    [
      [bounds.minLng, bounds.minLat],
      [bounds.maxLng, bounds.maxLat],
    ],
    { padding: 80, duration: 1000 }
  );
}

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
 * Mutes all place markers except the selected one.
 */
export function muteOtherMarkers(selectedName: string): void {
  const allMarkers = document.querySelectorAll('[data-marker-id]');
  allMarkers.forEach(el => {
    const htmlEl = el as HTMLElement;
    if (htmlEl.getAttribute('data-marker-id') === selectedName) {
      htmlEl.style.opacity = '1';
    } else {
      htmlEl.style.opacity = '0.3';
    }
  });
}

/**
 * Restores all place markers to full opacity.
 */
export function unmuteAllMarkers(): void {
  const allMarkers = document.querySelectorAll('[data-marker-id]');
  allMarkers.forEach(el => {
    (el as HTMLElement).style.opacity = '1';
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

    // Add all venues with uniform color
    mockLocations.forEach((location: any) => {
      const el = createPinElement('#E53E3E', '#154C66', location.name);
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

// ── Route styling constants ────────────────────────────────────────

const ROUTE_COLORS = {
  active:  { line: '#285ABD', casing: '#1B3C7E' },
  muted:   { line: '#C9C9C9', casing: '#6B6B6B' },
} as const;

// ── Route drawing ──────────────────────────────────────────────────

/**
 * Adds a walking route line to the map as a GeoJSON layer.
 * @param isActive - true → bold blue, false → muted gray
 */
export function addRouteLayer(
  map: any,
  routeId: string,
  geometry: GeoJSON.LineString,
  isActive: boolean
): void {
  // Avoid duplicates
  if (map.getSource(routeId)) return;

  const casingId = `${routeId}-casing`;
  const palette = isActive ? ROUTE_COLORS.active : ROUTE_COLORS.muted;

  map.addSource(routeId, {
    type: 'geojson',
    data: { type: 'Feature', geometry, properties: {} },
  });

  // Casing (outline) layer — wider, drawn underneath
  map.addLayer({
    id: casingId,
    type: 'line',
    source: routeId,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': palette.casing,
      'line-width': isActive ? 10 : 7,
      'line-opacity': isActive ? 0.8 : 0.5,
    },
  });

  // Main route line — on top of casing
  map.addLayer({
    id: routeId,
    type: 'line',
    source: routeId,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': palette.line,
      'line-width': isActive ? 6 : 4,
      'line-opacity': isActive ? 1 : 0.7,
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
 * Swaps one route to active styling and all others to muted.
 * Also moves the active route's layers to the top so it draws over muted routes.
 */
export function setActiveRoute(map: any, activeRouteId: string, allRouteIds: string[]): void {
  for (const id of allRouteIds) {
    const casingId = `${id}-casing`;
    const isActive = id === activeRouteId;
    const palette = isActive ? ROUTE_COLORS.active : ROUTE_COLORS.muted;

    if (map.getLayer(id)) {
      map.setPaintProperty(id, 'line-color', palette.line);
      map.setPaintProperty(id, 'line-width', isActive ? 6 : 4);
      map.setPaintProperty(id, 'line-opacity', isActive ? 1 : 0.7);
    }
    if (map.getLayer(casingId)) {
      map.setPaintProperty(casingId, 'line-color', palette.casing);
      map.setPaintProperty(casingId, 'line-width', isActive ? 10 : 7);
      map.setPaintProperty(casingId, 'line-opacity', isActive ? 0.8 : 0.5);
    }
  }

  // Move the active route's layers to the top so it renders above muted routes
  const activeCasingId = `${activeRouteId}-casing`;
  if (map.getLayer(activeCasingId)) map.moveLayer(activeCasingId);
  if (map.getLayer(activeRouteId)) map.moveLayer(activeRouteId);
}

// ── Route endpoint markers ─────────────────────────────────────────

/**
 * Adds endpoint markers for a walking route.
 * Green pin at the station (start of walk), red pin at the art venue (destination).
 * @param start - location/art venue coordinates
 * @param end - station coordinates
 * Returns the marker array for cleanup.
 */
export async function addRouteEndpointMarkers(
  map: any,
  start: [number, number],
  end: [number, number]
): Promise<any[]> {
  const mapboxgl = (await import('mapbox-gl')).default;

  const startEl = createPinElement('#E53E3E', '#9B2C2C'); // red — art venue (destination)
  const endEl   = createPinElement('#38A169', '#276749'); // green — station (start of walk)

  const startMarker = new mapboxgl.Marker({ element: startEl, anchor: 'bottom' })
    .setLngLat(start)
    .addTo(map);
  const endMarker = new mapboxgl.Marker({ element: endEl, anchor: 'bottom' })
    .setLngLat(end)
    .addTo(map);

  return [startMarker, endMarker];
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

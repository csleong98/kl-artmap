import { animate } from 'motion';
import { createActivePinElement } from '../components/ui/active-pin';

// Map marker utilities for placing custom SVG pins on the map

// Track the currently active marker state
let activeMarkerState: {
  marker: any | null;
  defaultElement: HTMLElement | null;
  location: any | null;
  label: HTMLElement | null;
} = {
  marker: null,
  defaultElement: null,
  location: null,
  label: null
};

/**
 * Get icon SVG path based on location type
 * Using Lucide icon paths
 */
function getIconPath(locationType?: string, color: string = 'currentColor'): string {
  // Replace currentColor with actual color
  const paths = {
    art_museum: '<path d="M3 21h18M6 21V7m12 14V7m-6 14V3m-1 0l-2 2m3-2l2 2M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    art_gallery: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M6 12h12M2 22h20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M10 6v0M14 6v0M10 10v0M14 10v0M10 14v0M14 14v0M10 18v0M14 18v0" stroke-width="2.5" stroke-linecap="round"/>',
    monument: '<path d="M2 22h20M4 22V10M20 22V10M7 22V7M17 22V7M4 10h16M7 7V4M17 7V4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="7" cy="4" r="1"/><circle cx="17" cy="4" r="1"/>',
    street_art: '<rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="9" cy="9" r="2" stroke-width="2" fill="none"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    default: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M6 12h12M2 22h20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M10 6v0M14 6v0M10 10v0M14 10v0M10 14v0M14 14v0M10 18v0M14 18v0" stroke-width="2.5" stroke-linecap="round"/>'
  };

  const selectedPath = paths[locationType as keyof typeof paths] || paths.default;
  return selectedPath.replace(/stroke-width/g, `stroke="${color}" stroke-width`).replace(/fill="none"/g, `fill="none"`);
}

/**
 * Creates a simple circular pin marker (default state)
 * @param fillColor - The fill color of the circle
 * @param markerId - Optional ID for linking markers to list items
 * @param locationType - Type of location for icon selection
 * @param imageUrl - Optional image URL for the pin
 * @returns HTMLDivElement containing the pin
 */
function createDefaultPinElement(fillColor: string, markerId?: string, locationType?: string, imageUrl?: string): HTMLDivElement {
  const el = document.createElement('div');
  el.style.width = '50px';
  el.style.height = '60px';
  el.style.cursor = 'pointer';
  el.classList.add('map-marker');
  if (markerId) {
    el.setAttribute('data-marker-id', markerId);
    el.setAttribute('data-marker-color', fillColor);
    el.setAttribute('data-location-type', locationType || '');
  }

  el.innerHTML = getDefaultPinSVG(fillColor, locationType, imageUrl);

  // Hover animation - scale the pin inside, not the container
  const pinElement = el.querySelector('div')!;
  el.addEventListener('mouseenter', () => {
    pinElement.style.transform = 'scale(1.15)';
  });
  el.addEventListener('mouseleave', () => {
    pinElement.style.transform = 'scale(1)';
  });

  return el;
}

/**
 * Helper function to adjust color brightness
 */
function adjustBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Creates a label element for the active pin
 */
function createLabelElement(location: any): HTMLDivElement {
  const label = document.createElement('div');
  label.className = 'pin-label';
  label.style.cssText = `
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: white;
    text-align: center;
    white-space: nowrap;
    text-shadow:
      -1px -1px 0 rgba(0,0,0,0.8),
      1px -1px 0 rgba(0,0,0,0.8),
      -1px 1px 0 rgba(0,0,0,0.8),
      1px 1px 0 rgba(0,0,0,0.8),
      0 0 4px rgba(0,0,0,0.6),
      0 2px 8px rgba(0,0,0,0.4);
    animation: labelFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
  `;

  label.textContent = location.name;

  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes labelFadeIn {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
  `;
  if (!document.head.querySelector('style[data-label-animation]')) {
    style.setAttribute('data-label-animation', 'true');
    document.head.appendChild(style);
  }

  return label;
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
 * Gets the default pin HTML content (CSS-based design)
 * Anchor point is at bottom center (25, 50)
 */
function getDefaultPinSVG(fillColor: string, locationType?: string, imageUrl?: string): string {
  const uniqueId = Date.now();
  const clipId = `clip-${uniqueId}`;

  return `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      filter: drop-shadow(0 10px 28px rgba(0,0,0,0.35));
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center bottom;
      width: 50px;
      height: 60px;
    ">
      <!-- Circular bubble with photo -->
      <div style="
        width: 50px;
        height: 50px;
        border-radius: 50%;
        overflow: hidden;
        background: ${fillColor};
        border: 5px solid #111;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${imageUrl ? `
          <img
            src="${imageUrl}"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
              object-position: center;
            "
            alt="Location"
          />
        ` : ''}
      </div>

      <!-- Triangle tail -->
      <div style="
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 10px solid #111;
        margin-top: -2px;
      "></div>
    </div>
  `;
}

/**
 * Gets the active pin HTML content (CSS-based design)
 * Anchor point is at bottom center (40, 95)
 */
function getActivePinSVG(location: any, fillColor: string, locationType?: string): string {
  const uniqueId = Date.now();
  const imageUrl = location.images?.[0] || location.imageUrl;

  return `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      filter: drop-shadow(0 10px 28px rgba(0,0,0,0.35));
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center bottom;
      width: 80px;
      height: 95px;
    ">
      <!-- Circular bubble with photo -->
      <div style="
        width: 80px;
        height: 80px;
        border-radius: 50%;
        overflow: hidden;
        background: ${fillColor};
        border: 8px solid #111;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${imageUrl ? `
          <img
            src="${imageUrl}"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
              object-position: center;
            "
            alt="${location.name}"
          />
        ` : ''}
      </div>

      <!-- Triangle tail -->
      <div style="
        width: 0;
        height: 0;
        border-left: 15px solid transparent;
        border-right: 15px solid transparent;
        border-top: 15px solid #111;
        margin-top: -3px;
      "></div>
    </div>
  `;
}

/**
 * Activates a marker by swapping its content
 */
function activateMarker(_map: any, marker: any, location: any): void {
  // If clicking the same marker, deactivate it
  if (activeMarkerState.marker === marker) {
    deactivateMarker();
    return;
  }

  // Deactivate previous marker if exists
  if (activeMarkerState.marker) {
    deactivateMarker();
  }

  // Store the marker reference and location
  activeMarkerState.marker = marker;
  activeMarkerState.location = location;

  // Get the marker element and swap its content
  const element = marker.getElement();
  const fillColor = element.getAttribute('data-marker-color') || '#111';
  const locationType = element.getAttribute('data-location-type') || undefined;

  // Swap to active pin
  element.innerHTML = getActivePinSVG(location, fillColor, locationType);

  // Update size for active state
  element.style.width = '80px';
  element.style.height = '95px';

  // Re-attach hover listeners
  const pinElement = element.querySelector('div')!;
  element.onmouseenter = () => { pinElement.style.transform = 'scale(1.1)'; };
  element.onmouseleave = () => { pinElement.style.transform = 'scale(1)'; };

  // Create and add label
  const labelElement = createLabelElement(location);
  element.appendChild(labelElement);
  activeMarkerState.label = labelElement;
}

/**
 * Deactivates the current active marker
 */
function deactivateMarker(): void {
  if (!activeMarkerState.marker || !activeMarkerState.location) {
    return;
  }

  // Get the marker element
  const element = activeMarkerState.marker.getElement();
  const fillColor = element.getAttribute('data-marker-color') || '#111';
  const locationType = element.getAttribute('data-location-type') || undefined;
  const location = activeMarkerState.location;
  const imageUrl = location.images?.[0] || location.imageUrl;

  // Swap back to default pin
  element.innerHTML = getDefaultPinSVG(fillColor, locationType, imageUrl);

  // Restore default size
  element.style.width = '50px';
  element.style.height = '60px';

  // Re-attach hover listeners
  const pinElement = element.querySelector('div')!;
  element.onmouseenter = () => { pinElement.style.transform = 'scale(1.15)'; };
  element.onmouseleave = () => { pinElement.style.transform = 'scale(1)'; };

  // Remove label if exists
  if (activeMarkerState.label) {
    activeMarkerState.label.remove();
  }

  // Clear state
  activeMarkerState = {
    marker: null,
    defaultElement: null,
    location: null,
    label: null
  };
}

/**
 * Adds all stations and venues to the map using custom SVG pin markers
 * @param map - Mapbox GL JS map instance
 * @param onMarkerClick - Callback when a marker is clicked
 * @returns Array of Mapbox Marker instances
 */
export async function addAllMarkers(map: any, onMarkerClick?: (location: any) => void): Promise<any[]> {
  const markers: any[] = [];

  try {
    const mapboxgl = (await import('mapbox-gl')).default;
    const { getAllLocations } = await import('../data/helpers');
    const mockLocations = getAllLocations();

    // Add all venues with default circular pins (no activation)
    mockLocations.forEach((location: any) => {
      const imageUrl = location.images?.[0] || location.imageUrl;
      const el = createDefaultPinElement('#111', location.name, location.type, imageUrl);
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(location.coordinates)
        .addTo(map);

      // Simple click - just notify parent
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onMarkerClick) {
          onMarkerClick(location);
        }
      });

      markers.push(marker);
    });

    // Click map to deselect
    map.on('click', () => {
      if (onMarkerClick) {
        onMarkerClick(null);
      }
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

  const startEl = createDefaultPinElement('#111');
  const endEl   = createDefaultPinElement('#111');

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

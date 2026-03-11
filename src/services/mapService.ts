import { animate } from 'motion';
import { createActivePinElement } from '../components/ui/active-pin';

// Map marker utilities for placing custom SVG pins on the map

// Track the currently active marker state
let activeMarkerState: {
  marker: any | null;
  defaultElement: HTMLElement | null;
  location: any | null;
} = {
  marker: null,
  defaultElement: null,
  location: null
};

/**
 * Creates a simple circular pin marker (default state)
 * @param fillColor - The fill color of the circle
 * @param markerId - Optional ID for linking markers to list items
 * @returns HTMLDivElement containing the SVG circle
 */
function createDefaultPinElement(fillColor: string, markerId?: string): HTMLDivElement {
  const el = document.createElement('div');
  el.style.width = '50px';
  el.style.height = '54px';
  el.style.cursor = 'pointer';
  el.classList.add('map-marker');
  if (markerId) {
    el.setAttribute('data-marker-id', markerId);
    el.setAttribute('data-marker-color', fillColor);
  }

  el.innerHTML = getDefaultPinSVG(fillColor);

  // Hover animation - scale the SVG inside, not the container
  const svg = el.querySelector('svg')!;
  el.addEventListener('mouseenter', () => {
    svg.style.transform = 'scale(1.15)';
  });
  el.addEventListener('mouseleave', () => {
    svg.style.transform = 'scale(1)';
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
 * Gets the default pin SVG content
 * Anchor point is at bottom center (25, 50)
 */
function getDefaultPinSVG(fillColor: string): string {
  const gradientId = `circle-gradient-${Date.now()}`;
  const shineId = `shine-${Date.now()}`;
  const shadowId = `shadow-${Date.now()}`;

  return `
    <svg width="50" height="54" viewBox="0 0 50 54" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 8px rgba(0,0,0,0.3)) drop-shadow(0 1px 2px rgba(0,0,0,0.2)); transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); transform-origin: center bottom;">
      <defs>
        <!-- Main radial gradient for 3D sphere effect -->
        <radialGradient id="${gradientId}" cx="35%" cy="35%">
          <stop offset="0%" stop-color="${adjustBrightness(fillColor, 40)}" />
          <stop offset="50%" stop-color="${fillColor}" />
          <stop offset="100%" stop-color="${adjustBrightness(fillColor, -30)}" />
        </radialGradient>

        <!-- Shine/highlight gradient -->
        <radialGradient id="${shineId}" cx="30%" cy="30%">
          <stop offset="0%" stop-color="white" stop-opacity="0.5" />
          <stop offset="50%" stop-color="white" stop-opacity="0.2" />
          <stop offset="100%" stop-color="white" stop-opacity="0" />
        </radialGradient>

        <!-- Inner shadow for depth -->
        <radialGradient id="${shadowId}" cx="50%" cy="50%">
          <stop offset="70%" stop-color="transparent" />
          <stop offset="100%" stop-color="rgba(0,0,0,0.2)" />
        </radialGradient>
      </defs>

      <!-- Outer glow/shadow circle -->
      <circle cx="25" cy="25" r="16.5" fill="${fillColor}" opacity="0.2"/>

      <!-- Main circle with gradient -->
      <circle cx="25" cy="25" r="15" fill="url(#${gradientId})" stroke="white" stroke-width="2.5" stroke-opacity="0.9"/>

      <!-- Inner shadow overlay -->
      <circle cx="25" cy="25" r="15" fill="url(#${shadowId})"/>

      <!-- Shine/highlight -->
      <ellipse cx="21" cy="20" rx="8" ry="9" fill="url(#${shineId})"/>

      <!-- Inner icon circle -->
      <circle cx="25" cy="25" r="5" fill="rgba(0,0,0,0.4)"/>

      <!-- Anchor dot at bottom with space for full circle -->
      <circle cx="25" cy="51" r="3" fill="${fillColor}" opacity="0.3"/>
      <circle cx="25" cy="51" r="2" fill="${fillColor}" opacity="0.9"/>
    </svg>
  `;
}

/**
 * Gets the active pin SVG content
 * Anchor point is at bottom center (30, 80)
 */
function getActivePinSVG(location: any, fillColor: string): string {
  const clipId = `pin-clip-${Date.now()}`;
  const badgeGradientId = `badge-gradient-${Date.now()}`;
  const shineId = `shine-active-${Date.now()}`;
  const pointerGradientId = `pointer-gradient-${Date.now()}`;
  const shadowId = `shadow-active-${Date.now()}`;

  return `
    <svg width="60" height="85" viewBox="0 0 60 85" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 6px 12px rgba(0,0,0,0.35)) drop-shadow(0 2px 4px rgba(0,0,0,0.2)); transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); transform-origin: center bottom;">
      <defs>
        <!-- Radial gradient for badge sphere -->
        <radialGradient id="${badgeGradientId}" cx="35%" cy="35%">
          <stop offset="0%" stop-color="${adjustBrightness(fillColor, 40)}" />
          <stop offset="50%" stop-color="${fillColor}" />
          <stop offset="100%" stop-color="${adjustBrightness(fillColor, -30)}" />
        </radialGradient>

        <!-- Shine effect -->
        <radialGradient id="${shineId}" cx="30%" cy="25%">
          <stop offset="0%" stop-color="white" stop-opacity="0.6" />
          <stop offset="40%" stop-color="white" stop-opacity="0.3" />
          <stop offset="100%" stop-color="white" stop-opacity="0" />
        </radialGradient>

        <!-- Pointer gradient -->
        <linearGradient id="${pointerGradientId}" x1="30" y1="52" x2="30" y2="78">
          <stop offset="0%" stop-color="${fillColor}" />
          <stop offset="100%" stop-color="${adjustBrightness(fillColor, -35)}" />
        </linearGradient>

        <!-- Inner shadow -->
        <radialGradient id="${shadowId}" cx="50%" cy="50%">
          <stop offset="75%" stop-color="transparent" />
          <stop offset="100%" stop-color="rgba(0,0,0,0.15)" />
        </radialGradient>

        <!-- Clip path for image -->
        <clipPath id="${clipId}">
          <circle cx="30" cy="30" r="20" />
        </clipPath>
      </defs>

      <!-- Outer glow -->
      <circle cx="30" cy="30" r="27" fill="${fillColor}" opacity="0.15"/>

      <!-- Main badge circle with 3D effect -->
      <circle cx="30" cy="30" r="25" fill="url(#${badgeGradientId})" stroke="white" stroke-width="3" stroke-opacity="0.95"/>

      <!-- Inner shadow for depth -->
      <circle cx="30" cy="30" r="25" fill="url(#${shadowId})"/>

      <!-- White background for image/icon -->
      <circle cx="30" cy="30" r="21" fill="white" opacity="0.97"/>

      <!-- Content: Image or icon -->
      ${location.imageUrl
        ? `<image href="${location.imageUrl}" x="10" y="10" width="40" height="40" clip-path="url(#${clipId})" preserveAspectRatio="xMidYMid slice"/>`
        : `<circle cx="30" cy="30" r="7" fill="${fillColor}" opacity="0.7"/>`
      }

      <!-- Inner border for content -->
      <circle cx="30" cy="30" r="20" fill="none" stroke="${fillColor}" stroke-width="1" stroke-opacity="0.2"/>

      <!-- Shine highlight -->
      <ellipse cx="24" cy="22" rx="12" ry="14" fill="url(#${shineId})"/>

      <!-- Pointer/teardrop tail with 3D effect -->
      <g>
        <!-- Pointer shadow -->
        <path d="M 30 54 L 27.5 77 L 30 80 L 32.5 77 Z" fill="rgba(0,0,0,0.2)" transform="translate(1, 1)"/>
        <!-- Main pointer -->
        <path d="M 30 52 L 27 76 L 30 80 L 33 76 Z" fill="url(#${pointerGradientId})" stroke="white" stroke-width="2" stroke-opacity="0.9"/>
        <!-- Pointer highlight -->
        <path d="M 30 52 L 28.5 68 L 30 74 L 31.5 68 Z" fill="white" opacity="0.25"/>
      </g>

      <!-- Anchor dot at bottom with space for full circle -->
      <circle cx="30" cy="81" r="4" fill="${fillColor}" opacity="0.25"/>
      <circle cx="30" cy="81" r="2.5" fill="${fillColor}" opacity="0.95"/>
      <circle cx="30" cy="80" r="1" fill="white" opacity="0.6"/>
    </svg>
  `;
}

/**
 * Activates a marker by swapping its SVG content
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
  const fillColor = element.getAttribute('data-marker-color') || '#E53E3E';

  // Swap to active pin SVG
  element.innerHTML = getActivePinSVG(location, fillColor);

  // Update size for active state
  element.style.width = '60px';
  element.style.height = '85px';

  // Re-attach hover listeners
  const svg = element.querySelector('svg')!;
  element.onmouseenter = () => { svg.style.transform = 'scale(1.1)'; };
  element.onmouseleave = () => { svg.style.transform = 'scale(1)'; };
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
  const fillColor = element.getAttribute('data-marker-color') || '#E53E3E';

  // Swap back to default pin SVG
  element.innerHTML = getDefaultPinSVG(fillColor);

  // Restore default size
  element.style.width = '50px';
  element.style.height = '54px';

  // Re-attach hover listeners
  const svg = element.querySelector('svg')!;
  element.onmouseenter = () => { svg.style.transform = 'scale(1.15)'; };
  element.onmouseleave = () => { svg.style.transform = 'scale(1)'; };

  // Clear state
  activeMarkerState = {
    marker: null,
    defaultElement: null,
    location: null
  };
}

/**
 * Adds all stations and venues to the map using custom SVG pin markers
 * @param map - Mapbox GL JS map instance
 * @returns Array of Mapbox Marker instances
 */
export async function addAllMarkers(map: any): Promise<any[]> {
  const markers: any[] = [];

  // Store map instance globally for deactivation
  (window as any).__mapInstance = map;

  try {
    const mapboxgl = (await import('mapbox-gl')).default;
    const { mockLocations } = require('../data/mockLocations');

    // Add all venues with default circular pins
    mockLocations.forEach((location: any) => {
      const el = createDefaultPinElement('#E53E3E', location.name);
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(location.coordinates)
        .addTo(map);

      // Add click handler to activate pin
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        activateMarker(map, marker, location);
      });

      markers.push(marker);
    });

    // Add click handler to map to deactivate when clicking elsewhere
    map.on('click', () => {
      deactivateMarker();
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

  const startEl = createDefaultPinElement('#E53E3E'); // red — art venue (destination)
  const endEl   = createDefaultPinElement('#38A169'); // green — station (start of walk)

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

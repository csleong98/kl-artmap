// Mapbox Walking Directions API layer
// Pure fetch functions — no React or map dependencies

const MAPBOX_BASE = 'https://api.mapbox.com';

function getAccessToken(): string {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token) throw new Error('Missing NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN');
  return token;
}

export interface MatrixResult {
  distances: number[];   // meters
  durations: number[];   // seconds
  success: boolean;
}

export interface RouteStep {
  distance: number;
  duration: number;
  name: string;
  instruction: string;
  maneuverType: string;
  maneuverModifier?: string;
  isCrossing: boolean;
}

export interface DirectionsResult {
  distance: number;      // meters
  duration: number;      // seconds
  geometry: GeoJSON.LineString;
  steps: RouteStep[];
  success: boolean;
}

/**
 * Fetch walking distances/durations from one origin to multiple destinations
 * using the Mapbox Matrix API.
 *
 * Origin = art location, destinations = station coordinates.
 */
export async function fetchMatrixDistances(
  origin: [number, number],
  destinations: [number, number][],
  signal?: AbortSignal
): Promise<MatrixResult> {
  try {
    const coords = [origin, ...destinations]
      .map(c => `${c[0]},${c[1]}`)
      .join(';');

    const destIndices = destinations.map((_, i) => i + 1).join(';');

    const url = `${MAPBOX_BASE}/directions-matrix/v1/mapbox/walking/${coords}?sources=0&destinations=${destIndices}&annotations=distance,duration&access_token=${getAccessToken()}`;

    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Matrix API ${res.status}`);

    const data = await res.json();

    if (data.code !== 'Ok') throw new Error(`Matrix API: ${data.code}`);

    return {
      distances: data.distances[0],  // first (only) source row
      durations: data.durations[0],
      success: true,
    };
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    console.error('Matrix API error:', err);
    return { distances: [], durations: [], success: false };
  }
}

/**
 * Fetch a walking route GeoJSON between two points
 * using the Mapbox Directions API.
 */
export async function fetchDirectionsRoute(
  start: [number, number],
  end: [number, number],
  signal?: AbortSignal
): Promise<DirectionsResult> {
  try {
    const coords = `${start[0]},${start[1]};${end[0]},${end[1]}`;
    const url = `${MAPBOX_BASE}/directions/v5/mapbox/walking/${coords}?geometries=geojson&steps=true&access_token=${getAccessToken()}`;

    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Directions API ${res.status}`);

    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes?.length) {
      throw new Error(`Directions API: ${data.code}`);
    }

    const route = data.routes[0];
    const steps: RouteStep[] = (route.legs?.[0]?.steps ?? []).map((s: any) => ({
      distance: s.distance,
      duration: s.duration,
      name: s.name || '',
      instruction: s.maneuver?.instruction || '',
      maneuverType: s.maneuver?.type || '',
      maneuverModifier: s.maneuver?.modifier,
      isCrossing: (s.maneuver?.instruction || '').toLowerCase().includes('cross'),
    }));

    return {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
      steps,
      success: true,
    };
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    console.error('Directions API error:', err);
    return { distance: 0, duration: 0, geometry: { type: 'LineString', coordinates: [] }, steps: [], success: false };
  }
}

/** Format meters → "150m" or "1.2km" */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/** Format seconds → "15 mins" or "1h 30m" */
export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} mins`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

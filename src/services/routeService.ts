// Route service for fetching walking routes using OSRM API
// OSRM (Open Source Routing Machine) provides routing services for OpenStreetMap data

export interface RouteResult {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: any; // GeoJSON geometry object
  success: boolean;
  error?: string;
}

export interface RouteRequest {
  start: [number, number]; // [longitude, latitude]
  end: [number, number]; // [longitude, latitude]
}

/**
 * Fetches a walking route between two coordinates using OSRM API
 *
 * How OSRM works:
 * - OSRM is an open-source routing engine based on OpenStreetMap data
 * - It provides REST API endpoints for different routing profiles (driving, walking, cycling)
 * - The API returns route geometry in GeoJSON format and metadata like distance/duration
 * - Public OSRM instance: https://router.project-osrm.org/
 *
 * @param start - Starting coordinates [longitude, latitude]
 * @param end - Ending coordinates [longitude, latitude]
 * @returns Promise with route information including geometry for map display
 */
export async function fetchWalkingRoute(
  start: [number, number],
  end: [number, number]
): Promise<RouteResult> {
  try {
    // OSRM API endpoint format:
    // /route/v1/{profile}/{coordinates}?{options}
    // - profile: walking (for pedestrian routes)
    // - coordinates: lon,lat;lon,lat format
    // - overview=full: returns complete route geometry
    // - geometries=geojson: returns geometry as GeoJSON LineString
    const url = `https://router.project-osrm.org/route/v1/walking/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;

    console.log('Fetching route from OSRM:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OSRM API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // OSRM API response structure:
    // {
    //   "code": "Ok",
    //   "routes": [{
    //     "geometry": {...}, // GeoJSON LineString
    //     "legs": [{
    //       "summary": "",
    //       "weight": 0,
    //       "duration": 0, // seconds
    //       "distance": 0  // meters
    //     }],
    //     "weight_name": "routability",
    //     "weight": 0,
    //     "duration": 0, // total seconds
    //     "distance": 0  // total meters
    //   }]
    // }

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error(`OSRM API error: ${data.code || 'No routes found'}`);
    }

    const route = data.routes[0];

    return {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
      success: true
    };

  } catch (error) {
    console.error('Error fetching route:', error);
    return {
      distance: 0,
      duration: 0,
      geometry: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Fetches multiple walking routes from different stations to a venue
 * Returns routes with assigned colors for map visualization
 *
 * @param stationCoords - Array of station coordinates
 * @param venueCoords - Venue coordinates
 * @returns Promise with array of route results including colors
 */
export async function fetchMultipleRoutes(
  stationCoords: Array<{ name: string; coords: [number, number] }>,
  venueCoords: [number, number]
): Promise<Array<RouteResult & { stationName: string; color: string }>> {
  const routeColors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F', // Light Yellow
    '#BB8FCE', // Light Purple
    '#85C1E9'  // Light Blue
  ];

  // Fetch all routes in parallel for better performance
  const routePromises = stationCoords.map(async (station, index) => {
    const route = await fetchWalkingRoute(station.coords, venueCoords);
    return {
      ...route,
      stationName: station.name,
      color: routeColors[index % routeColors.length]
    };
  });

  try {
    const routes = await Promise.all(routePromises);
    // Filter out failed routes
    return routes.filter(route => route.success);
  } catch (error) {
    console.error('Error fetching multiple routes:', error);
    return [];
  }
}

/**
 * Converts duration from seconds to a human-readable format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "15 mins", "1h 30m")
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Formats distance in meters to a human-readable format
 * @param meters - Distance in meters
 * @returns Formatted distance string (e.g., "150m", "1.2km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }

  const km = meters / 1000;
  return `${km.toFixed(1)}km`;
}
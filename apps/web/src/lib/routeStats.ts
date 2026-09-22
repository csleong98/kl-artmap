import { distanceKm } from './geo';
import type { GalleryRoute, Location } from '@/types';

// `Places`/`Distance`/`Est. travel time` are all derived from real stop coordinates rather
// than authored per-route, so they can't drift out of sync as `GALLERY_ROUTES.stopNames`
// keeps changing (see routes.ts).
const WALKING_SPEED_KMH = 4.5;
// Rough dwell time per stop (photos, reading a plaque, etc.) - not measured, just a
// placeholder assumption to keep "Est. travel time" from being pure walking time.
const MINUTES_PER_STOP = 10;

export function getRouteStops(route: GalleryRoute, locations: Location[]): Location[] {
  return route.stopNames
    .map((name) => locations.find((location) => location.name === name))
    .filter((location): location is Location => !!location);
}

export function getRouteDistanceKm(stops: Location[]): number {
  let total = 0;
  for (let i = 1; i < stops.length; i++) {
    total += distanceKm(stops[i - 1].coordinates, stops[i].coordinates);
  }
  return total;
}

export function getRouteEstMinutes(stops: Location[]): number {
  const walkingMinutes = (getRouteDistanceKm(stops) / WALKING_SPEED_KMH) * 60;
  return Math.round(walkingMinutes + stops.length * MINUTES_PER_STOP);
}

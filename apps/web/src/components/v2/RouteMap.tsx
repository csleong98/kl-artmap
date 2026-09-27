'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { createRoot, type Root } from 'react-dom/client';
import type mapboxgl from 'mapbox-gl';
import { Compass, CornersOut, Gps, Minus, Plus } from '@phosphor-icons/react';
import { ButtonGroup, IconButton, MapMarker } from 'design-system';
import type { Location } from '@/types';

// The route detail map (Figma node 373:24113/373:24115, "map frame"). Figma's own mock
// shows the stops as the same large rounded photo pins used in Discover Places' map, not
// `RouteMarker`'s balloon pins - `RouteMarker` was built for a different Figma frame (node
// 411:4992) and doesn't actually appear in this one, so this reuses `MapMarker` (type
// "photo") for consistency with what's actually drawn here. No clustering is needed (a route
// has a handful of fixed stops, not hundreds of locations), so this is a much simpler sibling
// to `MapV2` rather than a variant of it: stops are plotted once on load plus a connecting
// line, not recomputed on every 'move'.
export interface RouteMapProps {
  className?: string;
  stops: Location[];
  /** See `MapV2`'s prop of the same name - needed when the map sits inside a scrolling page. */
  cooperativeGestures?: boolean;
  /**
   * Smaller stop pins for a small embedded map (mobile's route details tab) - at full 114px,
   * a route's stops pile on top of each other and hide the route line in a ~360px frame.
   */
  compactPins?: boolean;
}

function stopPhoto(location: Location) {
  const src = location.images?.[0] ?? location.imageUrl;
  return src ? { src, alt: location.name } : undefined;
}

function RouteMapComponent({ className, stops, cooperativeGestures, compactPins }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ marker: mapboxgl.Marker; root: Root }[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!token) {
        setError('Missing NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN environment variable.');
        return;
      }
      if (!containerRef.current || stops.length === 0) return;

      const mapboxglModule = (await import('mapbox-gl')).default;
      if (cancelled) return;

      if (!document.querySelector('link[data-mapbox-gl-css]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css';
        link.setAttribute('data-mapbox-gl-css', 'true');
        document.head.appendChild(link);
      }

      mapboxglModule.accessToken = token;
      const coordinates = stops.map((stop) => stop.coordinates);
      const map = new mapboxglModule.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: coordinates[0],
        zoom: 14,
        attributionControl: false,
        cooperativeGestures,
      });
      mapRef.current = map;

      map.on('load', () => {
        if (cancelled) return;
        setMapLoaded(true);

        map.addSource('route-line', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } },
        });
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route-line',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#F97316', 'line-width': 3 },
        });

        const bounds = coordinates.reduce(
          (acc, coord) => acc.extend(coord),
          new mapboxglModule.LngLatBounds(coordinates[0], coordinates[0])
        );
        map.fitBounds(bounds, { padding: 80, duration: 0 });

        stops.forEach((stop) => {
          const el = document.createElement('div');
          const root = createRoot(el);
          const marker = new mapboxglModule.Marker({ element: el, anchor: 'center' })
            .setLngLat(stop.coordinates)
            .addTo(map);
          root.render(
            <MapMarker
              type={stopPhoto(stop) ? 'photo' : 'pin'}
              photo={stopPhoto(stop)}
              label={stop.name}
              className={compactPins && stopPhoto(stop) ? 'scale-[0.55]' : undefined}
            />
          );
          markersRef.current.push({ marker, root });
        });
      });
    }

    init();

    return () => {
      cancelled = true;
      const staleMarkers = markersRef.current;
      markersRef.current = [];
      // See MapV2's identical cleanup comment: unmounting is deferred so it never runs
      // inside React's own commit phase (e.g. this whole map unmounting because the parent
      // navigated back to the routes list).
      staleMarkers.forEach(({ marker }) => marker.remove());
      mapRef.current?.remove();
      mapRef.current = null;
      queueMicrotask(() => {
        staleMarkers.forEach(({ root }) => root.unmount());
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-secondary text-destructive ${className ?? ''}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className ?? ''}`}>
      <div ref={containerRef} className="h-full w-full" />

      <div className="absolute left-4 top-4 flex flex-col gap-2">
        <IconButton
          icon={<Gps />}
          aria-label="Find my location"
          size="sm"
          radius="rounded"
          className="bg-background shadow-[0px_2px_1.5px_rgba(0,0,0,0.1)]"
        />
        <IconButton
          icon={<CornersOut />}
          aria-label="Toggle fullscreen"
          size="sm"
          radius="rounded"
          className="bg-background shadow-[0px_2px_1.5px_rgba(0,0,0,0.1)]"
        />
      </div>

      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <ButtonGroup orientation="vertical" radius="rounded" className="shadow-[0px_2px_1.5px_rgba(0,0,0,0.1)]">
          <IconButton icon={<Plus />} aria-label="Zoom in" size="sm" onClick={() => mapRef.current?.zoomIn()} />
          <IconButton icon={<Minus />} aria-label="Zoom out" size="sm" onClick={() => mapRef.current?.zoomOut()} />
        </ButtonGroup>
        <IconButton
          icon={<Compass />}
          aria-label="Reset bearing"
          size="sm"
          radius="rounded"
          className="bg-background shadow-[0px_2px_1.5px_rgba(0,0,0,0.1)]"
          onClick={() => mapRef.current?.resetNorthPitch()}
        />
      </div>

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary text-muted-foreground">
          Loading map...
        </div>
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(RouteMapComponent), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
      Loading map...
    </div>
  ),
});

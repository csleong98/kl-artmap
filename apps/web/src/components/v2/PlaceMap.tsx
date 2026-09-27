'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { createRoot, type Root } from 'react-dom/client';
import type mapboxgl from 'mapbox-gl';
import { Compass, CornersOut, Gps, Minus, Plus } from '@phosphor-icons/react';
import { ButtonGroup, IconButton, MapMarker, RouteMarker, RouteMarkerTrainIcon } from 'design-system';

// The small map embedded inside a place's detail tabs on mobile (Figma "Places details",
// node 433:10033 - the 396x362 "map frame" in both the "Getting there" and "Nearby places"
// tabs). Mobile has no side map like desktop, so each tab carries its own map scoped to what
// that tab is about: the place itself plus either its nearby train stations or its nearby
// places. The pins are a small fixed set, so - like `RouteMap` - they're plotted once and the
// view is fitted to them, rather than `MapV2`'s clustering-on-every-move.
//
// Station pins are `RouteMarker` with the train glyph (the same balloon pin Figma draws here,
// node 411:4992); place pins are `MapMarker` photo pins, matching Discover Places' map.
// Controls follow this frame's own layout - a single right-hand column of zoom, compass,
// locate and fullscreen - rather than `MapV2`'s split left/right groups.
export interface PlaceMapPin {
  coordinates: [number, number];
  kind: 'station' | 'place';
  label: string;
  photo?: { src: string; alt?: string };
  onClick?: () => void;
}

export interface PlaceMapProps {
  className?: string;
  focus: { coordinates: [number, number]; label: string; photo?: { src: string; alt?: string } };
  pins: PlaceMapPin[];
}

const CONTROL_SHADOW = 'shadow-[0px_2px_1.5px_rgba(0,0,0,0.1)]';

function PlaceMapComponent({ className, focus, pins }: PlaceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ marker: mapboxgl.Marker; root: Root }[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-plot only when the set of pins actually changes, not on every parent render (the
  // caller builds `pins` fresh each render).
  const pinsKey = `${focus.label}|${pins.map((pin) => `${pin.kind}:${pin.label}:${pin.coordinates.join(',')}`).join(';')}`;
  const latestRef = useRef({ focus, pins });
  latestRef.current = { focus, pins };

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!token) {
        setError('Missing NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN environment variable.');
        return;
      }
      if (!containerRef.current) return;

      const mapboxglModule = (await import('mapbox-gl')).default;
      if (cancelled || !containerRef.current) return;

      if (!document.querySelector('link[data-mapbox-gl-css]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css';
        link.setAttribute('data-mapbox-gl-css', 'true');
        document.head.appendChild(link);
      }

      const { focus: currentFocus, pins: currentPins } = latestRef.current;
      mapboxglModule.accessToken = token;
      const map = new mapboxglModule.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: currentFocus.coordinates,
        zoom: 15,
        attributionControl: false,
        // Embedded in a scrolling page - a one-finger drag / plain wheel should scroll the
        // page, not pan the map (see `MapV2`'s prop of the same name).
        cooperativeGestures: true,
      });
      mapRef.current = map;

      map.on('load', () => {
        if (cancelled) return;
        setMapLoaded(true);

        // Fit every pin, but with the place itself dead center (as Figma draws it): each pin
        // is also mirrored across the focus point, so the bounds are symmetric around it.
        if (currentPins.length > 0) {
          const [fx, fy] = currentFocus.coordinates;
          const bounds = currentPins.reduce((acc, pin) => {
            const [px, py] = pin.coordinates;
            return acc.extend([px, py]).extend([2 * fx - px, 2 * fy - py]);
          }, new mapboxglModule.LngLatBounds(currentFocus.coordinates, currentFocus.coordinates));
          map.fitBounds(bounds, { padding: 64, maxZoom: 16, duration: 0 });
        }

        const addMarker = (coordinates: [number, number], node: ReactNode, anchor: 'center' | 'bottom') => {
          const el = document.createElement('div');
          const root = createRoot(el);
          const marker = new mapboxglModule.Marker({ element: el, anchor }).setLngLat(coordinates).addTo(map);
          root.render(node);
          markersRef.current.push({ marker, root });
        };

        currentPins.forEach((pin) => {
          if (pin.kind === 'station') {
            addMarker(
              pin.coordinates,
              <div title={pin.label}>
                <RouteMarker icon={<RouteMarkerTrainIcon />} color="amber" />
              </div>,
              'bottom'
            );
          } else {
            addMarker(
              pin.coordinates,
              <MapMarker
                type={pin.photo ? 'photo' : 'pin'}
                photo={pin.photo}
                label={pin.label}
                // Smaller than the place in focus: nearby places are by definition close
                // together, and at full size their 114px photo pins pile on top of each other.
                className={pin.photo ? 'scale-[0.55]' : undefined}
                onClick={pin.onClick}
              />,
              'center'
            );
          }
        });

        // Added last so the place in focus sits on top of any pin it overlaps.
        addMarker(
          currentFocus.coordinates,
          <MapMarker type={currentFocus.photo ? 'photo' : 'pin'} photo={currentFocus.photo} label={currentFocus.label} />,
          'center'
        );
      });
    }

    init();

    return () => {
      cancelled = true;
      const staleMarkers = markersRef.current;
      markersRef.current = [];
      // Deferred for the same reason as `MapV2`/`RouteMap`: unmounting marker roots inside
      // React's own commit phase throws.
      staleMarkers.forEach(({ marker }) => marker.remove());
      mapRef.current?.remove();
      mapRef.current = null;
      setMapLoaded(false);
      queueMicrotask(() => {
        staleMarkers.forEach(({ root }) => root.unmount());
      });
    };
  }, [pinsKey]);

  if (error) {
    return (
      <div className={`flex items-center justify-center rounded-2xl border border-border bg-secondary text-destructive ${className ?? ''}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border ${className ?? ''}`}>
      <div ref={containerRef} className="h-full w-full" />

      <div className="absolute right-4 top-4 flex w-8 flex-col gap-2">
        <ButtonGroup orientation="vertical" radius="rounded" className={CONTROL_SHADOW}>
          <IconButton icon={<Plus />} aria-label="Zoom in" size="sm" onClick={() => mapRef.current?.zoomIn()} />
          <IconButton icon={<Minus />} aria-label="Zoom out" size="sm" onClick={() => mapRef.current?.zoomOut()} />
        </ButtonGroup>
        <IconButton
          icon={<Compass />}
          aria-label="Reset bearing"
          size="sm"
          radius="rounded"
          className={`bg-background ${CONTROL_SHADOW}`}
          onClick={() => mapRef.current?.resetNorthPitch()}
        />
        <IconButton
          icon={<Gps />}
          aria-label="Center on this place"
          size="sm"
          radius="rounded"
          className={`bg-background ${CONTROL_SHADOW}`}
          onClick={() => mapRef.current?.flyTo({ center: latestRef.current.focus.coordinates, zoom: 16 })}
        />
        <IconButton
          icon={<CornersOut />}
          aria-label="Toggle fullscreen"
          size="sm"
          radius="rounded"
          className={`bg-background ${CONTROL_SHADOW}`}
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

export default dynamic(() => Promise.resolve(PlaceMapComponent), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border border-border bg-secondary text-muted-foreground">
      Loading map...
    </div>
  ),
});

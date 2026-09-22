'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { createRoot, type Root } from 'react-dom/client';
import Supercluster from 'supercluster';
import type mapboxgl from 'mapbox-gl';
import { Compass, CornersOut, Gps, Minus, Plus } from '@phosphor-icons/react';
import { ButtonGroup, Cluster, IconButton, MapMarker } from 'design-system';
import type { Location } from '@/types';

// v2's map, matching Figma's "map frame" (node 367:23198): a clustered marker layer built
// with `supercluster` directly rather than Mapbox's native GeoJSON `cluster: true` source.
// The native source only tiles/indexes data for layers actually rendered by Mapbox's paint
// engine - since this map never adds a visible layer (markers are React components mounted
// onto plain `mapboxgl.Marker` elements, not canvas-painted circles), `querySourceFeatures`
// against an unrendered source reliably returns nothing. `supercluster` is the same
// clustering library Mapbox GL uses internally, run here in plain JS against the map's
// current bounds/zoom on every 'move' - the standard approach for custom HTML/React marker
// clusters, and simpler than fighting the tile pipeline for a feature we don't otherwise need.
export interface MapV2Props {
  className?: string;
  locations: Location[];
  selectedName?: string | null;
  onMarkerClick?: (location: Location) => void;
}

interface PointProps {
  name: string;
}

type MarkerEntry = { marker: mapboxgl.Marker; root: Root };

function clusterSize(count: number): 'small' | 'default' | 'large' | 'x-large' {
  if (count >= 50) return 'x-large';
  if (count >= 25) return 'large';
  if (count >= 10) return 'default';
  return 'small';
}

function buildIndex(locations: Location[]) {
  const index = new Supercluster<PointProps>({ radius: 60, maxZoom: 16 });
  index.load(
    locations.map((location) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: location.coordinates },
      properties: { name: location.name },
    }))
  );
  return index;
}

function renderMapMarkers(
  map: mapboxgl.Map,
  index: Supercluster<PointProps>,
  markers: Map<string, MarkerEntry>,
  MarkerCtor: typeof mapboxgl.Marker,
  byName: Map<string, Location>,
  onMarkerClick: ((location: Location) => void) | undefined,
  selectedName: string | null | undefined
) {
  const bounds = map.getBounds();
  if (!bounds) return;
  const bbox: [number, number, number, number] = [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth(),
  ];
  const zoom = Math.round(map.getZoom());
  const clusters = index.getClusters(bbox, zoom);
  const seen = new Set<string>();

  for (const feature of clusters) {
    const [lng, lat] = feature.geometry.coordinates;
    const props = feature.properties;
    const isCluster = 'cluster' in props && props.cluster;
    const key = isCluster ? `cluster-${props.cluster_id}` : `point-${props.name}`;
    if (seen.has(key)) continue;
    seen.add(key);

    let entry = markers.get(key);
    if (!entry) {
      const el = document.createElement('div');
      const root = createRoot(el);
      const marker = new MarkerCtor({ element: el, anchor: 'center' }).setLngLat([lng, lat]).addTo(map);
      entry = { marker, root };
      markers.set(key, entry);
    } else {
      entry.marker.setLngLat([lng, lat]);
    }

    if (isCluster) {
      const count = props.point_count;
      entry.root.render(
        <Cluster
          count={count}
          size={clusterSize(count)}
          onClick={() => {
            const expansionZoom = Math.min(index.getClusterExpansionZoom(props.cluster_id), 20);
            map.easeTo({ center: [lng, lat], zoom: expansionZoom, duration: 500 });
          }}
        />
      );
    } else {
      const location = byName.get(props.name);
      if (!location) continue;
      const photoSrc = location.images?.[0] ?? location.imageUrl;
      entry.root.render(
        <MapMarker
          type={photoSrc ? 'photo' : 'pin'}
          photo={photoSrc ? { src: photoSrc, alt: location.name } : undefined}
          label={location.name}
          labelVisible="always"
          onClick={() => onMarkerClick?.(location)}
          className={selectedName === location.name ? 'z-10 ring-4 ring-ring/40' : undefined}
        />
      );
    }
  }

  for (const [key, entry] of markers) {
    if (!seen.has(key)) {
      entry.root.unmount();
      entry.marker.remove();
      markers.delete(key);
    }
  }
}

function MapV2Component({ className, locations, selectedName, onMarkerClick }: MapV2Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef(new Map<string, MarkerEntry>());
  const renderMarkersRef = useRef<() => void>(() => {});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const indexRef = useRef(buildIndex(locations));
  const byNameRef = useRef(new Map<string, Location>());
  byNameRef.current = new Map(locations.map((location) => [location.name, location]));
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;
  const selectedNameRef = useRef(selectedName);
  selectedNameRef.current = selectedName;

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
      if (cancelled) return;

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css';
      document.head.appendChild(link);

      mapboxglModule.accessToken = token;
      const map = new mapboxglModule.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [101.7, 3.15],
        zoom: 13,
        attributionControl: false,
      });
      mapRef.current = map;

      // Deferred to a microtask on every call site (including the effects below) so it
      // never runs inside React's own render/commit pass - Mapbox's 'load'/'move' handlers
      // and the `setMapLoaded`/`selectedName` state updates that trigger a re-render can
      // otherwise overlap with this function mounting/unmounting its own independent React
      // roots, which React flags as "unmount a root while already rendering".
      const doRender = () => {
        queueMicrotask(() =>
          renderMapMarkers(
            map,
            indexRef.current,
            markersRef.current,
            mapboxglModule.Marker,
            byNameRef.current,
            onMarkerClickRef.current,
            selectedNameRef.current
          )
        );
      };
      renderMarkersRef.current = doRender;

      map.on('load', () => {
        setMapLoaded(true);
        doRender();
      });
      map.on('move', doRender);
    }

    init();

    return () => {
      cancelled = true;
      const staleMarkers = markersRef.current;
      markersRef.current = new Map();
      // Unmounting is deferred for the same reason `doRender` defers its own renders: this
      // cleanup can run inside React's commit phase (e.g. the whole map unmounting because a
      // parent switched away from it), and calling `root.unmount()` synchronously there hits
      // "Attempted to synchronously unmount a root while React was already rendering." The
      // Mapbox-side teardown (`marker.remove()`, `map.remove()`) isn't a React operation, so
      // it stays synchronous - removing a marker's DOM node before its root unmounts is fine.
      staleMarkers.forEach(({ marker }) => marker.remove());
      mapRef.current?.remove();
      mapRef.current = null;
      queueMicrotask(() => {
        staleMarkers.forEach(({ root }) => root.unmount());
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild the cluster index if `locations` changes after mount.
  useEffect(() => {
    indexRef.current = buildIndex(locations);
    if (mapLoaded) renderMarkersRef.current();
  }, [locations, mapLoaded]);

  // Fly to the selected location and refresh marker styling.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    if (selectedName) {
      const location = byNameRef.current.get(selectedName);
      if (location) {
        map.flyTo({ center: location.coordinates, zoom: 16, duration: 800 });
      }
    }
    renderMarkersRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedName, mapLoaded]);

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
          className="bg-background shadow-[0px_2px_1.5px_rgba(0,0,0,0.1)]"
        />
        <IconButton
          icon={<CornersOut />}
          aria-label="Toggle fullscreen"
          size="sm"
          className="bg-background shadow-[0px_2px_1.5px_rgba(0,0,0,0.1)]"
        />
      </div>

      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <ButtonGroup orientation="vertical" className="shadow-[0px_2px_1.5px_rgba(0,0,0,0.1)]">
          <IconButton
            icon={<Plus />}
            aria-label="Zoom in"
            size="sm"
            onClick={() => mapRef.current?.zoomIn()}
          />
          <IconButton
            icon={<Minus />}
            aria-label="Zoom out"
            size="sm"
            onClick={() => mapRef.current?.zoomOut()}
          />
        </ButtonGroup>
        <IconButton
          icon={<Compass />}
          aria-label="Reset bearing"
          size="sm"
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

export default dynamic(() => Promise.resolve(MapV2Component), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
      Loading map...
    </div>
  ),
});

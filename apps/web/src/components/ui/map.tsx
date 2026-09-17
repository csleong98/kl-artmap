'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

interface MapProps {
  className?: string;
  onMapLoad?: (map: any) => void;
  onMarkerClick?: (location: any) => void;
  initialLocation?: { coordinates: [number, number] } | null;
  isMobile?: boolean;
  mapPadding?: { left?: number; top?: number; right?: number; bottom?: number };
  mode?: 'galleries' | 'guides';
  selectedGuide?: any;
}

function MapComponent({ className, onMapLoad, onMarkerClick, initialLocation, isMobile, mapPadding, mode = 'galleries', selectedGuide }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const guideMarkersRef = useRef<any[]>([]);
  const galleryMarkersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeMap() {
      if (!mapContainer.current || mapInstance.current) return;

      const apiToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!apiToken) {
        setError('Missing NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN environment variable. Please add your Maptiler API key in Vercel environment variables.');
        return;
      }

      try {
        // Dynamically import mapbox GL JS
        const mapboxgl = (await import('mapbox-gl')).default;

        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css';
        document.head.appendChild(link);
        mapboxgl.accessToken = apiToken;

        // Use initial location if provided, otherwise default
        const center = initialLocation?.coordinates || [101.70, 3.15];
        // Different default zooms for desktop vs mobile
        const defaultZoom = isMobile ? 12 : 13;
        const zoom = initialLocation ? 17 : defaultZoom;

        mapInstance.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: center,
          zoom: zoom
        });

        mapInstance.current.on('load', () => {
          setMapLoaded(true);

          // Apply padding if provided
          if (mapPadding) {
            mapInstance.current.setPadding(mapPadding);
            console.log('[Map] Padding set:', mapPadding);
            console.log('[Map] Padding applied:', mapInstance.current.getPadding());
          }

          // Add markers based on initial mode
          if (mode === 'galleries') {
            // Show all location markers in galleries mode
            import('../../services/mapService').then(({ addAllMarkers }) => {
              addAllMarkers(mapInstance.current, onMarkerClick).then((markers) => {
                galleryMarkersRef.current = markers;
              });
            });
          }
          // In guides mode without selection, don't show any markers

          // Pass map instance to parent component
          if (onMapLoad) {
            onMapLoad(mapInstance.current);
          }
        });

        // Add navigation controls
         mapInstance.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add geolocation control
        const geolocateControl = new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserLocation: true
        });

        mapInstance.current.addControl(geolocateControl, 'top-right');

        // Add coordinate overlay for user location
        let locationPopup: any = null;

        geolocateControl.on('geolocate', (e: any) => {
          const { latitude, longitude } = e.coords;

          // Remove existing popup
          if (locationPopup) {
            locationPopup.remove();
          }

          // Create coordinate display (Google Maps format: lat, lng without brackets)
          const coordText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

          // Create popup with coordinates
          locationPopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: [0, -40],
            className: 'coordinate-popup'
          })
            .setLngLat([longitude, latitude])
            .setHTML(`
              <div
                style="
                  background: rgba(0,0,0,0.8);
                  color: white;
                  padding: 6px 10px;
                  border-radius: 4px;
                  font-family: monospace;
                  font-size: 12px;
                  cursor: pointer;
                  border: 1px solid rgba(255,255,255,0.3);
                  user-select: none;
                "
                title="Click to copy coordinates"
                onclick="
                  navigator.clipboard.writeText('${coordText}');
                  this.innerHTML = 'Copied!';
                  setTimeout(() => this.innerHTML = '${coordText}', 1500);
                "
              >
                ${coordText}
              </div>
            `)
            .addTo(mapInstance.current);
        });

        // Clean up popup when tracking stops
        geolocateControl.on('trackuserlocationend', () => {
          if (locationPopup) {
            locationPopup.remove();
            locationPopup = null;
          }
        });

      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to load map');
      }
    }

    initializeMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Handle mode switching - show/hide gallery markers
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded) return;

    async function handleModeSwitch() {
      const { clearMarkers, addAllMarkers } = await import('../../services/mapService');

      if (mode === 'galleries' && galleryMarkersRef.current.length === 0) {
        // Switching to galleries - add markers if they don't exist
        const markers = await addAllMarkers(mapInstance.current, onMarkerClick);
        galleryMarkersRef.current = markers;
      } else if (mode === 'guides' && galleryMarkersRef.current.length > 0) {
        // Switching to guides - remove all gallery markers
        clearMarkers(galleryMarkersRef.current);
        galleryMarkersRef.current = [];
      }
    }

    handleModeSwitch();
  }, [mode, mapLoaded, onMarkerClick]);

  // Handle guide selection - draw route and show relevant pins
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded) return;

    const map = mapInstance.current;

    async function handleGuideSelection() {
      const { clearMarkers } = await import('../../services/mapService');
      const { getAllLocations } = await import('../../data/helpers');

      // Clean up existing markers
      if (guideMarkersRef.current.length > 0) {
        clearMarkers(guideMarkersRef.current);
        guideMarkersRef.current = [];
      }

      // Clear existing routes
      const guideRouteId = 'guide-route';
      if (map.getSource(guideRouteId)) {
        if (map.getLayer(guideRouteId)) map.removeLayer(guideRouteId);
        if (map.getLayer(`${guideRouteId}-casing`)) map.removeLayer(`${guideRouteId}-casing`);
        if (map.getSource(guideRouteId)) map.removeSource(guideRouteId);
      }

      if (selectedGuide) {
        const allLocations = getAllLocations();
        const mapboxgl = (await import('mapbox-gl')).default;

        // Get coordinates for each stop
        const stopCoordinates: [number, number][] = [];
        selectedGuide.stops.forEach((stopName: string) => {
          const location = allLocations.find((loc: any) => loc.name === stopName);
          if (location) {
            stopCoordinates.push(location.coordinates);
          }
        });

        // Fetch real walking routes from Mapbox Directions API
        if (stopCoordinates.length >= 2) {
          try {
            const allRouteCoordinates: [number, number][] = [];

            // Fetch routes between consecutive stops
            for (let i = 0; i < stopCoordinates.length - 1; i++) {
              const start = stopCoordinates[i];
              const end = stopCoordinates[i + 1];

              const coordsString = `${start[0]},${start[1]};${end[0]},${end[1]}`;
              const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordsString}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`;

              const response = await fetch(directionsUrl);
              const data = await response.json();

              if (data.routes && data.routes[0]) {
                const routeGeometry = data.routes[0].geometry.coordinates;
                allRouteCoordinates.push(...routeGeometry);
              }
            }

            if (allRouteCoordinates.length > 0) {
              const routeData = {
                type: 'Feature' as const,
                geometry: {
                  type: 'LineString' as const,
                  coordinates: allRouteCoordinates
                },
                properties: {}
              };

              map.addSource(guideRouteId, {
                type: 'geojson',
                data: routeData
              });

              // Add casing layer
              map.addLayer({
                id: `${guideRouteId}-casing`,
                type: 'line',
                source: guideRouteId,
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                  'line-color': selectedGuide.color || '#285ABD',
                  'line-width': 10,
                  'line-opacity': 0.3,
                },
              });

              // Add main route line
              map.addLayer({
                id: guideRouteId,
                type: 'line',
                source: guideRouteId,
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                  'line-color': selectedGuide.color || '#285ABD',
                  'line-width': 6,
                  'line-opacity': 1,
                },
              });

              // Fit map to route bounds
              const bounds = allRouteCoordinates.reduce(
                (b: any, coord: [number, number]) => {
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
          } catch (error) {
            console.error('Error fetching walking routes:', error);
          }
        }

        // Add markers only for stops in this guide
        selectedGuide.stops.forEach((stopName: string) => {
          const location = allLocations.find((loc: any) => loc.name === stopName);
          if (location) {
            const imageUrl = location.images?.[0] || location.imageUrl;
            const el = document.createElement('div');
            el.style.width = '50px';
            el.style.height = '60px';
            el.style.cursor = 'pointer';
            el.classList.add('map-marker');
            el.setAttribute('data-marker-id', location.name);

            // Simple pin HTML
            el.innerHTML = `
              <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                filter: drop-shadow(0 10px 28px rgba(0,0,0,0.35));
                width: 50px;
                height: 60px;
              ">
                <div style="
                  width: 50px;
                  height: 50px;
                  border-radius: 50%;
                  overflow: hidden;
                  background: #111;
                  border: 5px solid #111;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  ${imageUrl ? `<img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${location.name}" />` : ''}
                </div>
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

            const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
              .setLngLat(location.coordinates)
              .addTo(map);

            guideMarkersRef.current.push(marker);

            el.addEventListener('click', () => {
              if (onMarkerClick) {
                onMarkerClick(location);
              }
            });
          }
        });
      }
    }

    handleGuideSelection();
  }, [selectedGuide, mapLoaded, onMarkerClick]);

  if (error) {
    return (
      <div className={`w-full h-full ${className || ''}`} style={{ minHeight: '400px' }}>
        <div className="flex items-center justify-center h-full bg-red-50 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      <div
        ref={mapContainer}
        className="w-full h-full"
      />

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-600">Loading map...</div>
        </div>
      )}
    </div>
  );
}

// Export as dynamic component with no SSR
export default dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100" style={{ minHeight: '400px' }}>
      <div className="text-gray-600">Initializing map...</div>
    </div>
  ),
});
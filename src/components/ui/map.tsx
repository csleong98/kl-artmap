'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

interface MapProps {
  className?: string;
  onMapLoad?: (map: any) => void;
}

function MapComponent({ className, onMapLoad }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transitVisible, setTransitVisible] = useState(true);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let mapInstance: any = null;

    async function initializeMap() {
      if (!mapContainer.current) return;

      const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
      if (!apiKey) {
        setError('Missing NEXT_PUBLIC_MAPTILER_API_KEY environment variable. Please add your Maptiler API key in Vercel environment variables.');
        return;
      }

      try {
        // Dynamically import MapLibre GL JS
        const maplibregl = (await import('maplibre-gl')).default;

        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css';
        document.head.appendChild(link);

        mapInstance = new maplibregl.Map({
          container: mapContainer.current,
          style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
          center: [101.6869, 3.1390], // Kuala Lumpur coordinates
          zoom: 11
        });

        // Store map instance reference
        mapInstanceRef.current = mapInstance;

        mapInstance.on('load', () => {
          setMapLoaded(true);

          // Log available layers to see what Maptiler provides
          try {
            const style = mapInstance.getStyle();
            if (style && style.layers && Array.isArray(style.layers)) {
              const layerIds = style.layers
                .filter((layer: any) => layer && layer.id)
                .map((layer: any) => layer.id);

              console.log('Available layers:', layerIds);

              // Check if transit layers exist - expanded search terms
              const transitLayers = style.layers.filter((layer: any) => {
                if (!layer || !layer.id || typeof layer.id !== 'string') return false;

                const layerId = layer.id.toLowerCase();
                return layerId.includes('transit') ||
                       layerId.includes('railway') ||
                       layerId.includes('rail') ||
                       layerId.includes('subway') ||
                       layerId.includes('metro') ||
                       layerId.includes('mrt') ||
                       layerId.includes('lrt') ||
                       layerId.includes('monorail') ||
                       layerId.includes('train') ||
                       layerId.includes('line') ||
                       layerId.includes('transport');
              });

              if (transitLayers.length > 0) {
                console.log('Found transit layers:', transitLayers.map((l: any) => l.id));
              } else {
                console.log('No transit layers found in this style');
              }
            }
          } catch (err) {
            console.error('Error analyzing map layers:', err);
          }

          // Enhance railway line styling for better visibility
          try {
            const railwayLayers = [
              'Railway tunnel',
              'Railway tunnel hatching',
              'Major rail',
              'Major rail hatching',
              'Minor rail',
              'Minor rail hatching'
            ];

            railwayLayers.forEach(layerId => {
              try {
                const layer = mapInstance.getLayer(layerId);
                if (layer && layer.type === 'line') {
                  // Make railway lines more prominent
                  mapInstance.setPaintProperty(layerId, 'line-width', [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    8, 2,  // At zoom 8, width 2px
                    12, 4, // At zoom 12, width 4px
                    16, 6  // At zoom 16, width 6px
                  ]);

                  // Use distinct colors for different railway types
                  if (layerId.includes('Major')) {
                    mapInstance.setPaintProperty(layerId, 'line-color', '#FF6B35'); // Orange for major rail
                  } else if (layerId.includes('Minor')) {
                    mapInstance.setPaintProperty(layerId, 'line-color', '#4ECDC4'); // Teal for minor rail
                  } else if (layerId.includes('tunnel')) {
                    mapInstance.setPaintProperty(layerId, 'line-color', '#9B59B6'); // Purple for tunnels
                  }

                  mapInstance.setPaintProperty(layerId, 'line-opacity', 0.8);
                  console.log('Enhanced railway layer styling:', layerId);
                }
              } catch (err) {
                console.log('Could not enhance layer:', layerId, err);
              }
            });
          } catch (err) {
            console.error('Error enhancing railway layers:', err);
          }

          // Add custom KL rail lines
          import('../../data/railLines').then(({ getAllRailLinesGeoJSON, railLines }) => {
            const railLinesGeoJSON = getAllRailLinesGeoJSON();

            // Add rail lines source
            mapInstance.addSource('kl-rail-lines', {
              type: 'geojson',
              data: railLinesGeoJSON
            });

            // Add rail lines layer
            mapInstance.addLayer({
              id: 'kl-rail-lines',
              type: 'line',
              source: 'kl-rail-lines',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': ['get', 'color'],
                'line-width': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  8, 3,
                  12, 5,
                  16, 8
                ],
                'line-opacity': 0.8
              }
            });

            console.log('Added custom KL rail lines:', railLines.length);
          });

          // Add all markers for debugging coordinates
          import('../../services/mapService').then(({ addAllMarkersForDebug }) => {
            addAllMarkersForDebug(mapInstance);
          });

          // Pass map instance to parent component
          if (onMapLoad) {
            onMapLoad(mapInstance);
          }
        });

        // Add navigation controls
        mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');

        // Use Maptiler's built-in style switching or layer controls
        // Check if the style supports layer toggling via metadata
        mapInstance.on('styledata', () => {
          const style = mapInstance.getStyle();
          if (style.metadata && style.metadata.layerControl) {
            console.log('Style supports built-in layer control:', style.metadata.layerControl);
          }
        });

        // Add geolocation control
        const geolocateControl = new maplibregl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserLocation: true
        });

        mapInstance.addControl(geolocateControl, 'top-right');

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
          locationPopup = new maplibregl.Popup({
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
            .addTo(mapInstance);
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
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  // Toggle transit/railway layers visibility using the native layer names
  const toggleTransitLines = () => {
    if (!mapInstanceRef.current) return;

    const newVisibility = !transitVisible;
    setTransitVisible(newVisibility);

    // Get all available layers and find transit-related ones
    try {
      const style = mapInstanceRef.current.getStyle();
      if (style && style.layers) {
        const allTransitLayers = style.layers
          .filter((layer: any) => {
            if (!layer || !layer.id || typeof layer.id !== 'string') return false;
            const layerId = layer.id.toLowerCase();
            return layerId.includes('transit') ||
                   layerId.includes('railway') ||
                   layerId.includes('rail') ||
                   layerId.includes('subway') ||
                   layerId.includes('metro') ||
                   layerId.includes('mrt') ||
                   layerId.includes('lrt') ||
                   layerId.includes('monorail') ||
                   layerId.includes('train');
          })
          .map((layer: any) => layer.id);

        console.log(`${newVisibility ? 'Showing' : 'Hiding'} transit layers:`, allTransitLayers);

        allTransitLayers.forEach((layerId: string) => {
          try {
            mapInstanceRef.current.setLayoutProperty(layerId, 'visibility', newVisibility ? 'visible' : 'none');
          } catch (err) {
            console.log('Could not toggle layer:', layerId, err);
          }
        });

        // Also toggle our custom KL rail lines
        try {
          const customLayer = mapInstanceRef.current.getLayer('kl-rail-lines');
          if (customLayer) {
            mapInstanceRef.current.setLayoutProperty('kl-rail-lines', 'visibility', newVisibility ? 'visible' : 'none');
            console.log(`${newVisibility ? 'Showing' : 'Hiding'} custom KL rail lines`);
          }
        } catch (err) {
          console.log('Could not toggle custom rail lines:', err);
        }
      }
    } catch (err) {
      console.error('Error toggling transit layers:', err);
    }
  };

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

      {/* Transit Lines Toggle Button - positioned with other map controls */}
      {mapLoaded && (
        <button
          onClick={toggleTransitLines}
          className="absolute right-4 bg-white border border-gray-300 rounded px-2 py-2 text-sm hover:bg-gray-50 shadow-md z-10"
          style={{ top: '120px' }}
          title={transitVisible ? 'Hide rail lines' : 'Show rail lines'}
        >
          🚇
        </button>
      )}

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
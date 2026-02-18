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

  useEffect(() => {
    let mapInstance: any = null;

    async function initializeMap() {
      if (!mapContainer.current) return;

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
        
        mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [101.6869, 3.1390], // Kuala Lumpur coordinates
          zoom: 11
        });

        mapInstance.on('load', () => {
          setMapLoaded(true);

          // Add all location markers
          import('../../services/mapService').then(({ addAllMarkers }) => {
            addAllMarkers(mapInstance);
          });

          // Pass map instance to parent component
          if (onMapLoad) {
            onMapLoad(mapInstance);
          }
        });

        // Add navigation controls
         mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add geolocation control
        const geolocateControl = new mapboxgl.GeolocateControl({
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
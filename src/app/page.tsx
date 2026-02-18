'use client';

import { useState, useRef, useCallback } from 'react';
import Map from '@/components/ui/map';
import SidePanel from '@/components/ui/side-panel';
import { Location } from '@/types';

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const mapRef = useRef<any>(null);

  const handleMapLoad = useCallback((map: any) => {
    mapRef.current = map;
  }, []);

  const handleLocationSelect = useCallback((location: Location) => {
    setSelectedLocation(location);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: location.coordinates,
        zoom: 15,
        duration: 1500,
      });
    }
  }, []);

  const handleBack = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  return (
    <div className="grid grid-cols-12 gap-grid-gutter h-screen pl-grid-margin">
      {/* Side Panel - 4 columns */}
      <aside className="col-span-4 overflow-y-auto">
        <SidePanel
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          onBack={handleBack}
        />
      </aside>

      {/* Map - 8 columns */}
      <main className="col-span-8">
        <Map className="w-full h-full" onMapLoad={handleMapLoad} />
      </main>
    </div>
  );
}

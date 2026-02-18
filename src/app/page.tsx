'use client';

import { useState, useRef, useCallback } from 'react';
import Map from '@/components/ui/map';
import SidePanel from '@/components/ui/side-panel';
import { Location } from '@/types';
import { useWalkingRoutes } from '@/hooks/useWalkingRoutes';
import { highlightRoute, unhighlightRoutes } from '@/services/mapService';

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const mapRef = useRef<any>(null);
  const { routeData, isLoading: routesLoading, fetchRoutes, clearRoutes, getStationRouteInfo } = useWalkingRoutes();

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
      fetchRoutes(location, mapRef.current);
    }
  }, [fetchRoutes]);

  const handleRouteSelect = useCallback((routeId: string) => {
    if (mapRef.current) {
      const allRouteIds = routeData.map(r => r.routeId);
      highlightRoute(mapRef.current, routeId, allRouteIds);
    }
  }, [routeData]);

  const handleRouteDeselect = useCallback(() => {
    if (mapRef.current) {
      const allRouteIds = routeData.map(r => r.routeId);
      unhighlightRoutes(mapRef.current, allRouteIds);
    }
  }, [routeData]);

  const handleBack = useCallback(() => {
    clearRoutes(mapRef.current);
    setSelectedLocation(null);
  }, [clearRoutes]);

  return (
    <div className="grid grid-cols-12 gap-grid-gutter h-screen pl-grid-margin">
      {/* Side Panel - 4 columns */}
      <aside className="col-span-4 overflow-y-auto">
        <SidePanel
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          onBack={handleBack}
          routeData={routeData}
          routesLoading={routesLoading}
          getStationRouteInfo={getStationRouteInfo}
          onRouteSelect={handleRouteSelect}
          onRouteDeselect={handleRouteDeselect}
        />
      </aside>

      {/* Map - 8 columns */}
      <main className="col-span-8">
        <Map className="w-full h-full" onMapLoad={handleMapLoad} />
      </main>
    </div>
  );
}

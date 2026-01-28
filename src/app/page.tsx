'use client';

import Map from '@/components/ui/map';
import FloatingPanel from '@/components/ui/floating-panel';
import { useRouteDisplay } from '@/hooks/useRouteDisplay';

export default function Home() {
  const { setMapInstance, displayRoutesForLocation, clearRoutes, getRouteInfo, isLoading, error } = useRouteDisplay();

  return (
    <div className="relative w-full h-screen">
      {/* Fullscreen Map */}
      <Map
        className="w-full h-full"
        onMapLoad={setMapInstance}
      />

      {/* Floating Panel */}
      <FloatingPanel
        onLocationSelect={displayRoutesForLocation}
        onLocationDeselect={clearRoutes}
        getRouteInfo={getRouteInfo}
        routeLoading={isLoading}
        routeError={error}
      />
    </div>
  );
}
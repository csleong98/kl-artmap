'use client';

import Map from '@/components/ui/map';
import SidePanel from '@/components/ui/side-panel';
import { useRouteDisplay } from '@/hooks/useRouteDisplay';

export default function Home() {
  const { setMapInstance, displayRoutesForLocation, clearRoutes } = useRouteDisplay();

  return (
    <div className="grid grid-cols-12 gap-grid-gutter h-screen pl-grid-margin">
      {/* Side Panel - 4 columns */}
      <aside className="col-span-4 overflow-y-auto">
        <SidePanel
          onLocationSelect={displayRoutesForLocation}
          onLocationDeselect={clearRoutes}
        />
      </aside>

      {/* Map - 8 columns */}
      <main className="col-span-8">
        <Map
          className="w-full h-full"
          onMapLoad={setMapInstance}
        />
      </main>
    </div>
  );
}

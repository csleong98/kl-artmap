'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Map from '@/components/ui/map';
import SidePanel from '@/components/ui/side-panel';
import { Location } from '@/types';
import { useWalkingRoutes } from '@/hooks/useWalkingRoutes';
import { muteOtherMarkers, unmuteAllMarkers } from '@/services/mapService';
import { mockLocations } from '@/data/mockLocations';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [initialTab, setInitialTab] = useState<string | undefined>(undefined);
  const mapRef = useRef<any>(null);
  const { routeData, isLoading: routesLoading, activeRouteId, fetchRoutes, clearRoutes, switchActiveRoute, getStationRouteInfo } = useWalkingRoutes();

  // Refs for restoring state from URL on map load
  const initialLocationRef = useRef<Location | null>(null);
  const initialTabRef = useRef<string | null>(null);
  const restoredRef = useRef(false);

  // Read URL params on mount
  useEffect(() => {
    if (restoredRef.current) return;
    const locationName = searchParams.get('location');
    const tab = searchParams.get('tab');
    if (locationName) {
      const found = mockLocations.find(l => l.name === locationName);
      if (found) {
        initialLocationRef.current = found;
        initialTabRef.current = tab || 'about';
        setSelectedLocation(found);
        setInitialTab(tab || 'about');
      }
    }
    restoredRef.current = true;
  }, [searchParams]);

  const updateUrl = useCallback((location: string | null, tab?: string) => {
    if (!location) {
      router.replace('/', { scroll: false });
      return;
    }
    const params = new URLSearchParams();
    params.set('location', location);
    if (tab) params.set('tab', tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router]);

  const handleMapLoad = useCallback((map: any) => {
    mapRef.current = map;

    // Restore from URL params if needed
    const loc = initialLocationRef.current;
    const tab = initialTabRef.current;
    if (loc) {
      muteOtherMarkers(loc.name);
      map.resize();
      map.flyTo({
        center: loc.coordinates,
        zoom: 15,
        duration: 1500,
      });
      if (tab === 'station-guide') {
        fetchRoutes(loc, map);
      }
      // Clear refs so this only runs once
      initialLocationRef.current = null;
      initialTabRef.current = null;
    }
  }, [fetchRoutes]);

  const handleLocationSelect = useCallback((location: Location) => {
    // Clean up any existing routes/markers from a previous selection
    clearRoutes(mapRef.current);

    setSelectedLocation(location);
    setInitialTab('about');
    updateUrl(location.name, 'about');
    muteOtherMarkers(location.name);
    if (mapRef.current) {
      mapRef.current.resize();
      mapRef.current.flyTo({
        center: location.coordinates,
        zoom: 15,
        duration: 1500,
      });
    }
  }, [updateUrl, clearRoutes]);

  const handleTabChange = useCallback((tab: string) => {
    if (!selectedLocation || !mapRef.current) return;

    updateUrl(selectedLocation.name, tab);

    if (tab === 'station-guide') {
      fetchRoutes(selectedLocation, mapRef.current);
    } else {
      clearRoutes(mapRef.current);
    }
  }, [selectedLocation, fetchRoutes, clearRoutes, updateUrl]);

  const handleRouteSelect = useCallback((routeId: string) => {
    if (mapRef.current && selectedLocation) {
      switchActiveRoute(routeId, mapRef.current, selectedLocation.coordinates);
    }
  }, [selectedLocation, switchActiveRoute]);

  const handleBack = useCallback(() => {
    clearRoutes(mapRef.current);
    unmuteAllMarkers();
    setSelectedLocation(null);
    setInitialTab(undefined);
    updateUrl(null);
  }, [clearRoutes, updateUrl]);

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
          onTabChange={handleTabChange}
          initialTab={initialTab}
          activeRouteId={activeRouteId}
        />
      </aside>

      {/* Map - 8 columns */}
      <main className="col-span-8">
        <Map className="w-full h-full" onMapLoad={handleMapLoad} />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

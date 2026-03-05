'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Drawer } from 'vaul';
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
  const [isMobile, setIsMobile] = useState(false);
  const mapRef = useRef<any>(null);
  const { routeData, isLoading: routesLoading, fetchRoutes, clearRoutes, getStationRouteInfo } = useWalkingRoutes();

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        fetchRoutes(loc);
      }
      // Clear refs so this only runs once
      initialLocationRef.current = null;
      initialTabRef.current = null;
    }
  }, [fetchRoutes]);

  const handleLocationSelect = useCallback((location: Location) => {
    // Clean up any existing routes from a previous selection
    clearRoutes();

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
    if (!selectedLocation) return;

    updateUrl(selectedLocation.name, tab);

    if (tab === 'station-guide') {
      fetchRoutes(selectedLocation);
    } else {
      clearRoutes();
    }
  }, [selectedLocation, fetchRoutes, clearRoutes, updateUrl]);

  const handleBack = useCallback(() => {
    clearRoutes();
    unmuteAllMarkers();
    setSelectedLocation(null);
    setInitialTab(undefined);
    updateUrl(null);
  }, [clearRoutes, updateUrl]);

  return (
    <>
      {/* Desktop Layout - Grid */}
      <div className="hidden md:grid grid-cols-12 gap-grid-gutter h-screen pl-grid-margin">
        {/* Side Panel - 4 columns */}
        <aside className="col-span-4 overflow-y-auto">
          <SidePanel
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            onBack={handleBack}
            routeData={routeData}
            routesLoading={routesLoading}
            getStationRouteInfo={getStationRouteInfo}
            onTabChange={handleTabChange}
            initialTab={initialTab}
          />
        </aside>

        {/* Map - 8 columns */}
        <main className="col-span-8">
          <Map className="w-full h-full" onMapLoad={handleMapLoad} />
        </main>
      </div>

      {/* Mobile Layout - Fullscreen map + Drawer */}
      {isMobile && (
        <div className="md:hidden h-screen relative">
          {/* Fullscreen Map */}
          <Map className="w-full h-full" onMapLoad={handleMapLoad} />

          {/* List View Drawer (always visible on mobile) */}
          <Drawer.Root modal={false} open={true}>
            <Drawer.Portal>
              <Drawer.Content className="bg-white flex flex-col rounded-t-[16px] h-[40vh] fixed bottom-0 left-0 right-0 shadow-xl">
                <div className="flex-none mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 my-3" />
                <div className="flex-1 overflow-y-auto px-4">
                  <SidePanel
                    selectedLocation={selectedLocation}
                    onLocationSelect={handleLocationSelect}
                    onBack={handleBack}
                    routeData={routeData}
                    routesLoading={routesLoading}
                    getStationRouteInfo={getStationRouteInfo}
                    onTabChange={handleTabChange}
                    initialTab={initialTab}
                  />
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>

          {/* Detail View Drawer (opens when location selected) */}
          <Drawer.Root
            open={selectedLocation !== null}
            onOpenChange={(open) => {
              if (!open) handleBack();
            }}
            dismissible={true}
          >
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
              <Drawer.Content className="bg-white flex flex-col rounded-t-[16px] h-[85vh] fixed bottom-0 left-0 right-0 z-50">
                <div className="flex-none mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 my-3" />
                <div className="flex-1 overflow-y-auto px-6">
                  {selectedLocation && (
                    <SidePanel
                      selectedLocation={selectedLocation}
                      onLocationSelect={handleLocationSelect}
                      onBack={handleBack}
                      routeData={routeData}
                      routesLoading={routesLoading}
                      getStationRouteInfo={getStationRouteInfo}
                      onTabChange={handleTabChange}
                      initialTab={initialTab}
                    />
                  )}
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

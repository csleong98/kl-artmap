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
      // Enable 3D buildings for initial location
      if (map.enable3DBuildings) {
        map.enable3DBuildings();
      }

      // Offset camera to stand opposite the building
      const offsetDistance = 0.0001;
      const offsetCenter: [number, number] = [
        loc.coordinates[0],
        loc.coordinates[1] - offsetDistance
      ];

      map.flyTo({
        center: offsetCenter,
        zoom: 18,
        pitch: 80,
        bearing: 0,
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
      // Enable 3D buildings and fly to eye-level view
      if (mapRef.current.enable3DBuildings) {
        mapRef.current.enable3DBuildings();
      }

      // Offset camera to stand opposite the building
      const offsetDistance = 0.0001; // Distance "across the street"
      const offsetCenter: [number, number] = [
        location.coordinates[0],
        location.coordinates[1] - offsetDistance // Move camera south to look north at building
      ];

      mapRef.current.flyTo({
        center: offsetCenter,
        zoom: 18,
        pitch: 80,
        bearing: 0, // Face north toward building
        duration: 2000,
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

    // Reset to flat 2D view and disable 3D buildings
    if (mapRef.current) {
      if (mapRef.current.disable3DBuildings) {
        mapRef.current.disable3DBuildings();
      }
      mapRef.current.flyTo({
        center: [101.6869, 3.1390],
        zoom: 11,
        pitch: 0,
        bearing: 0,
        duration: 1500,
      });
    }
  }, [clearRoutes, updateUrl]);

  return (
    <>
      {/* Desktop Layout - Fullscreen Map with Floating Panel */}
      <div className="hidden md:block relative h-screen">
        {/* Fullscreen Map */}
        <Map
          className="w-full h-full"
          onMapLoad={handleMapLoad}
          mapPadding={{ left: 482, top: 16, right: 16, bottom: 16 }}
        />

        {/* Floating Side Panel */}
        <aside className="absolute left-4 top-4 bottom-4 w-[480px] bg-white rounded-3xl shadow-lg overflow-hidden z-10">
          <div className="h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <SidePanel
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
              onBack={handleBack}
              routeData={routeData}
              routesLoading={routesLoading}
              getStationRouteInfo={getStationRouteInfo}
              onTabChange={handleTabChange}
              initialTab={initialTab}
              showBackground={true}
            />
          </div>
        </aside>
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
                <Drawer.Title className="sr-only">Location List</Drawer.Title>
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
                <Drawer.Title className="sr-only">
                  {selectedLocation ? selectedLocation.name : 'Location Details'}
                </Drawer.Title>
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

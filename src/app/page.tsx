'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Drawer } from 'vaul';
import Map from '@/components/ui/map';
import SidePanel from '@/components/ui/side-panel';
import { Location } from '@/types';
import { muteOtherMarkers, unmuteAllMarkers } from '@/services/mapService';
import { getAllLocations } from '@/data/helpers';

const mockLocations = getAllLocations();

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize selectedLocation from URL params immediately
  const locationFromUrl = searchParams.get('location');
  const tabFromUrl = searchParams.get('tab');
  const foundLocation = locationFromUrl ? mockLocations.find(l => l.name === locationFromUrl) : null;

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(foundLocation ?? null);
  const [initialTab, setInitialTab] = useState<string | undefined>(tabFromUrl || undefined);
  const [isMobile, setIsMobile] = useState(false);
  const mapRef = useRef<any>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset scroll position when location changes on mobile
  useEffect(() => {
    if (isMobile && mobileScrollRef.current) {
      mobileScrollRef.current.scrollTop = 0;
    }
  }, [selectedLocation, isMobile]);


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

    // Mute markers if there's a selected location
    if (selectedLocation) {
      muteOtherMarkers(selectedLocation.name);
      map.resize();
    }
  }, [selectedLocation]);

  const handleLocationSelect = useCallback((location: Location) => {
    if (!location) return;

    setSelectedLocation(location);
    setInitialTab('about');
    updateUrl(location.name, 'about');
    muteOtherMarkers(location.name);
    if (mapRef.current) {
      mapRef.current.resize();

      mapRef.current.flyTo({
        center: location.coordinates,
        zoom: 17,
        pitch: 0,
        bearing: 0,
        duration: 2000,
      });
    }
  }, [updateUrl]);

  const handleTabChange = useCallback((tab: string) => {
    if (!selectedLocation) return;
    updateUrl(selectedLocation.name, tab);
  }, [selectedLocation, updateUrl]);

  const handleBack = useCallback(() => {
    unmuteAllMarkers();
    setSelectedLocation(null);
    setInitialTab(undefined);
    updateUrl(null);

    // Reset to overview with appropriate zoom level
    if (mapRef.current) {
      const defaultZoom = isMobile ? 12 : 13;
      mapRef.current.flyTo({
        center: [101.70, 3.15],  // Match map.tsx default center
        zoom: defaultZoom,
        pitch: 0,
        bearing: 0,
        duration: 1500,
      });
    }
  }, [updateUrl, isMobile]);

  return (
    <>
      {/* Desktop Layout - Fullscreen Map with Floating Panel */}
      <div className="hidden md:block relative h-screen">
        {/* Fullscreen Map */}
        <Map
          className="w-full h-full"
          onMapLoad={handleMapLoad}
          onMarkerClick={handleLocationSelect}
          initialLocation={selectedLocation}
          isMobile={false}
          mapPadding={{ left: 482, top: 16, right: 16, bottom: 16 }}
        />

        {/* Floating Side Panel */}
        <aside className="absolute left-4 top-4 bottom-4 w-[480px] bg-white rounded-3xl shadow-lg overflow-hidden z-10">
          <div className="h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <SidePanel
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
              onBack={handleBack}
              onTabChange={handleTabChange}
              initialTab={initialTab}
            />
          </div>
        </aside>
      </div>

      {/* Mobile Layout - Fullscreen map + Drawer */}
      {isMobile && (
        <div className="md:hidden h-screen relative">
          {/* Fullscreen Map */}
          <Map
            className="w-full h-full"
            onMapLoad={handleMapLoad}
            onMarkerClick={handleLocationSelect}
            initialLocation={selectedLocation}
            isMobile={true}
            mapPadding={{ bottom: typeof window !== 'undefined' ? window.innerHeight * 0.5 : 400 }}
          />

          {/* Single Drawer - Dynamic Content */}
          <Drawer.Root modal={false} open={true} dismissible={false}>
            <Drawer.Portal>
              <Drawer.Content className="bg-[#FBFAF8] flex flex-col rounded-t-[16px] h-[35vh] fixed bottom-0 left-0 right-0 shadow-2xl z-40">
                <Drawer.Title className="sr-only">
                  {selectedLocation ? selectedLocation.name : 'Location List'}
                </Drawer.Title>
                {/* <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-gray-300 z-10" /> */}
                <div ref={mobileScrollRef} className="flex-1 overflow-y-auto">
                  <SidePanel
                    selectedLocation={selectedLocation}
                    onLocationSelect={handleLocationSelect}
                    onBack={handleBack}
                    onTabChange={handleTabChange}
                    initialTab={initialTab}
                  />
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

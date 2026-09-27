import { useState } from 'react';
import { Tabs } from 'design-system';
import { getRouteStops } from '@/lib/routeStats';
import type { GalleryRoute, Location } from '@/types';
import { RouteHeader } from './RouteHeader';
import { AboutAreaTab } from './routeDetails/AboutAreaTab';
import { RouteDetailsTab } from './routeDetails/RouteDetailsTab';

// Matches Figma's route detail sidebar (nodes 373:24113 "Route details" and 373:24533
// "About this area"). Figma also shows a "Getting ready" tab between these two, but that's
// being dropped per direction - no design was fetched for it and it may not survive anyway.
type RouteDetailTab = 'route-details' | 'about-area';

export interface RouteDetailProps {
  route: GalleryRoute;
  locations: Location[];
  onBack: () => void;
  onSelectLocation: (location: Location) => void;
}

export function RouteDetail({ route, locations, onBack, onSelectLocation }: RouteDetailProps) {
  const [tab, setTab] = useState<RouteDetailTab>('route-details');
  const stops = getRouteStops(route, locations);

  return (
    <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <RouteHeader title={route.name} onBack={onBack} />

      <div className="flex flex-col gap-6 p-6">
        <Tabs variant="rounded" value={tab} onValueChange={(value) => setTab(value as RouteDetailTab)}>
          <Tabs.List className="w-full">
            <Tabs.Tab value="route-details">Route details</Tabs.Tab>
            <Tabs.Tab value="about-area">About this area</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="route-details" className="pt-6">
            <RouteDetailsTab route={route} stops={stops} onSelectLocation={onSelectLocation} />
          </Tabs.Panel>
          <Tabs.Panel value="about-area" className="pt-6">
            <AboutAreaTab route={route} />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
}

import { useMemo, useState, type UIEvent } from 'react';
import dynamic from 'next/dynamic';
import { Tabs } from 'design-system';
import { getRouteStops } from '@/lib/routeStats';
import type { GalleryRoute, Location } from '@/types';
import { RouteHeader } from './RouteHeader';
import { AboutAreaTab } from './routeDetails/AboutAreaTab';
import { RouteDetailsTab } from './routeDetails/RouteDetailsTab';

const RouteMap = dynamic(() => import('./RouteMap'), { ssr: false });

// Matches Figma's route detail sidebar (nodes 373:24113 "Route details" and 373:24533
// "About this area"). Figma also shows a "Getting ready" tab between these two, but that's
// being dropped per direction - no design was fetched for it and it may not survive anyway.
//
// `mobile` has no Figma frame of its own; it follows the same pattern as the mobile place
// detail (`LocationDetail`, Figma node 433:10033): no side map, so the route map is embedded
// in the "Route details" tab itself, each tab opens with its own title, and spacing tightens
// to 16px. "About this area" is just the area's story, so it gets no map.
type RouteDetailTab = 'route-details' | 'about-area';

const TAB_TITLES: Record<RouteDetailTab, string> = {
  'route-details': 'Route details',
  'about-area': 'About this area',
};

export interface RouteDetailProps {
  route: GalleryRoute;
  locations: Location[];
  onBack: () => void;
  onSelectLocation: (location: Location) => void;
  mobile?: boolean;
}

export function RouteDetail({ route, locations, onBack, onSelectLocation, mobile = false }: RouteDetailProps) {
  const [tab, setTab] = useState<RouteDetailTab>('route-details');
  const [scrolled, setScrolled] = useState(false);
  // Memoized so the embedded map (which rebuilds when its `stops` change identity) doesn't
  // reload every time scrolling re-renders this component.
  const stops = useMemo(() => getRouteStops(route, locations), [route, locations]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrolled(event.currentTarget.scrollTop > 4);
  };

  const tabTitle = mobile && <h2 className="text-h2 leading-9 text-foreground">{TAB_TITLES[tab]}</h2>;
  const panelClass = mobile ? 'flex flex-col gap-4 pt-4' : 'pt-6';

  return (
    <div
      className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onScroll={handleScroll}
    >
      <RouteHeader title={route.name} onBack={onBack} scrolled={scrolled} mobile={mobile} />

      <div className={`flex flex-col ${mobile ? 'gap-4 p-4 pb-8' : 'gap-6 p-6'}`}>
        <Tabs variant="rounded" width="fill" value={tab} onValueChange={(value) => setTab(value as RouteDetailTab)}>
          <Tabs.List>
            <Tabs.Tab value="route-details">Route details</Tabs.Tab>
            <Tabs.Tab value="about-area">About this area</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="route-details" className={panelClass}>
            {tabTitle}
            <RouteDetailsTab
              route={route}
              stops={stops}
              onSelectLocation={onSelectLocation}
              mobile={mobile}
              map={
                mobile && tab === 'route-details' ? (
                  <RouteMap className="h-[362px] border border-border" stops={stops} cooperativeGestures compactPins />
                ) : undefined
              }
            />
          </Tabs.Panel>
          <Tabs.Panel value="about-area" className={panelClass}>
            {tabTitle}
            <AboutAreaTab route={route} />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
}

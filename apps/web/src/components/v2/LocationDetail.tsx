import { useMemo, useState, type UIEvent } from 'react';
import { ImageCarousel, Tabs, type ImageCarouselImage } from 'design-system';
import { getStationByCode } from '@/data/helpers';
import type { Location } from '@/types';
import { LocationHeader } from './LocationHeader';
import PlaceMap, { type PlaceMapPin } from './PlaceMap';
import { GettingThereTab } from './details/GettingThereTab';
import { HistoryTab } from './details/HistoryTab';
import { getNearbyPlaces, NearbyPlacesTab } from './details/NearbyPlacesTab';

// Matches Figma's "Details view" (nodes 347:5861 "History", 346:2356 "Getting there",
// 347:5134 "Nearby places") - one page, three tabs, sharing the same header + gallery.
// Per direction: the gallery uses the existing `ImageCarousel` rather than Figma's static
// 2x2 photo grid, and tabs use the `Tabs` "rounded" variant rather than Figma's own
// accent-brown tab styling for this specific mock.
//
// `mobile` follows Figma's mobile "Places details" frames (node 433:10033) instead. There's
// no side map on mobile, so two tabs carry their own embedded map, each scoped to that tab:
// "Getting there" plots the place with its nearby train stations, "Nearby places" plots it
// with the same nearby places listed below (tapping one opens it). The gallery goes full
// width, spacing tightens to 16px throughout, and each tab opens with its own title.
type DetailTab = 'history' | 'getting-there' | 'nearby';

const TAB_TITLES: Record<DetailTab, string> = {
  history: 'History',
  'getting-there': 'Getting there',
  nearby: 'Nearby places',
};

export interface LocationDetailProps {
  location: Location;
  allLocations: Location[];
  onBack: () => void;
  onSelectLocation: (location: Location) => void;
  mobile?: boolean;
}

function coverPhoto(location: Location) {
  const src = location.images?.[0] ?? location.imageUrl;
  return src ? { src, alt: location.name } : undefined;
}

export function LocationDetail({ location, allLocations, onBack, onSelectLocation, mobile = false }: LocationDetailProps) {
  const [tab, setTab] = useState<DetailTab>('history');
  const [scrolled, setScrolled] = useState(false);

  const images: ImageCarouselImage[] = location.images?.length
    ? location.images.map((src) => ({ src, alt: location.name }))
    : location.imageUrl
      ? [{ src: location.imageUrl, alt: location.name }]
      : [];

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrolled(event.currentTarget.scrollTop > 4);
  };

  const focus = { coordinates: location.coordinates, label: location.name, photo: coverPhoto(location) };

  // Interchange stations (e.g. Pasar Seni's MRT and LRT codes) share one set of coordinates,
  // so they're merged into a single pin listing every line rather than stacking duplicates.
  const stationPins = useMemo<PlaceMapPin[]>(() => {
    const byCoordinates = new Map<string, { coordinates: [number, number]; name: string; lines: string[] }>();
    for (const station of location.details?.stationGuide.stations ?? []) {
      const found = getStationByCode(station.stationCode);
      if (!found) continue;
      const key = found.coordinates.join(',');
      const entry = byCoordinates.get(key) ?? { coordinates: found.coordinates, name: station.stationName, lines: [] };
      entry.lines.push(station.line);
      byCoordinates.set(key, entry);
    }
    return [...byCoordinates.values()].map((entry) => ({
      coordinates: entry.coordinates,
      kind: 'station' as const,
      label: `${entry.name} (${entry.lines.join(', ')})`,
    }));
  }, [location]);

  const nearbyPins = useMemo<PlaceMapPin[]>(
    () =>
      getNearbyPlaces(location, allLocations).map((place) => ({
        coordinates: place.coordinates,
        kind: 'place' as const,
        label: place.name,
        photo: coverPhoto(place),
        onClick: () => onSelectLocation(place),
      })),
    [location, allLocations, onSelectLocation]
  );

  const tabTitle = mobile && <h2 className="text-h2 leading-9 text-foreground">{TAB_TITLES[tab]}</h2>;

  return (
    <div
      className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onScroll={handleScroll}
    >
      {/* Width cap for tablets; an inner wrapper so the side margins still scroll the page. */}
      <div className={mobile ? 'mx-auto w-full max-w-[640px]' : 'contents'}>
      <LocationHeader location={location} onBack={onBack} scrolled={scrolled} mobile={mobile} />

      {images.length > 0 && (
        <div className={mobile ? 'px-4' : 'flex justify-center px-6 pt-6'}>
          <ImageCarousel images={images} fluid={mobile} />
        </div>
      )}

      <div className={`flex flex-col ${mobile ? 'gap-4 p-4 pb-8' : 'gap-6 p-6'}`}>
        <Tabs variant="rounded" width="fill" value={tab} onValueChange={(value) => setTab(value as DetailTab)}>
          <Tabs.List>
            <Tabs.Tab value="history">History</Tabs.Tab>
            <Tabs.Tab value="getting-there">Getting there</Tabs.Tab>
            <Tabs.Tab value="nearby">Nearby places</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="history" className={mobile ? 'flex flex-col gap-4 pt-4' : 'pt-6'}>
            {tabTitle}
            <HistoryTab location={location} mobile={mobile} />
          </Tabs.Panel>
          <Tabs.Panel value="getting-there" className={mobile ? 'flex flex-col gap-4 pt-4' : 'pt-6'}>
            {tabTitle}
            <GettingThereTab
              location={location}
              mobile={mobile}
              map={mobile && tab === 'getting-there' ? <PlaceMap className="h-[362px]" focus={focus} pins={stationPins} /> : undefined}
            />
          </Tabs.Panel>
          <Tabs.Panel value="nearby" className={mobile ? 'flex flex-col gap-4 pt-4' : 'pt-6'}>
            {tabTitle}
            <NearbyPlacesTab
              location={location}
              allLocations={allLocations}
              onSelect={onSelectLocation}
              map={
                mobile && tab === 'nearby' ? (
                  <PlaceMap className="mb-1.5 mt-1.5 h-[362px]" focus={focus} pins={nearbyPins} />
                ) : undefined
              }
            />
          </Tabs.Panel>
        </Tabs>
      </div>
      </div>
    </div>
  );
}

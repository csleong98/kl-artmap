import { useState, type UIEvent } from 'react';
import { ImageCarousel, Tabs, type ImageCarouselImage } from 'design-system';
import type { Location } from '@/types';
import { LocationHeader } from './LocationHeader';
import { GettingThereTab } from './details/GettingThereTab';
import { HistoryTab } from './details/HistoryTab';
import { NearbyPlacesTab } from './details/NearbyPlacesTab';

// Matches Figma's "Details view" (nodes 347:5861 "History", 346:2356 "Getting there",
// 347:5134 "Nearby places") - one page, three tabs, sharing the same header + gallery.
// Per direction: the gallery uses the existing `ImageCarousel` rather than Figma's static
// 2x2 photo grid, and tabs use the `Tabs` "rounded" variant rather than Figma's own
// accent-brown tab styling for this specific mock.
type DetailTab = 'history' | 'getting-there' | 'nearby';

export interface LocationDetailProps {
  location: Location;
  allLocations: Location[];
  onBack: () => void;
  onSelectLocation: (location: Location) => void;
}

export function LocationDetail({ location, allLocations, onBack, onSelectLocation }: LocationDetailProps) {
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

  return (
    <div
      className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onScroll={handleScroll}
    >
      <LocationHeader location={location} onBack={onBack} scrolled={scrolled} />

      {images.length > 0 && (
        <div className="flex justify-center px-6 pt-6">
          <ImageCarousel images={images} />
        </div>
      )}

      <div className="flex flex-col gap-6 p-6">
        <Tabs variant="rounded" value={tab} onValueChange={(value) => setTab(value as DetailTab)}>
          <Tabs.List className="w-full">
            <Tabs.Tab value="history">History</Tabs.Tab>
            <Tabs.Tab value="getting-there">Getting there</Tabs.Tab>
            <Tabs.Tab value="nearby">Nearby places</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="history" className="pt-6">
            <HistoryTab location={location} />
          </Tabs.Panel>
          <Tabs.Panel value="getting-there" className="pt-6">
            <GettingThereTab location={location} />
          </Tabs.Panel>
          <Tabs.Panel value="nearby" className="pt-6">
            <NearbyPlacesTab location={location} allLocations={allLocations} onSelect={onSelectLocation} />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
}

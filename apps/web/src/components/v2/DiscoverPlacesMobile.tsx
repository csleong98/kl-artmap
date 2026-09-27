'use client';

import { memo, useRef, useState, type ReactNode, type UIEvent } from 'react';
import { Faders, Ticket, Train } from '@phosphor-icons/react';
import { IconButton, ListItem, SearchInput, type ListItemPhoto } from 'design-system';
import { MuralArtwork } from '@/components/MuralArtwork';
import type { Location } from '@/types';

// Matches Figma's "Mobile responsive/ discover places" (node 431:9983), three scroll states:
// - Default: 414px map card, then a bordered/rounded content card (mural, title, subtitle,
//   search, count, list), both inset 16px from the screen edges.
// - Starts scrolling: the map card itself shrinks - border and all four rounded corners
//   intact, map content cropped from the bottom rather than squashed - while the title
//   compacts and the subtitle drops out. Search and count stay.
// - Continue scrolling: map gone; the content card's rounded top pins 16px under the nav
//   with just the compact title over a cropped mural, and the list scrolls inside the card
//   beneath it.
//
// Scroll is spent shrinking the map first, then scrolling the list. A constant-height spacer
// reserves the map's scroll range (so shrinking the map never changes the page's scroll
// height - doing that feeds back into `scrollTop`), and a sticky element inside it keeps the
// map pinned while the card inside it shrinks. The card's height is written straight to the
// DOM from the scroll handler rather than through React state, so it tracks the native
// scroll without a render in between; the two discrete changes (title compacting, search
// hiding) are ordinary state, since they only flip at a threshold.
const MAP_CARD_HEIGHT = 414;
const GAP = 16;
const MAP_RANGE = GAP + MAP_CARD_HEIGHT;

export interface DiscoverPlacesMobileProps {
  locations: Location[];
  query: string;
  onQueryChange: (query: string) => void;
  onSelectLocation: (location: Location) => void;
  mapSlot: ReactNode;
}

function locationPhotos(location: Location): ListItemPhoto[] {
  const sources = location.images?.length ? location.images : location.imageUrl ? [location.imageUrl] : [];
  return sources.map((src) => ({ src, alt: location.name }));
}

// `memo`'d so the header's scroll-driven state changes don't re-render every row.
const LocationsList = memo(function LocationsList({
  locations,
  onSelectLocation,
}: {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {locations.map((location) => (
        <ListItem
          key={location.name}
          title={location.name}
          photos={locationPhotos(location)}
          chips={[
            { icon: <Ticket />, label: location.admission === 'free' ? 'Free' : 'Paid' },
            ...(location.nearestStations?.length
              ? [
                  {
                    icon: <Train />,
                    label: `${location.nearestStations.length} station${location.nearestStations.length === 1 ? '' : 's'}`,
                  },
                ]
              : []),
          ]}
          onClick={() => onSelectLocation(location)}
        />
      ))}
    </div>
  );
});

export function DiscoverPlacesMobile({
  locations,
  query,
  onQueryChange,
  onSelectLocation,
  mapSlot,
}: DiscoverPlacesMobileProps) {
  const mapCardRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  const [mapCollapsed, setMapCollapsed] = useState(false);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    const cardHeight = Math.max(0, MAP_CARD_HEIGHT - scrollTop);
    if (mapCardRef.current) mapCardRef.current.style.height = `${cardHeight}px`;
    setCompact(scrollTop > 4);
    setMapCollapsed(cardHeight <= 0);
  };

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto [overflow-anchor:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onScroll={handleScroll}
    >
      {/* The sticky anchor is zero-height so it has the spacer's full height as slack and
          stays pinned purely by the browser's own sticky positioning - it doesn't wait on the
          scroll handler. If the card itself sat in the sticky element, the element would be
          as tall as the spacer until the handler shrank it, so for a frame on every scroll
          the map would move up with the page and then snap back. Only the card's bottom edge
          follows the handler; any one-frame lag there is hidden under the opaque header. */}
      <div style={{ height: MAP_RANGE }} className="relative">
        <div className="sticky top-0 h-0">
          <div className="absolute inset-x-0 top-0 px-4 pt-4">
            <div
              ref={mapCardRef}
              style={{ height: MAP_CARD_HEIGHT }}
              className={`overflow-hidden rounded-2xl border border-border ${mapCollapsed ? 'invisible' : ''}`}
            >
              <div style={{ height: MAP_CARD_HEIGHT - 2 }}>{mapSlot}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 16px opaque strip above the card: the gap under the nav once pinned, and what hides
          list rows scrolling up past the card's rounded top corners. */}
      <div className="sticky top-0 z-20 bg-background px-4 pt-4">
        <div
          className={`relative flex flex-col gap-3 rounded-t-[20px] border-x border-t border-border bg-background px-4 pt-4 transition-[padding] duration-200 ${
            mapCollapsed ? 'pb-4' : 'pb-1.5'
          }`}
        >
          <MuralArtwork
            className="absolute inset-0 rounded-t-[19px]"
            gradientStartColor="#EBDBC1"
            gradientEndColor="rgba(240, 228, 208, 0)"
          />

          <div className="relative z-10 flex flex-col">
            <h1
              className={`line-clamp-2 text-foreground transition-[font-size,line-height] duration-200 ${
                compact ? 'text-h4 leading-7' : 'text-h2 leading-9'
              }`}
            >
              Discover Places
            </h1>
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-200 ${
                compact ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="pt-1 text-p-ui text-foreground">
                  Explore artsy spots in the city of Kuala Lumpur that are also near the train stations.
                </p>
              </div>
            </div>
          </div>

          <div
            className={`relative z-10 -mt-3 grid transition-[grid-template-rows,opacity] duration-200 ${
              mapCollapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="flex flex-col gap-3 pt-3">
                <div className="flex items-center gap-3">
                  <SearchInput
                    radius="rounded"
                    className="flex-1"
                    placeholder="Type something to search"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    onClear={() => onQueryChange('')}
                  />
                  <IconButton icon={<Faders />} aria-label="Filter" radius="rounded" />
                </div>
                <p className="text-detail text-muted-foreground">Showing {locations.length} places</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-4 rounded-b-[20px] border-x border-b border-border bg-background px-4 pb-4">
        <LocationsList locations={locations} onSelectLocation={onSelectLocation} />
      </div>
    </div>
  );
}

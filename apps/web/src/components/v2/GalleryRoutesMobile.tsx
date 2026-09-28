'use client';

import { useState, type UIEvent } from 'react';
import { Faders } from '@phosphor-icons/react';
import { IconButton, RouteCard, SearchInput } from 'design-system';
import { MuralArtwork } from '@/components/MuralArtwork';
import type { GalleryRoute, Location } from '@/types';
import { routeCardProps, useFilteredRoutes } from './GalleryRoutesView';

// Matches Figma's "Mobile responsive/ Gallery Routes" (node 432:9984), two states:
// - Default: header 16px under the nav on a full-width mural - title, subtitle, search +
//   filter, "Showing N routes" - then a single column of route cards, 16px apart.
// - Start scrolling: the header pins as a full-width 60px bar with only the compact title
//   over a cropped mural; subtitle, search and count all drop out, and the cards scroll
//   underneath it.
// No map here, unlike Discover Places, so there's no scroll range to spend before the header
// pins - it's sticky from the start and just compacts past a small threshold. The seam under
// the pinned header is a short fade rather than a border line.
export interface GalleryRoutesMobileProps {
  routes: GalleryRoute[];
  locations: Location[];
  onSelectRoute?: (route: GalleryRoute) => void;
}

export function GalleryRoutesMobile({ routes, locations, onSelectRoute }: GalleryRoutesMobileProps) {
  const [query, setQuery] = useState('');
  const [compact, setCompact] = useState(false);
  const filtered = useFilteredRoutes(routes, query);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setCompact(event.currentTarget.scrollTop > 4);
  };

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto [overflow-anchor:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onScroll={handleScroll}
    >
      <div className="sticky top-0 z-20 bg-background">
        <MuralArtwork
          className="absolute inset-0"
          gradientStartColor="#EBDBC1"
          gradientEndColor="rgba(240, 228, 208, 0)"
        />

        {/* Content is capped (and the cards go two-up) on tablets; the header's mural
            background stays full width. */}
        <div className="relative z-10 mx-auto flex max-w-[800px] flex-col p-4">
          <h1
            className={`text-foreground transition-[font-size,line-height] duration-200 ${
              compact ? 'text-h4 leading-7' : 'text-h2 leading-9'
            }`}
          >
            Gallery Routes
          </h1>
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-200 ${
              compact ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <p className="pt-1 text-p-ui leading-6 text-foreground">
                Hand curated gallery routes for you to explore the city&rsquo;s artsy places
              </p>
              <div className="flex flex-col gap-3 pt-3">
                <div className="flex items-center gap-3">
                  <SearchInput
                    radius="rounded"
                    className="flex-1"
                    placeholder="Type something to search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onClear={() => setQuery('')}
                  />
                  <IconButton icon={<Faders />} aria-label="Filter" radius="rounded" />
                </div>
                <p className="text-detail text-muted-foreground">
                  Showing {filtered.length} route{filtered.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`pointer-events-none absolute inset-x-0 top-full h-4 bg-gradient-to-b from-background to-transparent transition-opacity duration-200 ${
            compact ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      <div className="mx-auto grid max-w-[800px] gap-4 px-4 pb-4 sm:grid-cols-2">
        {filtered.map((route) => (
          <RouteCard
            key={route.id}
            {...routeCardProps(route, locations)}
            onClick={onSelectRoute ? () => onSelectRoute(route) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

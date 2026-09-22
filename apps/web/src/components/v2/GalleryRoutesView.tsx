import { useMemo, useState } from 'react';
import { Faders } from '@phosphor-icons/react';
import { IconButton, RouteCard, SearchInput } from 'design-system';
import { MuralArtwork } from '@/components/MuralArtwork';
import { getRouteDistanceKm, getRouteEstMinutes, getRouteStops } from '@/lib/routeStats';
import type { GalleryRoute, Location } from '@/types';

// Matches Figma's "Listing view + cluster" for Gallery Routes (node 373:23701) - unlike
// Discover Places, this mode has no side map: it's one full-width scrollable page (header,
// search, then a 3-column grid of `RouteCard`s).
export interface GalleryRoutesViewProps {
  routes: GalleryRoute[];
  locations: Location[];
  onSelectRoute?: (route: GalleryRoute) => void;
}

function locationPhoto(location: Location): { src: string; alt?: string } | undefined {
  const src = location.images?.[0] ?? location.imageUrl;
  return src ? { src, alt: location.name } : undefined;
}

export function GalleryRoutesView({ routes, locations, onSelectRoute }: GalleryRoutesViewProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter(
      (route) => route.name.toLowerCase().includes(q) || route.description.toLowerCase().includes(q)
    );
  }, [routes, query]);

  return (
    <div className="relative flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <MuralArtwork
        className="absolute left-0 right-0 top-0 h-[300px]"
        gradientStartColor="#EBDBC1"
        gradientEndColor="rgba(240, 228, 208, 0)"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1408px] flex-col gap-8 px-4 pb-8 pt-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-h2 text-foreground">Gallery Routes</h1>
          <p className="text-p-ui text-foreground">
            Hand curated gallery routes for you to explore the city&rsquo;s artsy places
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <p className="flex-1 text-detail text-muted-foreground">
              Showing {filtered.length} route{filtered.length === 1 ? '' : 's'}
            </p>
            <div className="flex w-[400px] items-center gap-3">
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            {filtered.map((route) => {
              const stops = getRouteStops(route, locations);
              const previewImage = locationPhoto(stops[0]);
              return (
                <RouteCard
                  key={route.id}
                  title={route.name}
                  description={route.description}
                  previewImage={previewImage}
                  onClick={onSelectRoute ? () => onSelectRoute(route) : undefined}
                  chips={[
                    { label: 'Places', value: stops.length },
                    { label: 'Distance', value: `${getRouteDistanceKm(stops).toFixed(1)} km` },
                    {
                      label: 'Est. travel time',
                      value: `${getRouteEstMinutes(stops)} mins`,
                      tooltip: 'Estimated from walking pace between stops plus time to look around each one.',
                    },
                  ]}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

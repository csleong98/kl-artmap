'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Faders, Ticket, Train } from '@phosphor-icons/react';
import { IconButton, ListItem, SearchInput, type ListItemPhoto } from 'design-system';
import { MuralArtwork } from '@/components/MuralArtwork';
import { GalleryRoutesView } from '@/components/v2/GalleryRoutesView';
import { LocationDetail } from '@/components/v2/LocationDetail';
import { TopNav, type MapV2Mode } from '@/components/v2/TopNav';
import { getAllLocations } from '@/data/helpers';
import { GALLERY_ROUTES } from '@/data/routes';
import type { Location } from '@/types';

// Matches Figma's "Listing view + cluster" (node 367:23196): a top nav bar, then a row with
// the place list and the map as two separate side-by-side cards - not v1's/the earlier
// scaffold's full-bleed map with a panel floating on top of it. Page margins are simplified
// to one consistent 16px gap/padding throughout rather than Figma's slightly asymmetric
// 24px-left/16px-elsewhere mix, which reads as an artifact of how the mock's specific frame
// was measured rather than a deliberate rhythm.
//
// "Gallery Routes" mode swaps the sidebar+map split entirely for `GalleryRoutesView`'s
// full-width listing grid (Figma node 373:23701, "Listing view + cluster") - it has no map
// alongside it, unlike Discover Places.
const MapV2 = dynamic(() => import('@/components/v2/MapV2'), { ssr: false });

const allLocations = getAllLocations();

function locationPhotos(location: Location): ListItemPhoto[] {
  const sources = location.images?.length ? location.images : location.imageUrl ? [location.imageUrl] : [];
  return sources.map((src) => ({ src, alt: location.name }));
}

export default function MapV2Page() {
  const [mode, setMode] = useState<MapV2Mode>('discover');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Location | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allLocations;
    return allLocations.filter(
      (location) => location.name.toLowerCase().includes(q) || location.address.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="flex h-screen w-full flex-col">
      <TopNav mode={mode} onModeChange={setMode} />

      {mode === 'routes' ? (
        <GalleryRoutesView routes={GALLERY_ROUTES} locations={allLocations} />
      ) : (
        <div className="flex flex-1 gap-4 overflow-hidden p-4">
          <aside className="relative flex w-[465px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-background">
            {selected ? (
              <LocationDetail
                location={selected}
                allLocations={allLocations}
                onBack={() => setSelected(null)}
                onSelectLocation={setSelected}
              />
            ) : (
              <div className="relative flex h-full flex-col p-4">
                <MuralArtwork
                  className="absolute left-0 right-0 top-0 h-[300px]"
                  gradientStartColor="#EBDBC1"
                  gradientEndColor="rgba(240, 228, 208, 0)"
                />

                <div className="relative z-10 flex shrink-0 flex-col gap-3 pb-4">
                  <div className="flex flex-col gap-1">
                    <h1 className="text-h2 text-foreground">Discover Places</h1>
                    <p className="text-p-ui text-foreground">
                      Explore artsy spots in the city of Kuala Lumpur that are also near the train stations.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
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
                    <p className="text-detail text-muted-foreground">Showing {filtered.length} places</p>
                  </div>
                </div>

                <div className="relative z-10 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex flex-col gap-4">
                    {filtered.map((location) => (
                      <ListItem
                        key={location.name}
                        title={location.name}
                        photos={locationPhotos(location)}
                        chips={[
                          {
                            icon: <Ticket />,
                            label: location.admission === 'free' ? 'Free' : 'Paid',
                          },
                          ...(location.nearestStations?.length
                            ? [
                                {
                                  icon: <Train />,
                                  label: `${location.nearestStations.length} station${location.nearestStations.length === 1 ? '' : 's'}`,
                                },
                              ]
                            : []),
                        ]}
                        onClick={() => setSelected(location)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>

          <div className="flex-1 overflow-hidden">
            <MapV2
              className="h-full w-full"
              locations={allLocations}
              selectedName={selected?.name ?? null}
              onMarkerClick={setSelected}
            />
          </div>
        </div>
      )}
    </div>
  );
}

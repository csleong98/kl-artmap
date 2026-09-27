import { useMemo, type ReactNode } from 'react';
import { Ticket, Train } from '@phosphor-icons/react';
import { ListItem, type ListItemPhoto } from 'design-system';
import { distanceKm } from '@/lib/geo';
import type { Location } from '@/types';
import { Section } from './Section';

function locationPhotos(location: Location): ListItemPhoto[] {
  const sources = location.images?.length ? location.images : location.imageUrl ? [location.imageUrl] : [];
  return sources.map((src) => ({ src, alt: location.name }));
}

export function getNearbyPlaces(location: Location, allLocations: Location[]) {
  return allLocations
    .filter((candidate) => candidate.name !== location.name)
    .sort((a, b) => distanceKm(location.coordinates, a.coordinates) - distanceKm(location.coordinates, b.coordinates))
    .slice(0, 3);
}

export interface NearbyPlacesTabProps {
  location: Location;
  allLocations: Location[];
  onSelect: (location: Location) => void;
  /** Rendered right under the section title (mobile's embedded map). */
  map?: ReactNode;
}

export function NearbyPlacesTab({ location, allLocations, onSelect, map }: NearbyPlacesTabProps) {
  const nearby = useMemo(() => getNearbyPlaces(location, allLocations), [location, allLocations]);

  return (
    <Section title="Other places you can visit">
      {map}
      <p className="text-p-ui text-foreground">
        There are {nearby.length} other places nearby you might also like.
      </p>
      <div className="flex flex-col gap-4">
        {nearby.map((nearbyLocation) => (
          <ListItem
            key={nearbyLocation.name}
            title={nearbyLocation.name}
            photos={locationPhotos(nearbyLocation)}
            chips={[
              {
                icon: <Ticket />,
                label: nearbyLocation.admission === 'free' ? 'Free' : 'Paid',
              },
              ...(nearbyLocation.nearestStations?.length
                ? [
                    {
                      icon: <Train />,
                      label: `${nearbyLocation.nearestStations.length} station${nearbyLocation.nearestStations.length === 1 ? '' : 's'}`,
                    },
                  ]
                : []),
            ]}
            onClick={() => onSelect(nearbyLocation)}
          />
        ))}
      </div>
    </Section>
  );
}

import { ArrowLeft, Clock, Path, ShareNetwork, Ticket } from '@phosphor-icons/react';
import { IconButton } from 'design-system';
import type { Location } from '@/types';

// Matches Figma's "header" (node 347:5958), shared across all three detail tabs (History /
// Getting there / Nearby places) - it's a sibling frame to the tab content, not part of any
// one tab. The distance chip uses the nearest station's own walk distance (already in the
// data) rather than a straight-line distance from nowhere in particular, since "nearest
// station" is the only distance this app actually has a meaningful reference point for.
export interface LocationHeaderProps {
  location: Location;
  onBack: () => void;
}

export function LocationHeader({ location, onBack }: LocationHeaderProps) {
  const nearestStation = location.details?.stationGuide.stations[0];

  return (
    <div className="flex items-center gap-3 p-6 pb-0">
      <IconButton icon={<ArrowLeft />} aria-label="Back to list" onClick={onBack} />
      <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
        <p className="w-full truncate text-center text-h2 text-foreground">{location.name}</p>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="size-3.5 shrink-0 text-muted-foreground [&_svg]:size-3.5">
              <Clock />
            </span>
            <span className="text-subtle-medium text-muted-foreground">{location.openingHours}</span>
          </span>
          <span className="size-1 shrink-0 rounded-full bg-muted-foreground" />
          <span className="flex items-center gap-1">
            <span className="size-3.5 shrink-0 text-muted-foreground [&_svg]:size-3.5">
              <Ticket />
            </span>
            <span className="text-subtle-medium text-muted-foreground">
              {location.admission === 'free' ? 'Free' : 'Paid'}
            </span>
          </span>
          {nearestStation && (
            <>
              <span className="size-1 shrink-0 rounded-full bg-muted-foreground" />
              <span className="flex items-center gap-1">
                <span className="size-3.5 shrink-0 text-muted-foreground [&_svg]:size-3.5">
                  <Path />
                </span>
                <span className="text-subtle-medium text-muted-foreground">{nearestStation.walkDistance}</span>
              </span>
            </>
          )}
        </div>
      </div>
      <IconButton icon={<ShareNetwork />} aria-label="Share" />
    </div>
  );
}

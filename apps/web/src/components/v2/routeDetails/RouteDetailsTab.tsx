import { Button, RouteMarkerEndIcon, RouteMarkerStartIcon, Timeline } from 'design-system';
import { Section } from '@/components/v2/details/Section';
import { getRouteDistanceKm, getRouteEstMinutes } from '@/lib/routeStats';
import type { GalleryRoute, Location } from '@/types';

// Matches Figma's "Route details" tab (node 373:24113/373:24334). The chip row here uses
// Figma's accent-tinted chips (`bg-accent`), a different visual treatment from `RouteCard`'s
// plain label-over-value chips on the listing grid - both are faithful to their own frame.
//
// "The route" timeline is location stops only, not Figma's own frame (which trails off into
// unrelated standalone history facts about one stop, mid-timeline - looks like a WIP/mixed-up
// mock rather than a deliberate pattern, so it's not reproduced). First/last stop get the
// exact start/end icons `RouteMarker` already exports for this purpose; stops in between are
// plain inactive dots, same first/last-icon/middle-dot convention as the location History tab.
export interface RouteDetailsTabProps {
  route: GalleryRoute;
  stops: Location[];
  onSelectLocation: (location: Location) => void;
}

function stopPhoto(location: Location): { src: string; alt: string } | undefined {
  const src = location.images?.[0] ?? location.imageUrl;
  return src ? { src, alt: location.name } : undefined;
}

export function RouteDetailsTab({ route, stops, onSelectLocation }: RouteDetailsTabProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex w-full items-start gap-3">
        <div className="flex flex-1 flex-col items-start justify-center gap-0.5 overflow-hidden rounded-xl bg-accent p-3">
          <span className="text-subtle text-muted-foreground">Places</span>
          <span className="text-p-ui-medium text-accent-foreground">{stops.length}</span>
        </div>
        <div className="flex flex-1 flex-col items-start justify-center gap-0.5 overflow-hidden rounded-xl bg-accent p-3">
          <span className="text-subtle text-muted-foreground">Distance</span>
          <span className="text-p-ui-medium text-accent-foreground">{getRouteDistanceKm(stops).toFixed(1)} km</span>
        </div>
        <div className="flex flex-1 flex-col items-start justify-center gap-0.5 overflow-hidden rounded-xl bg-accent p-3">
          <span className="text-subtle text-muted-foreground">Est. travel time</span>
          <span className="text-p-ui-medium text-accent-foreground">{getRouteEstMinutes(stops)} mins</span>
        </div>
      </div>

      <Section title="The route">
        <Timeline>
          {stops.map((stop, index) => {
            const isFirst = index === 0;
            const isLast = index === stops.length - 1;
            return (
              <Timeline.Item
                key={stop.name}
                title={stop.name}
                description={stop.address}
                icon={isFirst ? <RouteMarkerStartIcon /> : isLast ? <RouteMarkerEndIcon /> : undefined}
                active={isFirst || isLast}
                thumbnail={stopPhoto(stop)?.src}
                thumbnailAlt={stop.name}
                action={
                  <Button variant="outline" onClick={() => onSelectLocation(stop)}>
                    View details
                  </Button>
                }
              />
            );
          })}
        </Timeline>
        <p className="w-full text-p-ui text-muted-foreground">Last updated on {route.lastUpdated}</p>
      </Section>
    </div>
  );
}

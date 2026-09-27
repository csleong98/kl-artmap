import { ArrowLeft, Clock, Path, ShareNetwork, Ticket } from '@phosphor-icons/react';
import { IconButton } from 'design-system';
import { MuralArtwork } from '@/components/MuralArtwork';
import type { Location } from '@/types';

// Matches Figma's "header" (node 347:5958), shared across all three detail tabs (History /
// Getting there / Nearby places) - it's a sibling frame to the tab content, not part of any
// one tab. The distance chip uses the nearest station's own walk distance (already in the
// data) rather than a straight-line distance from nowhere in particular, since "nearest
// station" is the only distance this app actually has a meaningful reference point for.
//
// `scrolled` (driven by the scroll container in `LocationDetail`) switches this into a
// compact sticky state: smaller title, the status/admission/distance line collapsed away,
// and a bottom border - the same idea as a native app's large-title-to-compact-title
// transition, so the header stays anchored and out of the way once there's content to scroll
// past, without permanently costing that vertical space. The secondary line collapses via a
// CSS grid `1fr`->`0fr` track (not a fixed max-height) so it works regardless of whether a
// location has a nearest-station chip or not.
//
// `MuralArtwork` lives *inside* this header (`absolute inset-0`, clipped by the header's own
// `overflow-hidden`) rather than as a taller page-level layer behind the whole scroll
// container - it previously spanned a fixed 300px starting at the top of the page, which is
// taller than this header actually is, so a chunk of it spilled past the header into the
// blank space above the gallery/timeline instead of staying contained to the header it's
// decorating. Sizing it to `inset-0` means it's always exactly the header's own box, in both
// the expanded and scrolled-compact states.
//
// Masking it on scroll needs its own `absolute inset-0` layer *between* the mural and the
// content, not just a `bg-background` on the header element itself - a parent's own
// background always paints behind its children (that's just how backgrounds work), so it can
// never cover a child like the mural no matter what color it's set to. This mask layer is a
// plain sibling that paints after the mural and before the content, opaque only once
// `scrolled`; at rest it's transparent and the mural shows through as normal.
//
// The header itself deliberately has no `overflow-hidden`: combined with the secondary line's
// `grid-rows-[1fr]` collapse track below, it made Chromium's flex auto-height calculation
// collapse to just the padding for some locations (reproduced with Kwai Chai Hong, not with
// National Museum - a content-dependent flex/grid/overflow sizing interaction, not something
// worth chasing further). It isn't needed anyway: `MuralArtwork` is a background-image, which
// is already confined to its own element's box regardless of any ancestor's overflow, and
// `inset-0` already ties it exactly to the header's own (now correctly computed) height.
export interface LocationHeaderProps {
  location: Location;
  onBack: () => void;
  scrolled?: boolean;
}

export function LocationHeader({ location, onBack, scrolled = false }: LocationHeaderProps) {
  const nearestStation = location.details?.stationGuide.stations[0];

  return (
    <div
      className={`sticky top-0 z-20 flex items-center gap-3 p-6 transition-[padding,border-color] duration-200 ${
        scrolled ? 'border-b border-border py-4' : 'border-b border-transparent pb-0'
      }`}
    >
      <MuralArtwork
        className="absolute inset-0"
        gradientStartColor="#EBDBC1"
        gradientEndColor="rgba(240, 228, 208, 0)"
      />
      <div
        className={`absolute inset-0 bg-background transition-opacity duration-200 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <IconButton
        icon={<ArrowLeft />}
        aria-label="Back to list"
        radius="rounded"
        className="relative z-10"
        onClick={onBack}
      />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col items-center">
        <p
          className={`line-clamp-2 w-full text-center text-foreground transition-[font-size,line-height] duration-200 ${
            scrolled ? 'text-h3' : 'text-h2'
          }`}
        >
          {location.name}
        </p>
        <div
          className={`grid w-full justify-items-center overflow-hidden transition-[grid-template-rows,opacity] duration-200 ${
            scrolled ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] pt-2 opacity-100'
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="flex items-center gap-1">
              <span className="size-3.5 shrink-0 text-muted-foreground [&_svg]:size-3.5">
                <Clock />
              </span>
              <span className="text-subtle-medium text-muted-foreground">
                {location.status === 'open' ? 'Open' : 'Closed'}
              </span>
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
      </div>
      <IconButton
        icon={<ShareNetwork />}
        aria-label="Share"
        radius="rounded"
        className="relative z-10"
      />
    </div>
  );
}

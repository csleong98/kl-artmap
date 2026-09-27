import type { ReactNode } from 'react';
import type { AccordionCardChip } from './AccordionCard';

// Ported from Figma (KL Art Map, "list item" component, node 288:1747) - a selectable row
// pairing a photo preview with a title and info chips, e.g. a place result in a search/
// results list. Figma's fixed 433px frame width becomes `w-full` here (matching how
// `AccordionCard` generalizes its own fixed-width Figma frame), since a list row should fill
// whatever list container holds it, not one specific artboard's measurement.
//
// `chips` reuses `AccordionCardChip`'s `{ icon?, label }` shape rather than inventing a
// second identical type - this component just lays them out in a vertical stack instead of
// `AccordionCard`'s inline dot-separated row, since Figma places them one per line here.
//
// `photos` drives Figma's `noOfPhotos` variant automatically instead of exposing it as a
// separate enum: one photo renders a single framed thumbnail, two or more render the fanned
// "stacked" look. Figma's own stacked example reuses one placeholder image for all three
// layers (it has no other asset to demonstrate with), but the layers are re-ordered here so
// the *first* photo - the actual cover photo callers care about - is always the front/
// top-most, least-rotated layer, with the 2nd/3rd photos (or the cover photo repeated, if
// fewer than three were given) peeking out behind it, rather than literally matching Figma's
// DOM order (whose later "multi" layers paint over the first one - indistinguishable there
// only because every layer happens to share one placeholder asset).
//
// The three-state Figma variant (default/hover/active) splits the same way `AccordionCard`
// splits its own two-state one: hover is a real `:hover` pseudo-class, not a prop, while
// `active` (a row the parent has selected, e.g. the place currently focused on the map) is
// an explicit boolean since only the parent knows that. The border also stays a constant
// width across all states rather than Figma's 1px default/2px active, for the same reason
// `AccordionCard` fixed its own border width: a width change shifts the whole row by a
// pixel on each edge, which reads as a jump rather than a clean color change. That constant
// is 1px (matching every other bordered surface in this design system - `SearchInput`,
// `Button`'s outline variant, and so on), not 2px - `active` is communicated by swapping to
// `border-ring`, which doesn't need extra thickness to still read as selected.
//
// `title` clamps to 2 lines rather than truncating to 1 - a name like "Istana Budaya
// (National Theater)" was getting cut mid-word on a single line, and this row has no fixed
// height forcing it to stay that short.
export interface ListItemPhoto {
  src: string;
  alt?: string;
}

export interface ListItemProps {
  title: ReactNode;
  photos: ListItemPhoto[];
  chips?: AccordionCardChip[];
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

// back -> middle -> front (paint order), so the front slot - the one closest to Figma's own
// "main" frame transform - always lands on the cover photo. Each frame is a plain `inset-0`
// square (not Figma's enlarged-and-negative-offset squares) since rotating a same-size,
// same-centered square via `transform` needs no size/position trick to stay concentric with
// its siblings - that trick is an artifact of how Figma represents a rotated layer's
// axis-aligned bounding box, not something worth reproducing.
//
// At rest the tilt is only slightly past Figma's literal -3.12deg/2.98deg (which read as
// barely-there jitter at this thumbnail size) - just enough to look like a naturally tossed
// stack of photos without calling attention to itself. Hovering fans the back/middle photos
// out further with a bigger rotation *and* a translate, which - combined with the existing
// `hover:bg-brand-50` on the row - reads as one smooth "the stack loosens up" motion rather
// than a static stack. `transform` (not `left`/`top`) drives both states so the transition is
// compositor-only, consistent with why `ImageCarousel` avoids animating layout properties.
const PHOTO_FRAMES = [
  { rest: 'rotate-[-6deg]', hover: 'group-hover:rotate-[-8.5deg] group-hover:-translate-x-[2.5px] group-hover:translate-y-[1px]' },
  { rest: 'rotate-[5deg]', hover: 'group-hover:rotate-[7.5deg] group-hover:translate-x-[2.5px] group-hover:-translate-y-[1.5px]' },
  { rest: 'rotate-[-0.5deg]', hover: '' },
];

export function ListItem({ title, photos, chips = [], active, onClick, className }: ListItemProps) {
  const isMulti = photos.length > 1;
  const layeredPhotos = isMulti ? [photos[2] ?? photos[0], photos[1] ?? photos[0], photos[0]] : [photos[0]];
  const frames = isMulti ? PHOTO_FRAMES : PHOTO_FRAMES.slice(-1);

  const Container = onClick ? 'button' : 'div';

  return (
    <Container
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`group flex w-full items-start gap-3 rounded-[20px] border bg-background p-4 text-left transition-colors ${
        active ? 'border-ring' : 'border-border hover:bg-brand-50'
      } ${className ?? ''}`}
    >
      {photos.length > 0 && (
        <div className="relative size-[132px] shrink-0">
          {frames.map((frame, index) => {
            const photo = layeredPhotos[index];
            if (!photo) return null;
            return (
              <div
                key={index}
                className={`absolute inset-0 transition-transform duration-300 ease-out ${frame.rest} ${frame.hover}`}
              >
                <div className="relative size-[132px] shrink-0 rounded-lg border-4 border-white shadow-[0px_2px_10px_1px_rgba(0,0,0,0.08)]">
                  <img
                    src={photo.src}
                    alt={photo.alt ?? ''}
                    className="absolute inset-0 size-full rounded-lg object-cover"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2 self-stretch">
        <p className="line-clamp-2 w-full text-h4 leading-7 text-card-foreground">{title}</p>
        {chips.length > 0 && (
          <div className="flex flex-col items-start justify-center gap-0.5">
            {chips.map((chip, index) => (
              <div key={index} className="flex items-center gap-1">
                {chip.icon && (
                  <span className="size-3.5 shrink-0 text-muted-foreground [&_svg]:size-3.5">{chip.icon}</span>
                )}
                <span className="text-subtle whitespace-nowrap text-muted-foreground">{chip.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

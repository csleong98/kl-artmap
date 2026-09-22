import type { ReactNode } from 'react';
import { Question } from '@phosphor-icons/react';
import { Tooltip } from './Tooltip';

// Ported from Figma (KL Art Map, "list item" component within "Listing view + cluster",
// node 373:23896) - a gallery route card for the Gallery Routes listing grid. Not to be
// confused with `ListItem` (a place row with stacked photos + icon chips in a vertical
// list) - this is a distinct card shape: one large preview image on top, then a title/
// description pair, then a row of label-over-value chips with no icon or pill background.
//
// Figma's preview image has four hand-placed decorative squiggle SVGs overlaid on one demo
// screenshot (meant to suggest a drawn route line) - those are artifacts of that one static
// asset, not a data-driven design element, so they're dropped here. `previewImage` just
// renders directly against the `brand-50`/`brand-300` frame Figma uses as the image's own
// background/border, which reads fine as a loading/empty state on its own.
//
// Figma's frame is a literal 380px tall regardless of card width, which only reads as a
// photo-ish rectangle at Figma's own ~410px-wide card. In a real responsive grid a narrower
// card keeps that same 380px height and turns the image portrait-tall (and the whole card
// disproportionately long) - so this uses an aspect ratio matching Figma's own width:height
// instead, which holds the same proportions at any card width.
//
// Chips are a generic `{ label, value, tooltip? }` array rather than three fixed props
// (places/distance/time) - Figma only ever shows those three, but nothing about the card
// requires exactly that set, and `tooltip` covers the one chip ("Est. travel time") that
// pairs its label with an info glyph explaining how the figure is derived.
export interface RouteCardChip {
  label: string;
  value: ReactNode;
  tooltip?: ReactNode;
}

export interface RouteCardProps {
  title: ReactNode;
  description?: ReactNode;
  previewImage?: { src: string; alt?: string };
  chips?: RouteCardChip[];
  onClick?: () => void;
  className?: string;
}

export function RouteCard({ title, description, previewImage, chips = [], onClick, className }: RouteCardProps) {
  const Container = onClick ? 'button' : 'div';

  return (
    <Container
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex w-full flex-col items-start gap-4 overflow-hidden rounded-3xl border border-border bg-background p-6 text-left transition-colors ${
        onClick ? 'hover:bg-brand-50' : ''
      } ${className ?? ''}`}
    >
      <div className="aspect-[41/38] w-full shrink-0 overflow-hidden rounded-xl border border-brand-300 bg-brand-50">
        {previewImage && (
          <img src={previewImage.src} alt={previewImage.alt ?? ''} className="size-full object-cover" />
        )}
      </div>
      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full flex-col items-start gap-0.5">
          <p className="w-full truncate text-h4 text-card-foreground">{title}</p>
          {description && <p className="w-full truncate text-p-ui text-foreground">{description}</p>}
        </div>
        {chips.length > 0 && (
          <div className="flex w-full items-start gap-6">
            {chips.map((chip, index) => (
              <div key={index} className="flex flex-col items-start justify-center gap-0.5">
                <div className="flex items-center gap-1">
                  <span className="whitespace-nowrap text-subtle text-muted-foreground">{chip.label}</span>
                  {chip.tooltip && (
                    <Tooltip content={chip.tooltip}>
                      <span className="inline-flex size-2.5 shrink-0 cursor-help text-muted-foreground [&_svg]:size-2.5">
                        <Question />
                      </span>
                    </Tooltip>
                  )}
                </div>
                <span className="whitespace-nowrap text-p-ui-medium text-foreground">{chip.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

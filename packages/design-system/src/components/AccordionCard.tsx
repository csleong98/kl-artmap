import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { Collapsible } from '@base-ui/react/collapsible';
import { CaretDown, CaretUp } from '@phosphor-icons/react';

// Ported from Figma (KL Art Map, "accordion card" node 334:2746), built on Base UI's
// Collapsible primitive - a standalone, independently-toggled disclosure (matching how
// apps/web's existing NearestStationAccordion already uses Radix's Collapsible: one card,
// its own open state, no mutual exclusivity with sibling cards), not Base UI's `Accordion`,
// which is for a group where opening one can close the others.
//
// Two things intentionally differ from the raw Figma output:
// - Two nearby but slightly different Figma colors are unified onto the closest existing
//   token rather than adding one-off hex values: the default border (#ececec) uses the
//   existing `border` token (#e5e5e5), and the title's default-state color (#282828) uses
//   `card-foreground` (#171717, the same token the expanded state already uses via a bound
//   variable) instead of a second static color - the difference looks like an artifact of
//   duplicating frames in Figma, not an intentional per-state title color.
// - `open`/`data-open` (from Base UI) drives the border, title color and caret swap via
//   Tailwind's `group-data-[open]:` variant, rather than a JS-tracked boolean, consistent
//   with how this design system prefers native/attribute-driven state over React state.
// - The border is a constant 2px (not Figma's 1px default / 2px expanded) and only its
//   *color* changes on open. A width change resizes the box (border sits inside the
//   layout), so it shifted the header by a pixel on each edge and made expand/collapse
//   look like a jump instead of a smooth animation - fixing the width and animating the
//   color instead removes that shift entirely. The 2px light-gray default border is a
//   half-step past Figma's 1px, but the alternative (a visible pop when toggling) was
//   worse.
// - The expanded panel animates open/closed using Base UI's `--collapsible-panel-height`
//   var instead of the instant show/hide Figma implies, since an abrupt cut felt jerky
//   next to the border's own transition. Its padding lives on an inner wrapper, not the
//   animated element itself, so `overflow-hidden` can clip it away at height 0 - padding
//   on the animated element would otherwise keep the panel a fixed height even at "0".
//
// The three content axes the Figma component hard-codes are all opened up here:
// - `badge` is a free slot (typically a `<Badge>`), not a fixed color/label pair, so any
//   Badge variant can appear per line/category.
// - `chips` is a list (not fixed "walk time" + two "distance" fields) so a card can show
//   anywhere from zero to many info chips, each with or without a leading icon; the
//   dot separators are inserted automatically between whatever is provided.
// - `children` (the expanded panel) is fully free-form - Figma's own example mixes an
//   image, a paragraph and a button, but nothing here assumes that shape.
export interface AccordionCardChip {
  icon?: ReactNode;
  label: ReactNode;
}

export interface AccordionCardProps {
  title: ReactNode;
  badge?: ReactNode;
  chips?: AccordionCardChip[];
  /** The expanded panel's content - can be anything (text, images, actions, ...). */
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function AccordionCard({
  title,
  badge,
  chips = [],
  children,
  open,
  defaultOpen,
  onOpenChange,
  className,
}: AccordionCardProps) {
  return (
    <Collapsible.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      className={`group flex w-full flex-col rounded-xl border-2 border-border bg-card p-6 transition-colors duration-200 data-[open]:border-ring ${className ?? ''}`}
    >
      <Collapsible.Trigger className="flex w-full items-center gap-4 text-left">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-medium leading-6 text-card-foreground [font-family:var(--font-geist)]">
              {title}
            </p>
            {badge}
          </div>
          {chips.length > 0 && (
            <div className="flex items-center gap-2">
              {chips.map((chip, index) => (
                <Fragment key={index}>
                  {index > 0 && <span className="size-1 shrink-0 rounded-full bg-muted-foreground" />}
                  <div className="flex items-center gap-1">
                    {chip.icon && (
                      <span className="size-3.5 shrink-0 text-muted-foreground [&_svg]:size-3.5">{chip.icon}</span>
                    )}
                    <span className="whitespace-nowrap text-xs font-medium leading-5 text-muted-foreground [font-family:var(--font-geist)]">
                      {chip.label}
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>
          )}
        </div>
        <CaretDown className="size-6 shrink-0 text-foreground group-data-[open]:hidden" weight="regular" />
        <CaretUp className="hidden size-6 shrink-0 text-foreground group-data-[open]:block" weight="regular" />
      </Collapsible.Trigger>
      <Collapsible.Panel className="h-[var(--collapsible-panel-height)] w-full overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
        <div className="w-full pt-4">{children}</div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

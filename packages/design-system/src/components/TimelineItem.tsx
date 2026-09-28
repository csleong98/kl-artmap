import { cloneElement, isValidElement, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { CaretDown, CaretUp } from '@phosphor-icons/react';

// `-webkit-line-clamp` itself can't be transitioned (browsers don't animate it), so the
// clamped description instead sits in a wrapper whose `max-height` is animated between a
// fixed 2-line height (matching `text-base`/`leading-6`: 24px * 2) and the paragraph's own
// measured `scrollHeight` when expanded - the same "measure the real height, animate toward
// it" approach as `AccordionCard`'s panel, just without a headless primitive to supply the
// measurement for us.
const COLLAPSED_DESCRIPTION_HEIGHT = 48;

// Ported from Figma (KL Art Map, "Timeline" node 335:2959). Figma exposes this as one
// component with a `descriptionLength: "One line" | "Multi-line"` variant, but that name
// describes a layout shape, not an actual text-length constraint - both layouts show the
// exact same title+description pair (see the "route" example at node 373:24336, where
// "REXKL"'s description is a full paragraph in the *same* layout as "10m/Starting point"'s
// short one). Renamed to `layout: 'compact' | 'detailed'` here, since that's what actually
// varies: compact is a centered one-row marker+text pairing with no action slot or
// connecting line; detailed stacks marker/text vertically and supports an action/expand
// slot and the line that continues the connector down through the item's own height.
//
// The marker is a free `icon` slot rather than Figma's `iconSelection`/`iconSelectionActive`
// pair - those two are the same glyph at two different Phosphor weights ("fill" vs
// "regular"), which `active` already governs for the dot marker, so it's applied here too
// via `cloneElement` instead of asking the caller to pass two separately-weighted icons.
// Omitting `icon` renders the plain dot marker instead (Figma's separate "With status dot"
// type) - dropping "type" as its own prop, since icon presence already determines it.
//
// The image thumbnail is opt-in via the `thumbnail` prop (no prop at all = no thumbnail),
// matching Figma's `showImageThumbnail` defaulting to off.
//
// Figma's `buttonType: "secondary btn" | "text-only btn"` is a choice between two mutually
// exclusive footer buttons, not a style variant of one button - "secondary btn" is an inert
// action (`action`, e.g. a `<Button>` that opens a dialog or navigates away) and "text-only
// btn" is a self-contained read-more/read-less toggle that clamps `description` to 2 lines.
// That's why they're two separate props (`action` vs `expandable`) instead of one prop with
// two values: the toggle owns state and drives its own label/caret, which an arbitrary
// `action` node can't do from outside. Passing both is meaningless per Figma (pick one);
// `expandable` wins if both are set.
export interface TimelineItemProps {
  title: ReactNode;
  description?: ReactNode;
  /** 'detailed' (default) stacks marker/text and supports `action`/`expandable` + the
   * connecting line; 'compact' is a single centered row with neither. */
  layout?: 'compact' | 'detailed';
  /** Marker icon (accent circle). Omit for a plain dot marker. */
  icon?: ReactNode;
  /** true (default): filled dot / filled icon weight. false: hollow ring dot / outline icon weight. */
  active?: boolean;
  thumbnail?: string;
  thumbnailAlt?: string;
  /** 'detailed' layout only - e.g. a `<Button>` ("View details", ...). Ignored if `expandable`. */
  action?: ReactNode;
  /** 'detailed' layout only - renders a built-in read-more/read-less toggle that clamps
   * `description` to 2 lines when collapsed, instead of `action`. */
  expandable?: boolean;
  /** Controlled expanded state for `expandable`. */
  expanded?: boolean;
  /** Uncontrolled initial expanded state for `expandable`. @default false */
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  expandLabel?: ReactNode;
  collapseLabel?: ReactNode;
  /** Whether the connecting line continues past this item ('detailed' layout only).
   * Set automatically by `Timeline` based on position; defaults to true for standalone use. */
  connectToNext?: boolean;
  className?: string;
}

export function TimelineItem({
  title,
  description,
  layout = 'detailed',
  icon,
  active = true,
  thumbnail,
  thumbnailAlt = '',
  action,
  expandable = false,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  expandLabel = 'View more',
  collapseLabel = 'View less',
  connectToNext = true,
  className,
}: TimelineItemProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
  const isExpanded = expanded ?? uncontrolledExpanded;

  const toggleExpanded = () => {
    const next = !isExpanded;
    if (expanded === undefined) setUncontrolledExpanded(next);
    onExpandedChange?.(next);
  };

  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [descriptionMaxHeight, setDescriptionMaxHeight] = useState(
    isExpanded ? undefined : COLLAPSED_DESCRIPTION_HEIGHT
  );

  useLayoutEffect(() => {
    if (!expandable) return;
    if (isExpanded) {
      setDescriptionMaxHeight(descriptionRef.current?.scrollHeight);
    } else {
      setDescriptionMaxHeight(COLLAPSED_DESCRIPTION_HEIGHT);
    }
  }, [expandable, isExpanded]);
  const marker = (
    <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${icon ? 'bg-accent' : ''}`}>
      {icon ? (
        <span className="size-4 shrink-0 text-accent-foreground [&_svg]:size-4">
          {isValidElement(icon)
            ? cloneElement(icon as ReactElement<{ weight?: string }>, { weight: active ? 'fill' : 'regular' })
            : icon}
        </span>
      ) : (
        <span
          className={`size-3 rounded-full ${active ? 'bg-accent-foreground' : 'border-2 border-accent-foreground'}`}
        />
      )}
    </div>
  );

  const thumbnailEl = thumbnail && (
    <img loading="lazy" decoding="async"
      src={thumbnail}
      alt={thumbnailAlt}
      className="size-12 shrink-0 rounded-xl border-2 border-popover object-cover shadow-[0px_1px_3px_0px_rgba(0,0,0,0.12)]"
    />
  );

  if (layout === 'compact') {
    return (
      <div className={`flex w-full items-center gap-2 px-4 py-1 ${className ?? ''}`}>
        {marker}
        <div className="flex min-w-0 flex-1 items-start gap-1">
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <p className="w-full text-base font-medium leading-6 text-foreground [font-family:var(--font-geist)]">
              {title}
            </p>
            {description && (
              <p className="w-full text-base leading-6 text-muted-foreground [font-family:var(--font-geist)]">
                {description}
              </p>
            )}
          </div>
          {thumbnailEl}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full items-start gap-2 px-4 pt-1 ${className ?? ''}`}>
      <div className="flex shrink-0 flex-col items-center gap-3 self-stretch">
        <div className="flex items-center pt-2">{marker}</div>
        {connectToNext && <div className="w-px flex-1 bg-border" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2.5">
        <div className="flex w-full items-start gap-1">
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <p className="w-full text-base font-medium leading-6 text-foreground [font-family:var(--font-geist)]">
              {title}
            </p>
            {description && expandable && (
              <div
                className="w-full overflow-hidden transition-[max-height] duration-200 ease-in-out"
                style={{ maxHeight: descriptionMaxHeight }}
              >
                <p
                  ref={descriptionRef}
                  className="w-full text-base leading-6 text-muted-foreground [font-family:var(--font-geist)]"
                >
                  {description}
                </p>
              </div>
            )}
            {description && !expandable && (
              <p className="w-full text-base leading-6 text-muted-foreground [font-family:var(--font-geist)]">
                {description}
              </p>
            )}
          </div>
          {thumbnailEl}
        </div>
        {expandable ? (
          <button
            type="button"
            aria-expanded={isExpanded}
            onClick={toggleExpanded}
            className="flex shrink-0 items-center gap-2.5 py-1 text-sm font-medium leading-6 text-secondary-foreground [font-family:var(--font-inter)]"
          >
            {isExpanded ? collapseLabel : expandLabel}
            {isExpanded ? <CaretUp className="size-4 shrink-0" weight="regular" /> : <CaretDown className="size-4 shrink-0" weight="regular" />}
          </button>
        ) : (
          action
        )}
      </div>
    </div>
  );
}

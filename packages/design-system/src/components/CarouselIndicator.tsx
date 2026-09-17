import { CarouselDot } from './CarouselDot';

// Ported from Figma (KL Art Map, "carousel / indicator" node 309:3742): the white pill
// that hosts a row of `CarouselDot`s, meant to float over a photo (hence the drop shadow).
// Figma hardcodes 5 static dots with the first one active - generalized here to `total`/
// `current` so it reflects real carousel state, matching the `currentIndex`/`images.length`
// pair `apps/web`'s own ImageCarousel already tracks.
//
// `onDotClick` is optional and left out of Figma entirely (it only shows the static visual).
// When provided, dots render as real buttons (focusable, `aria-label`, `aria-current`) - but
// deliberately not enlarged past their 6px visual size for a larger tap target, since that
// would puff up the pill's compact footprint that this component's whole look depends on.
// Precise tapping is a real trade-off here, not an oversight: pair this with swipe/arrow
// navigation rather than relying on the dots alone for touch input.
export interface CarouselIndicatorProps {
  total: number;
  /** 0-indexed. */
  current: number;
  onDotClick?: (index: number) => void;
  className?: string;
}

export function CarouselIndicator({ total, current, onDotClick, className }: CarouselIndicatorProps) {
  return (
    <div
      className={`inline-flex w-fit items-center gap-1 rounded-lg bg-background p-1 shadow-[0px_2px_4px_rgba(0,0,0,0.12)] ${className ?? ''}`}
    >
      {Array.from({ length: total }, (_, index) =>
        onDotClick ? (
          <button
            key={index}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === current || undefined}
            onClick={() => onDotClick(index)}
            className="inline-flex shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <CarouselDot active={index === current} />
          </button>
        ) : (
          <CarouselDot key={index} active={index === current} />
        )
      )}
    </div>
  );
}

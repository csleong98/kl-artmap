import { useEffect, useRef, useState } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { IconButton } from './IconButton';
import { CarouselIndicator } from './CarouselIndicator';

// Ported from a Figma frame the design-context tool couldn't reach (rate-limited) - built
// from the CSS export instead. The "fanned photos" look is real absolute-positioned
// artwork tuned for a 352x380 card, not a generic responsive gallery, so this card keeps
// that literal pixel footprint rather than inventing a fluid layout for numbers that were
// hand-placed at one size. `className` can still constrain/reposition the card itself; the
// internal fan geometry is fixed.
//
// Adaptations from the raw export:
// - Figma paints each photo as a plain `background: url(...)` div. Real photos need `alt`
//   text and should be actual `<img>` elements, not decorative backgrounds.
// - The exported side-photo offsets left about 6px of the left photo visible past the card
//   edge but ~29px of the right one - an asymmetry in the export's own numbers, not
//   something that varies with photo content (every photo is cropped into the same fixed
//   212x241 box via `object-cover` regardless of its own size, so source dimensions were
//   never the actual cause). Recomputed both offsets from the card width so the same
//   `PEEK_VISIBLE` amount shows on each side no matter which/how many images are passed.
// - Navigating only ever shows 3 photos (prev/current/next) - the mental model is a circle
//   of photos with the camera fixed on the front, not a literal filmstrip, so nothing
//   should be visible "flying" through the middle of the card from off-screen to reach a
//   peek slot; an earlier version rendered extra off-canvas photos to slide in from (most
//   visibly, whichever photo wrapped from one edge to the other traveled the full card
//   width, behind everything else, every single time count === 5). A photo becoming the
//   new left/right peek instead starts a short distance further out on its *own* side -
//   still fully hidden past the card's clipped edge, never anywhere near the center photo's
//   territory - and slides that short distance in while fading in, so it still reads as
//   entering (not just popping into place) without ever crossing the visible stage. The
//   center slot has no "side" to arrive from, so it only fades. The three visible photos
//   otherwise slide smoothly between their own slots as before.
// - Position (`transform: translate(...)`) and rotation (`transform: rotate(...)`) are on
//   two separate elements - a wrapper that only slides, and the inner photo that only
//   tilts - and only the wrapper's translate is transitioned. Continuously re-rotating a
//   raster photo while it also moves means the browser keeps re-rasterizing its (fairly
//   thick) white border at a new angle every frame, which showed up as a shaky double edge
//   on the border; snapping the tilt instead of animating it removed that.
export interface ImageCarouselImage {
  src: string;
  alt?: string;
}

export interface ImageCarouselProps {
  images: ImageCarouselImage[];
  /** Controlled active index. */
  current?: number;
  /** Uncontrolled initial active index. @default 0 */
  defaultCurrent?: number;
  onCurrentChange?: (index: number) => void;
  /**
   * Fill the container's width instead of the fixed 352x380 card, using Figma's mobile
   * geometry (node 430:8706: a 396x421 card, 255x289 center photo) scaled to whatever width
   * the container actually is - e.g. 343px on a 375px phone.
   */
  fluid?: boolean;
  className?: string;
}

interface Geometry {
  cardWidth: number;
  cardHeight: number;
  photoWidth: number;
  photoHeight: number;
  peekVisible: number;
  centerTop: number;
  peekTop: number;
  border: number;
}

const DESKTOP_GEOMETRY: Geometry = {
  cardWidth: 352,
  cardHeight: 380,
  photoWidth: 212,
  photoHeight: 241,
  peekVisible: 24,
  centerTop: 32,
  peekTop: 46,
  border: 10,
};

function mobileGeometry(width: number): Geometry {
  const r = width / 396;
  return {
    cardWidth: width,
    cardHeight: 421 * r,
    photoWidth: 255 * r,
    photoHeight: 289 * r,
    peekVisible: 29 * r,
    centerTop: 42 * r,
    peekTop: 51 * r,
    border: 7.5 * r,
  };
}

const PEEK_ROTATE = 7;
// How much further out (on its own side) a newly-arriving peek starts before sliding in to
// rest - comfortably past the visible sliver (~24-39px, depending on rotation), so it
// starts fully hidden by the card's `overflow-hidden` and never dips toward the center.
const ENTRY_OFFSET = 48;

// Shortest signed distance from `current` to `index` around a loop of `count` items, so
// e.g. advancing past the last image slides the first one in from the right instead of
// jumping in from the far left. Only -1/0/1 are ever rendered.
function slotDistance(current: number, index: number, count: number) {
  let diff = index - current;
  if (diff > count / 2) diff -= count;
  if (diff < -count / 2) diff += count;
  return diff;
}

function slotPosition(distance: number, g: Geometry) {
  const side = distance === 0 ? 0 : Math.sign(distance);
  return {
    x:
      distance === 0
        ? (g.cardWidth - g.photoWidth) / 2
        : side < 0
          ? g.peekVisible - g.photoWidth
          : g.cardWidth - g.peekVisible,
    y: distance === 0 ? g.centerTop : g.peekTop,
    rotate: side * PEEK_ROTATE,
    zIndex: distance === 0 ? 1 : 0,
  };
}

interface CarouselPhotoProps {
  src: string;
  alt: string;
  distance: number;
  geometry: Geometry;
}

// A photo fades in and settles into its slot the moment it mounts (i.e. only the first
// time it becomes one of the 3 visible slots) via its own local `entered` state, which a
// later reposition never resets - React keeps reusing this same instance across renders as
// long as its `key` (the image's index) stays within the visible set, so this never
// replays on an ordinary slide between slots, only on a genuinely new photo appearing.
function CarouselPhoto({ src, alt, distance, geometry }: CarouselPhotoProps) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const { x: restX, y, rotate, zIndex } = slotPosition(distance, geometry);
  const side = distance === 0 ? 0 : Math.sign(distance);
  const x = entered ? restX : restX + side * ENTRY_OFFSET;

  return (
    <div
      className="absolute left-0 top-0 transition-transform duration-300 ease-out will-change-transform"
      style={{ transform: `translate(${x}px, ${y}px)`, zIndex }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: geometry.photoWidth,
          height: geometry.photoHeight,
          borderWidth: geometry.border,
          transform: `rotate(${rotate}deg)`,
          opacity: entered ? 1 : 0,
        }}
        className="rounded-sm border-white object-cover shadow-[0px_10px_10px_2px_rgba(0,0,0,0.08)] transition-opacity duration-300 ease-out"
      />
    </div>
  );
}

export function ImageCarousel({
  images,
  current,
  defaultCurrent = 0,
  onCurrentChange,
  fluid = false,
  className,
}: ImageCarouselProps) {
  const [uncontrolledCurrent, setUncontrolledCurrent] = useState(defaultCurrent);
  const activeIndex = current ?? uncontrolledCurrent;
  const count = images.length;
  const epochsRef = useRef<Map<number, number>>(new Map());
  const prevDistancesRef = useRef<Map<number, number>>(new Map());
  const cardRef = useRef<HTMLDivElement>(null);
  const [fluidWidth, setFluidWidth] = useState(0);

  useEffect(() => {
    if (!fluid || !cardRef.current) return;
    const el = cardRef.current;
    const observer = new ResizeObserver(() => setFluidWidth(el.clientWidth));
    observer.observe(el);
    setFluidWidth(el.clientWidth);
    return () => observer.disconnect();
  }, [fluid, count]);

  if (count === 0) return null;

  const geometry = fluid ? mobileGeometry(fluidWidth || 396) : DESKTOP_GEOMETRY;
  // Fluid cards take their width from the container and keep Figma's mobile aspect ratio;
  // photos only render once the real width has been measured, so they never flash at a
  // guessed size first.
  const cardStyle = fluid ? { aspectRatio: '396 / 421' } : { width: geometry.cardWidth, height: geometry.cardHeight };
  const cardClass = `relative overflow-hidden border border-accent bg-brand-50 ${fluid ? 'w-full rounded-3xl' : 'rounded-lg'} ${
    className ?? ''
  }`;
  const measured = !fluid || fluidWidth > 0;

  const goTo = (index: number) => {
    const next = ((index % count) + count) % count;
    if (current === undefined) setUncontrolledCurrent(next);
    onCurrentChange?.(next);
  };

  // A single photo has no "fan" to speak of - the peek slots and nav controls exist to
  // hint at more photos either side, which don't exist here. Rendering it through the same
  // fixed polaroid slot just leaves most of the card empty, so a lone photo instead fills
  // the card directly (minus a flat inset) rather than sitting in that slot.
  //
  // The inset wrapper is a plain `div`, not the `img` itself: an absolutely positioned
  // *replaced* element (img/video) with only `inset` set and no explicit width/height can
  // size itself from its own intrinsic dimensions instead of stretching to fill, so a
  // portrait or landscape source could overflow past the card depending on its own aspect
  // ratio. A non-replaced div reliably stretches to fill its inset; the img then just takes
  // `h-full w-full` of that already-correctly-sized box, so `object-cover` crops it the same
  // way regardless of the source's own orientation.
  //
  // Keeps the same white-border-and-drop-shadow "photo" treatment as the fanned polaroids,
  // just a little thinner (8px vs. their 10px) since it'd otherwise look heavier at this
  // much larger size. `box-border` makes the border count *inside* the `h-full`/`w-full` box
  // rather than adding to it, so the bordered photo still exactly fills the inset wrapper -
  // no overflow risk regardless of source aspect ratio, and no need to clip it.
  if (count === 1) {
    return (
      <div ref={cardRef} className={cardClass} style={cardStyle}>
        <div className="absolute inset-5">
          <img
            src={images[0].src}
            alt={images[0].alt ?? ''}
            className="box-border h-full w-full rounded-sm border-[8px] border-white object-cover shadow-[0px_10px_10px_2px_rgba(0,0,0,0.08)]"
          />
        </div>
      </div>
    );
  }

  const visible = images
    .map((image, index) => ({ image, index, distance: slotDistance(activeIndex, index, count) }))
    .filter(({ distance }) => Math.abs(distance) <= 1);

  // With very few images (count 3), a photo already sitting in the left peek has nowhere
  // else to go but straight to the right peek when advancing (there's no distance -2 slot
  // to fall out of first) - the same cross-canvas jump removed elsewhere, just forced by
  // the loop being this short instead of by the ±2-slot approach. Detecting that specific
  // left<->right flip and bumping an epoch per index forces React to remount that photo
  // (a fresh `key`) instead of animating the same element across the card - it then just
  // uses the ordinary fresh-arrival slide-and-fade from `CarouselPhoto`.
  const epochs = epochsRef.current;
  const prevDistances = prevDistancesRef.current;
  for (const index of prevDistances.keys()) {
    if (!visible.some((v) => v.index === index)) prevDistances.delete(index);
  }
  const visibleWithEpoch = visible.map(({ image, index, distance }) => {
    const prevDistance = prevDistances.get(index);
    if (prevDistance !== undefined && Math.abs(prevDistance) === 1 && Math.abs(distance) === 1 && distance !== prevDistance) {
      epochs.set(index, (epochs.get(index) ?? 0) + 1);
    }
    prevDistances.set(index, distance);
    return { image, index, distance, epoch: epochs.get(index) ?? 0 };
  });

  return (
    <div ref={cardRef} className={cardClass} style={cardStyle}>
      {measured &&
        visibleWithEpoch.map(({ image, index, distance, epoch }) => (
          <CarouselPhoto
            key={`${index}-${epoch}`}
            src={image.src}
            alt={image.alt ?? ''}
            distance={distance}
            geometry={geometry}
          />
        ))}
      <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between">
        <IconButton icon={<CaretLeft />} radius="rounded" aria-label="Previous image" onClick={() => goTo(activeIndex - 1)} />
        <CarouselIndicator total={count} current={activeIndex} onDotClick={goTo} />
        <IconButton icon={<CaretRight />} radius="rounded" aria-label="Next image" onClick={() => goTo(activeIndex + 1)} />
      </div>
    </div>
  );
}

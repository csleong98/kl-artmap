import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { MapPin } from '@phosphor-icons/react';

// Ported from Figma (KL Art Map, "MapMarker" component, node 309:2839) - the custom pin used
// for places on the map. Not yet wired into the actual Mapbox layer (per apps/web's own
// map.tsx) - this is just the visual component for now, to be dropped in later.
//
// Figma's `type` variant ('Pin' | 'picture') becomes `'pin' | 'photo'` here, matching this
// codebase's lowercase variant convention. Figma's own pin glyph is a pair of hand-exported
// SVGs (one per state, temporary 7-day asset URLs) rather than an icon-font weight swap; this
// uses Phosphor's `MapPin` (`weight="fill"`) instead, since it's visually the same
// teardrop-with-a-hole shape already used for icons everywhere else in this app.
//
// Figma's hover state is a real interaction (mouse/touch), not a prop, like every other
// hover-only state in this design system - `group-hover:` drives both the pin's slight
// grow-on-hover and the tooltip's fade/scale-in together, so it reads as one motion instead
// of an abrupt swap. The photo marker's tooltip is simplified to sit centered below the
// frame rather than Figma's specific left-shifted placement (tuned pixel-for-pixel for one
// demo layout) - easy to nudge once this is actually sitting on the map and the real
// anchor/overlap behavior with other markers is visible.
//
// This used to also support a `labelVisible="always"` variant for the v2 map view, showing
// every visible marker's name persistently - dropped per direction (a map full of permanently
// open tooltips reads as cluttered once there are more than a couple of markers on screen),
// so hover is the only way to reveal a label now.
export interface MapMarkerPhoto {
  src: string;
  alt?: string;
}

export interface MapMarkerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: 'pin' | 'photo';
  /** Required when `type="photo"` - falls back to the pin glyph if omitted. */
  photo?: MapMarkerPhoto;
  /** Tooltip shown on hover, e.g. a place name or an action like "Add to library". */
  label?: ReactNode;
}

export function MapMarker({ type = 'pin', photo, label, className, ...props }: MapMarkerProps) {
  const isPhoto = type === 'photo' && !!photo;

  return (
    <button
      type="button"
      className={`group relative inline-flex items-center justify-center ${isPhoto ? 'size-[114px]' : 'size-14'} ${className ?? ''}`}
      {...props}
    >
      {isPhoto ? (
        <div className="size-full overflow-hidden rounded-[20px] border-[6px] border-popover shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
          <img loading="lazy" decoding="async" src={photo!.src} alt={photo!.alt ?? ''} className="size-full object-cover" />
        </div>
      ) : (
        <MapPin
          weight="fill"
          className="size-14 text-primary drop-shadow-[0px_2px_4px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out group-hover:scale-110"
        />
      )}
      {label && (
        <span
          className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 scale-95 whitespace-nowrap rounded-md bg-popover px-2.5 py-2 text-body leading-6 text-popover-foreground opacity-0 shadow-[0px_2px_2px_rgba(30,41,59,0.25)] transition duration-150 ease-out [font-family:var(--font-geist)] group-hover:scale-100 group-hover:opacity-100"
        >
          {label}
        </span>
      )}
    </button>
  );
}

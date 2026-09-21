import type { ButtonHTMLAttributes } from 'react';

// Ported from Figma (KL Art Map, "Cluster" component, node 309:3280) - the marker shown in
// place of many nearby individual `MapMarker`s when zoomed out on the map, labeled with how
// many places it's standing in for. Not yet wired into the actual Mapbox layer (same as
// `MapMarker`) - this is just the visual piece for now.
//
// Figma fixes a literal pixel width (24px) on the count text so a badge stays a clean circle
// at any of its four sizes rather than stretching into an oval around a wider/narrower
// digit - a real constraint worth keeping, just not at that literal value: this instead sets
// each size's *height* (`h-*`/`min-w-*`, from that size's own padding + Figma's constant
// 24px line-height) so 1-2 digit counts stay perfectly circular, while `rounded-full` still
// lets the badge grow into a pill rather than clip once a cluster needs a 3+ digit count -
// something Figma's own fixed-radius-per-size values (24px for small/default/large, 32px for
// x-large) would not have handled, since they only look circular paired with one specific
// demo count ("10") at each size.
export interface ClusterProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  count: number;
  size?: 'small' | 'default' | 'large' | 'x-large';
}

const SIZE_CLASSES = {
  small: 'h-8 min-w-8 px-1 text-body-medium',
  default: 'h-10 min-w-10 px-2 text-body-medium',
  large: 'h-12 min-w-12 px-3 text-p-ui-medium',
  'x-large': 'h-14 min-w-14 px-4 text-p-ui-medium',
};

export function Cluster({ count, size = 'small', className, ...props }: ClusterProps) {
  return (
    <button
      type="button"
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-brand-50 bg-primary text-center leading-6 text-primary-foreground shadow-[0px_2px_4px_rgba(0,0,0,0.25)] [font-family:var(--font-geist)] ${SIZE_CLASSES[size]} ${className ?? ''}`}
      {...props}
    >
      {count}
    </button>
  );
}

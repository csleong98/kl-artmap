// Ported from Figma (KL Art Map, "carousel / indicator" node 309:3718). A single dot, 6px,
// with `active` swapping the fill between the light "default" color (#F5F5F5) and the
// brand orange "active" one (`--primary`) - `default` has no matching semantic token since
// it's meant to sit on the white `CarouselIndicator` pill (or directly on a photo), not on
// page background, so it's the raw `neutral-100` primitive instead of `--muted`/`--border`.
export interface CarouselDotProps {
  active?: boolean;
  className?: string;
}

export function CarouselDot({ active = false, className }: CarouselDotProps) {
  return <span className={`size-1.5 shrink-0 rounded-full ${active ? 'bg-primary' : 'bg-neutral-100'} ${className ?? ''}`} />;
}

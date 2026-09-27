import { ArrowLeft, ShareNetwork } from '@phosphor-icons/react';
import { IconButton } from 'design-system';
import { MuralArtwork } from '@/components/MuralArtwork';

// Matches Figma's route detail header (node 373:24305/373:24306) - simpler than
// `LocationHeader`: just back/title/share, no info chips (those live in the "Route details"
// tab body instead, per that same Figma frame).
//
// `scrolled` (driven by the scroll container in `RouteDetail`) mirrors `LocationHeader`'s own
// sticky-compact behavior - smaller title, bottom border - just without a secondary line to
// collapse, since this header never had one.
//
// `MuralArtwork` lives *inside* this header (`absolute inset-0`), sized to exactly this
// header's own box rather than a taller page-level layer that would spill past it - see
// `LocationHeader`'s identical comment for why. Masking it on scroll needs its own
// `absolute inset-0` layer between the mural and the content (a `bg-background` on the header
// itself can't cover the mural - a parent's background always paints behind its own children).
// No `overflow-hidden` on the header itself either, for the same reason as `LocationHeader`:
// it isn't needed (a background-image is already confined to its own box) and it broke this
// header's flex auto-height for some content combinations - see that component's comment for
// the full story.
//
// `mobile` mirrors `LocationHeader`'s mobile variant (Figma node 430:8512): 16px padding and a
// 24px title that compacts to 20px on scroll.
export interface RouteHeaderProps {
  title: string;
  onBack: () => void;
  scrolled?: boolean;
  mobile?: boolean;
}

export function RouteHeader({ title, onBack, scrolled = false, mobile = false }: RouteHeaderProps) {
  const titleSize = mobile
    ? scrolled
      ? 'text-h4 leading-7'
      : 'text-h3 leading-8'
    : scrolled
      ? 'text-h3'
      : 'text-h2';

  return (
    <div
      className={`sticky top-0 z-20 flex items-center gap-3 transition-[padding,border-color] duration-200 ${
        mobile ? 'p-4' : 'p-6'
      } ${scrolled ? 'border-b border-border py-4' : `border-b border-transparent ${mobile ? '' : 'pb-0'}`}`}
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
        aria-label="Back to routes"
        radius="rounded"
        className="relative z-10"
        onClick={onBack}
      />
      <p
        className={`line-clamp-2 relative z-10 min-w-0 flex-1 text-center text-foreground transition-[font-size,line-height] duration-200 ${titleSize}`}
      >
        {title}
      </p>
      <IconButton icon={<ShareNetwork />} aria-label="Share" radius="rounded" className="relative z-10" />
    </div>
  );
}

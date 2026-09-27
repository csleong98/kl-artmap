import { ArrowLeft, ShareNetwork } from '@phosphor-icons/react';
import { IconButton } from 'design-system';

// Matches Figma's route detail header (node 373:24305/373:24306) - simpler than
// `LocationHeader`: just back/title/share, no info chips (those live in the "Route details"
// tab body instead, per that same Figma frame).
export interface RouteHeaderProps {
  title: string;
  onBack: () => void;
}

export function RouteHeader({ title, onBack }: RouteHeaderProps) {
  return (
    <div className="flex items-center gap-3 p-6 pb-0">
      <IconButton icon={<ArrowLeft />} aria-label="Back to routes" onClick={onBack} />
      <p className="min-w-0 flex-1 truncate text-center text-h2 text-foreground">{title}</p>
      <IconButton icon={<ShareNetwork />} aria-label="Share" />
    </div>
  );
}

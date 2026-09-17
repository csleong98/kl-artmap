import type { ReactElement, ReactNode } from 'react';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';

// Ported from Figma (KL Art Map, "Tooltip" node 309:2716), which only shows the static
// bubble - no trigger, delay, or positioning behavior. Built on Base UI's Tooltip primitive
// (Root/Trigger/Portal/Positioner/Popup) rather than hand-rolling the WAI-ARIA tooltip
// pattern (hover delay, focus, Escape-to-dismiss, anchor positioning) ourselves.
export interface TooltipProps {
  /** The trigger element - must be a single element (e.g. a `Button` or `IconButton`). */
  children: ReactElement;
  content: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ children, content, side = 'top', delay = 300 }: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} delay={delay} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={8}>
          <BaseTooltip.Popup className="rounded-md bg-popover px-[13px] py-[7px] text-sm leading-6 text-popover-foreground shadow-[0px_2px_2px_rgba(30,41,59,0.25)] [font-family:var(--font-geist)]">
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

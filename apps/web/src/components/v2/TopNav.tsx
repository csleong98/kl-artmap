'use client';

import Image from 'next/image';
import { Binoculars, Compass } from '@phosphor-icons/react';
import { Tabs } from 'design-system';

// Ported from Figma (KL Art Map, "top navigation bar", node 367:23656, part of the v2
// "Listing view + cluster" page). The four-symbol logo mark reuses the same static assets
// v1's `PanelHeader` already loads (`/symbols/symbol[-N].svg`) rather than re-fetching new
// (temporary, 7-day) Figma asset URLs for what's visually the same mark.
export type MapV2Mode = 'discover' | 'routes';

export interface TopNavProps {
  mode: MapV2Mode;
  onModeChange: (mode: MapV2Mode) => void;
}

export function TopNav({ mode, onModeChange }: TopNavProps) {
  return (
    <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-border bg-background px-3 md:h-[72px]">
      <div className="flex shrink-0 items-center gap-1">
        {/* `shrink-0` matters here specifically: Tailwind's `grid-cols-2` is
            `repeat(2, minmax(0, 1fr))` - the explicit `0` minimum (vs. a track's normal
            content-based minimum) makes this grid uniquely willing to collapse to nothing
            under flex-shrink pressure, unlike the Tabs pill's own text content next to it.
            Without this, the header shrinks the logo to 0x0 first - not because there's
            nowhere else to take the space from, just because this happened to be the one
            flex child with no natural resistance to shrinking. */}
        <div className="grid shrink-0 grid-cols-2 gap-0">
          <Image src="/symbols/symbol.svg" alt="" width={19} height={19} />
          <Image src="/symbols/symbol-1.svg" alt="" width={19} height={19} />
          <Image src="/symbols/symbol-2.svg" alt="" width={19} height={19} />
          <Image src="/symbols/symbol-3.svg" alt="" width={19} height={19} />
        </div>
        {/* Figma's mobile nav (node 431:9983) drops the wordmark - just the mark + tabs +
            avatar fit the narrower bar. */}
        <p className="hidden text-lg font-semibold uppercase tracking-tight text-foreground md:inline">
          KL Art Map
        </p>
      </div>

      <Tabs variant="rounded" value={mode} onValueChange={(value) => onModeChange(value as MapV2Mode)}>
        <Tabs.List>
          <Tabs.Tab value="discover" icon={<Compass />}>
            <span className="md:hidden">Galleries</span>
            <span className="hidden md:inline">Discover Places</span>
          </Tabs.Tab>
          <Tabs.Tab value="routes" icon={<Binoculars />}>
            <span className="md:hidden">Routes</span>
            <span className="hidden md:inline">Gallery Routes</span>
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <div className="size-10 shrink-0 rounded-full bg-gradient-to-br from-brand-300 to-brand-600" />
    </header>
  );
}

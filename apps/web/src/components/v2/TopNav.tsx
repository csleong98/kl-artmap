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
    <header className="flex h-[72px] w-full shrink-0 items-center justify-between border-b border-border bg-background px-3">
      <div className="flex items-center gap-1">
        <div className="grid grid-cols-2 gap-0">
          <Image src="/symbols/symbol.svg" alt="" width={19} height={19} />
          <Image src="/symbols/symbol-1.svg" alt="" width={19} height={19} />
          <Image src="/symbols/symbol-2.svg" alt="" width={19} height={19} />
          <Image src="/symbols/symbol-3.svg" alt="" width={19} height={19} />
        </div>
        <p className="text-lg font-semibold uppercase tracking-tight text-foreground">KL Art Map</p>
      </div>

      <Tabs variant="rounded" value={mode} onValueChange={(value) => onModeChange(value as MapV2Mode)}>
        <Tabs.List>
          <Tabs.Tab value="discover" icon={<Compass />}>
            Discover Places
          </Tabs.Tab>
          <Tabs.Tab value="routes" icon={<Binoculars />}>
            Gallery Routes
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <div className="size-10 shrink-0 rounded-full bg-gradient-to-br from-brand-300 to-brand-600" />
    </header>
  );
}

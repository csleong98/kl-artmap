'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

interface PanelHeaderProps {
  title: string;
  description: string;
}

export default function PanelHeader({
  title,
  description,
}: PanelHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-6">
      {/* Left Section */}
      <div className="flex flex-col gap-4">
        {/* Symbols Row */}
        <div className="flex items-center">
          <Image
            src="/symbols/symbol.svg"
            alt="Symbol"
            width={40}
            height={40}
            className="shrink-0"
          />
          <Image
            src="/symbols/symbol-1.svg"
            alt="Symbol"
            width={40}
            height={40}
            className="shrink-0"
          />
          <Image
            src="/symbols/symbol-2.svg"
            alt="Symbol"
            width={40}
            height={40}
            className="shrink-0"
          />
          <Image
            src="/symbols/symbol-3.svg"
            alt="Symbol"
            width={40}
            height={40}
            className="shrink-0"
          />
        </div>

        {/* Title + Description */}
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] font-bold leading-[1.15] text-ds-text-primary uppercase">
            {title}
          </h1>
          <p className="text-base leading-[1.4] text-ds-text-secondary">
            {description}
          </p>
        </div>
      </div>

      {/* Right Section - Button Group */}
      <div className="shrink-0">
        <ButtonGroup className="[&>*:first-child]:rounded-l-xl [&>*:last-child]:rounded-r-xl">
          <Button variant="outline" onClick={() => console.log('Share clicked')}>
            Share
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => console.log('Help clicked')}>
                <HelpCircle className="w-4 h-4" />
                Help
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Feedback clicked')}>
                <MessageCircle className="w-4 h-4" />
                Feedback
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, HelpCircle, MessageCircle, X } from 'lucide-react';
import { MuralArtwork } from '@/components/MuralArtwork';

interface PanelHeaderProps {
  title: string;
  description: string;
  variant?: 'main' | 'details';
  showSymbols?: boolean;
  showActions?: boolean;
  tags?: React.ReactNode;
  onShare?: () => void;
  onBack?: () => void;
}

export default function PanelHeader({
  title,
  description,
  variant = 'main',
  showSymbols = true,
  showActions = false,
  tags,
  onShare,
  onBack,
}: PanelHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      console.log('Share clicked');
    }
  };

  return (
    <div className="relative overflow-hidden -mx-6 -mt-6 -mb-6 px-6 pt-6 pb-6">
      {/* Mural Artwork Background */}
      <MuralArtwork
        className="absolute top-0 left-0 right-0 h-[400px] z-0"
        gradientStartColor="#EBDBC1"
        gradientEndColor="rgba(240, 228, 208, 0)"
      />

      {/* Content */}
      <div className="relative z-10 flex items-start justify-between gap-6">
        {/* Left Section */}
        <div className="flex flex-col gap-4">
        {/* Symbols Row - Only show if enabled */}
        {showSymbols && variant === 'main' && (
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
        )}

        {/* Title + Tags + Description */}
        <div className="flex flex-col gap-3">
          <h1 className={`text-ds-text-primary ${
            variant === 'main'
              ? 'text-[32px] uppercase font-bold leading-[1.15]'
              : 'text-[32px] font-medium leading-[1.05]'
          }`}>
            {title}
          </h1>

          <div className="flex flex-col gap-1">
            <p className={`text-base leading-[1.4] text-ds-text-secondary ${
              !isExpanded ? 'line-clamp-3' : ''
            }`}>
              {description}
            </p>
            {description && description.length > 150 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-blue-600 hover:text-blue-800 self-start font-medium"
              >
                {isExpanded ? 'View Less' : 'View More'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Different layouts for main vs details */}
      <div className="shrink-0">
        {variant === 'main' ? (
          // Main variant: Share + Dropdown (only shown if showActions is true)
          showActions && (
            <ButtonGroup className="[&>*:first-child]:rounded-l-full [&>*:last-child]:rounded-r-full">
              <Button variant="outline" onClick={handleShare}>
                Share site
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
          )
        ) : (
          // Details variant: Single circular close button (always shown)
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="rounded-full size-11 shadow-md bg-white"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>
      </div>
    </div>
  );
}

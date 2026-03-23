'use client';

import React from 'react';
import Image from 'next/image';

interface HeaderButton {
  icon: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
}

interface PanelHeaderProps {
  title: string;
  description: string;
  buttons?: HeaderButton[];
}

export default function PanelHeader({
  title,
  description,
  buttons = [],
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
          <h1 className="text-[32px] font-medium leading-[1.15] text-ds-text-primary uppercase">
            {title}
          </h1>
          <p className="text-base leading-[1.4] text-ds-text-secondary">
            {description}
          </p>
        </div>
      </div>

      {/* Right Section - Ghost Buttons */}
      {buttons.length > 0 && (
        <div className="flex items-center gap-2 shrink-0">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              aria-label={button.ariaLabel}
              className="p-2.5 text-ds-text-primary hover:text-ds-text-secondary transition-colors"
            >
              {button.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

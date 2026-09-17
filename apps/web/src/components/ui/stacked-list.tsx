'use client';

import React from 'react';
import Image from 'next/image';

interface MetadataItem {
  icon?: React.ReactNode;
  label: string;
}

interface BadgeItem {
  label: string;
  variant?: 'default' | 'secondary' | 'success' | 'warning';
}

interface StackedListProps {
  title: string;
  subtitle?: string;
  metadata?: MetadataItem[];
  badges?: BadgeItem[];
  thumbnail?: string;
  showThumbnail?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function StackedList({
  title,
  subtitle,
  metadata,
  badges,
  thumbnail,
  showThumbnail = true,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: StackedListProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  // Removed preload - Next.js Image handles this more efficiently
  return (
    <div
      className="
        flex items-stretch gap-4 p-6
        bg-white
        border border-[#ececec]
        rounded-3xl
        cursor-pointer
        transition-all duration-200
        hover:bg-gray-50
        active:bg-gray-100
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-offset-2
        focus-visible:ring-[#ececec]
      "
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Left Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Title + Subtitle Section */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-[#282828] leading-normal text-ellipsis mb-3">
            {title}
          </h2>
          {/* {subtitle && (
            <p className="text-base text-[#595959] line-clamp-1 overflow-hidden text-ellipsis">
              {subtitle}
            </p>
          )} */}
        </div>

        {/* Spacer that grows to fill available space */}
        {/* <div className="flex-1"></div> */}

        {/* Information Chips Section */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Metadata chips */}
          {metadata && metadata.length > 0 && metadata.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 py-1">
              {item.icon && <span className="shrink-0 w-3 h-3 text-ds-text-muted">{item.icon}</span>}
              <span className="text-small text-ds-text-muted leading-none">{item.label}</span>
            </div>
          ))}

          {/* Badge chips (if any) */}
          {badges && badges.length > 0 && badges.map((badge, index) => (
            <div key={index} className="flex items-center gap-1.5 py-1">
              <span className="text-small text-ds-text-muted leading-none">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Thumbnail */}
      {showThumbnail && thumbnail && (
        <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 relative">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
            loading="lazy"
            sizes="96px"
            quality={60}
            onError={() => setImageError(true)}
          />
        </div>
      )}
    </div>
  );
}

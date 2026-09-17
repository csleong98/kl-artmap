'use client';

import React from 'react';
import Image from 'next/image';

interface MetadataItem {
  icon?: React.ReactNode;
  label: string;
}

interface GridListProps {
  title: string;
  metadata?: MetadataItem[];
  thumbnail?: string;
  showThumbnail?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function GridList({
  title,
  metadata,
  thumbnail,
  showThumbnail = true,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: GridListProps) {
  return (
    <div
      className="
        flex flex-col gap-3 p-4
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
      {/* Thumbnail */}
      {showThumbnail && thumbnail && (
        <div className="aspect-square w-full rounded-lg overflow-hidden bg-ds-surface relative">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 768px) 50vw, 200px"
            quality={60}
          />
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-ds-text-primary leading-tight line-clamp-2">
        {title}
      </h3>

      {/* Metadata Row */}
      {metadata && metadata.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          {metadata.map((item, index) => (
            <div key={index} className="flex items-center gap-1 text-small text-ds-text-muted">
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

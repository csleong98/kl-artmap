'use client';

import React from 'react';
import { Badge } from './badge';

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

  // Preload image to check if it's valid
  React.useEffect(() => {
    if (!thumbnail) {
      setImageError(false);
      setImageLoaded(false);
      return;
    }

    setImageLoaded(false);
    setImageError(false);

    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setImageLoaded(false);
      setImageError(true);
    };
    img.src = thumbnail;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [thumbnail]);
  return (
    <div
      className="
        flex items-center gap-4 p-4
        bg-[var(--list-item-bg)]
        border border-[var(--list-item-border)]
        rounded-2xl
        cursor-pointer
        transition-all duration-200
        hover:bg-[var(--list-item-bg-hover)]
        active:bg-[var(--list-item-bg-active)]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-offset-2
        focus-visible:ring-[var(--list-item-border)]
        min-h-[120px]
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
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Title */}
        <h3 className="text-lg font-semibold text-ds-text-primary leading-tight line-clamp-2">
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-ds-text-secondary line-clamp-1">
            {subtitle}
          </p>
        )}

        {/* Metadata Row */}
        {metadata && metadata.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            {metadata.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs text-ds-text-muted">
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Badge Row */}
        {badges && badges.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {badges.map((badge, index) => (
              <Badge
                key={index}
                variant={badge.variant === 'success' ? 'default' : 'secondary'}
                className={`text-xs ${
                  badge.variant === 'success'
                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                    : badge.variant === 'warning'
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                    : ''
                }`}
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Right Thumbnail */}
      {showThumbnail && (
        <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-ds-surface">
          {imageLoaded && !imageError ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ds-text-muted text-xs">
              No image
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';

interface MuralArtworkProps {
  gradientStartColor?: string;
  gradientEndColor?: string;
  className?: string;
}

export const MuralArtwork: React.FC<MuralArtworkProps> = ({
  gradientStartColor = '#EBDBC1',
  gradientEndColor = 'rgba(240, 228, 208, 0)',
  className = ''
}) => {
  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{
        backgroundImage: 'url(/assets/header-bg-mural-artwork.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 60%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 60%)'
      }}
    />
  );
};

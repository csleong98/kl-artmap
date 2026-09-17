'use client';

interface ActivePinProps {
  imageUrl?: string;
  color?: string;
  name?: string;
}

/**
 * Creates an active pin marker element with inverted teardrop design
 * Similar to Apple Maps pin style
 */
export function createActivePinElement({
  imageUrl,
  color = '#E53E3E',
  name = ''
}: ActivePinProps): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'active-pin-wrapper';

  // Set inline styles for the wrapper
  el.style.cssText = `
    width: 60px;
    height: 80px;
    cursor: pointer;
    position: relative;
    animation: pinDropIn 0.3s ease-out;
  `;

  // Create the SVG teardrop shape with a pointer at the bottom
  const teardropPath = `
    M 30 10
    C 15 10, 5 20, 5 30
    C 5 40, 15 50, 30 55
    C 45 50, 55 40, 55 30
    C 55 20, 45 10, 30 10
    Z
    M 30 55
    L 27 70
    L 30 72
    L 33 70
    Z
  `;

  el.innerHTML = `
    <style>
      @keyframes pinDropIn {
        0% {
          transform: translateY(-20px) scale(0.8);
          opacity: 0;
        }
        60% {
          transform: translateY(2px) scale(1.05);
        }
        100% {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }

      @keyframes anchorPulse {
        0%, 100% {
          transform: scale(1);
          opacity: 0.8;
        }
        50% {
          transform: scale(1.2);
          opacity: 1;
        }
      }

      .active-pin-wrapper:hover .pin-badge {
        transform: scale(1.1);
      }

      .pin-badge {
        transition: transform 0.2s ease;
      }

      .anchor-dot {
        animation: anchorPulse 2s ease-in-out infinite;
      }
    </style>

    <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
      <defs>
        <clipPath id="pin-clip-${Date.now()}">
          <circle cx="30" cy="30" r="22" />
        </clipPath>
        <linearGradient id="pin-gradient-${Date.now()}" x1="30" y1="5" x2="30" y2="55">
          <stop offset="0%" stop-color="${color}" stop-opacity="1" />
          <stop offset="100%" stop-color="${adjustBrightness(color, -20)}" stop-opacity="1" />
        </linearGradient>
      </defs>

      <!-- Main teardrop shape with pointer -->
      <g class="pin-badge">
        <!-- Circle body -->
        <circle cx="30" cy="30" r="25" fill="url(#pin-gradient-${Date.now()})" stroke="white" stroke-width="2"/>

        <!-- Inner content circle for image/icon -->
        <circle cx="30" cy="30" r="22" fill="#fff" opacity="0.95"/>

        ${imageUrl
          ? `<image href="${imageUrl}" x="8" y="8" width="44" height="44" clip-path="url(#pin-clip-${Date.now()})" preserveAspectRatio="xMidYMid slice"/>`
          : `<circle cx="30" cy="30" r="8" fill="${color}"/>`
        }

        <!-- Pointer at bottom -->
        <path d="M 30 52 L 27 67 L 30 70 L 33 67 Z" fill="${color}" stroke="white" stroke-width="1.5"/>
      </g>

      <!-- Anchor dot at ground level -->
      <circle class="anchor-dot" cx="30" cy="75" r="3" fill="${color}" opacity="0.8"/>
    </svg>
  `;

  return el;
}

/**
 * Helper function to adjust color brightness
 */
function adjustBrightness(color: string, amount: number): string {
  // Simple hex color brightness adjustment
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

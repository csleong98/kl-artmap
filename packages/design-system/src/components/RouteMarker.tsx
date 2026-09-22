import type { ReactNode, SVGProps } from 'react';

// Ported from Figma (KL Art Map, "map-pin" component, node 411:4992) - the waypoint markers
// for a walking route/gallery route (start, end, and train-station stops along the way),
// distinct from `MapMarker`'s general "place on the map" pin.
//
// The pin frame is NOT Phosphor's `MapPin` - an earlier version of this component used that
// as a stand-in and it was visually wrong (Phosphor's is a sharp teardrop; Figma's own shape
// is a rounder, more organic balloon-with-a-small-tail silhouette). This inlines the exact
// path Figma exports for that frame instead, at its native aspect ratio (45.4995 x 53.4697),
// verified against the raw downloaded SVG rather than approximated. Figma's own generated
// code wraps this in a confusing container-query-based 90deg rotation (apparently to fit a
// portrait asset into a landscape flex slot); reproducing that literally renders the pin on
// its side (verified directly in a browser), so the frame is placed here in its natural
// upright orientation instead, sized/centered directly against the outer box.
//
// Figma only ever shows three fixed icon+color pairings (start/end/train), but both are
// opened up here as independent props: `icon` is any glyph the caller passes (Figma's own
// icons for the three original pairings are exported below for reuse), and `color` picks a
// hue from this design system's palette. Figma's own three instances actually use
// *inconsistent* shade levels per hue (green-700, red-800, amber-900 icons on green-300/
// red-300/amber-400 circles) - reproducing that inconsistency would make every new hue a
// guessing game, so this instead fixes one shade pair (300 for the circle, 700 for the icon)
// applied uniformly regardless of which hue is chosen.
export type RouteMarkerColor =
  | 'brand'
  | 'neutral'
  | 'red'
  | 'amber'
  | 'green'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose';

export interface RouteMarkerProps {
  icon: ReactNode;
  /** @default 'brand' */
  color?: RouteMarkerColor;
  className?: string;
}

const COLOR_CLASSES: Record<RouteMarkerColor, { circle: string; icon: string }> = {
  brand: { circle: 'bg-brand-300', icon: 'text-brand-700' },
  neutral: { circle: 'bg-neutral-300', icon: 'text-neutral-700' },
  red: { circle: 'bg-red-300', icon: 'text-red-700' },
  amber: { circle: 'bg-amber-300', icon: 'text-amber-700' },
  green: { circle: 'bg-green-300', icon: 'text-green-700' },
  blue: { circle: 'bg-blue-300', icon: 'text-blue-700' },
  indigo: { circle: 'bg-indigo-300', icon: 'text-indigo-700' },
  violet: { circle: 'bg-violet-300', icon: 'text-violet-700' },
  purple: { circle: 'bg-purple-300', icon: 'text-purple-700' },
  fuchsia: { circle: 'bg-fuchsia-300', icon: 'text-fuchsia-700' },
  pink: { circle: 'bg-pink-300', icon: 'text-pink-700' },
  rose: { circle: 'bg-rose-300', icon: 'text-rose-700' },
};

function PinFrame(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 45.4995 53.4697" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fill="currentColor" d="M22.7498 0C28.2712 0 33.6044 2.0078 37.7547 5.64941C41.9047 9.29091 44.5885 14.3177 45.3064 19.792C46.0241 25.2664 44.7271 30.8159 41.656 35.4043C38.7338 39.77 34.3949 42.9812 29.3855 44.5088L25.8748 51.5352C25.5841 52.1165 25.1366 52.6055 24.5838 52.9473C24.031 53.2889 23.3938 53.4697 22.7439 53.4697C22.0939 53.4697 21.456 53.289 20.9031 52.9473C20.3504 52.6056 19.9037 52.1164 19.6131 51.5352L19.6121 51.5332L16.1121 44.5078C11.1036 42.98 6.76528 39.7695 3.84352 35.4043C0.772468 30.816 -0.524569 25.2664 0.193128 19.792C0.911001 14.3178 3.59492 9.2909 7.74489 5.64941C11.8951 2.00783 17.2284 3.36409e-05 22.7498 0Z" />
    </svg>
  );
}

// The exact icons Figma's own three instances use, exported so callers can still reach for
// them (e.g. `<RouteMarker icon={<RouteMarkerStartIcon />} color="green" />`) instead of
// reaching for a lookalike Phosphor icon that might not line up pixel-for-pixel.
export function RouteMarkerStartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fill="currentColor" d="M9.625 7C9.62496 6.17218 9.85979 5.36133 10.3022 4.66165C10.7446 3.96196 11.3765 3.40216 12.1244 3.04726C12.8722 2.69235 13.7055 2.55692 14.5273 2.65669C15.3491 2.75646 16.1257 3.08733 16.7669 3.61088C17.4082 4.13442 17.8877 4.82915 18.1498 5.61437C18.412 6.39959 18.446 7.24307 18.2479 8.04684C18.0497 8.85061 17.6277 9.58167 17.0306 10.1551C16.4336 10.7286 15.6861 11.1208 14.875 11.2864V19.25C14.875 19.4821 14.7828 19.7046 14.6187 19.8687C14.4546 20.0328 14.2321 20.125 14 20.125C13.7679 20.125 13.5454 20.0328 13.3813 19.8687C13.2172 19.7046 13.125 19.4821 13.125 19.25V11.2864C12.1375 11.0838 11.25 10.5467 10.6124 9.76587C9.97483 8.985 9.62607 8.00811 9.625 7ZM23.8438 16.0333C22.5028 15.2742 20.6587 14.6913 18.5095 14.3467C18.3958 14.3288 18.2797 14.3334 18.1678 14.3603C18.0559 14.3872 17.9504 14.4359 17.8573 14.5036C17.7643 14.5713 17.6854 14.6567 17.6253 14.7548C17.5652 14.853 17.5251 14.962 17.5071 15.0757C17.4892 15.1894 17.4938 15.3055 17.5207 15.4174C17.5476 15.5293 17.5963 15.6348 17.664 15.7279C17.7317 15.821 17.817 15.8998 17.9152 15.9599C18.0134 16.02 18.1224 16.0602 18.2361 16.0781C20.1545 16.3866 21.8455 16.9127 22.9852 17.5602C23.9531 18.1016 24.5 18.7184 24.5 19.25C24.5 20.7113 20.5056 22.75 14 22.75C7.49438 22.75 3.5 20.7113 3.5 19.25C3.5 18.7184 4.04687 18.1016 5.01484 17.5558C6.15891 16.9083 7.84547 16.3822 9.76391 16.0738C9.88001 16.0586 9.99188 16.0203 10.0929 15.9611C10.1939 15.9019 10.282 15.823 10.352 15.7292C10.422 15.6353 10.4725 15.5283 10.5004 15.4146C10.5283 15.3009 10.5331 15.1828 10.5145 15.0672C10.4959 14.9516 10.4543 14.8409 10.3921 14.7416C10.33 14.6424 10.2485 14.5567 10.1526 14.4895C10.0567 14.4223 9.94832 14.375 9.83383 14.3505C9.71934 14.326 9.60109 14.3247 9.48609 14.3467C7.33688 14.6913 5.49281 15.2742 4.15187 16.0333C2.16672 17.1577 1.75 18.4034 1.75 19.25C1.75 22.6603 8.06203 24.5 14 24.5C19.938 24.5 26.25 22.6603 26.25 19.25C26.25 18.4034 25.8333 17.1577 23.8438 16.0333Z" />
    </svg>
  );
}

export function RouteMarkerEndIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fill="currentColor" d="M27.125 11.375C27.1251 11.5568 27.0686 11.734 26.9634 11.8822C26.8581 12.0304 26.7093 12.1421 26.5377 12.2019L7 18.9973V23.625C7 23.8571 6.90781 24.0796 6.74372 24.2437C6.57962 24.4078 6.35706 24.5 6.125 24.5C5.89294 24.5 5.67038 24.4078 5.50628 24.2437C5.34219 24.0796 5.25 23.8571 5.25 23.625V4.375C5.24992 4.23533 5.28327 4.09768 5.34727 3.97354C5.41127 3.8494 5.50406 3.74238 5.61788 3.66143C5.73169 3.58049 5.86324 3.52796 6.00151 3.50825C6.13977 3.48854 6.28075 3.50221 6.41266 3.54812L26.5377 10.5481C26.7093 10.6079 26.8581 10.7196 26.9634 10.8678C27.0686 11.016 27.1251 11.1932 27.125 11.375Z" />
    </svg>
  );
}

export function RouteMarkerTrainIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fill="currentColor" d="M20.125 2.625H7.875C6.94674 2.625 6.0565 2.99375 5.40013 3.65013C4.74375 4.3065 4.375 5.19674 4.375 6.125V20.125C4.375 21.0533 4.74375 21.9435 5.40013 22.5999C6.0565 23.2563 6.94674 23.625 7.875 23.625H8.75L7.175 25.725C7.10606 25.8169 7.05589 25.9215 7.02738 26.0328C6.99886 26.1442 6.99254 26.26 7.00879 26.3737C7.02504 26.4875 7.06354 26.5969 7.12208 26.6958C7.18063 26.7947 7.25807 26.8811 7.35 26.95C7.44192 27.0189 7.54653 27.0691 7.65784 27.0976C7.76915 27.1261 7.88499 27.1325 7.99874 27.1162C8.1125 27.1 8.22193 27.0615 8.32081 27.0029C8.41968 26.9444 8.50606 26.8669 8.575 26.775L10.9375 23.625H17.0625L19.425 26.775C19.5642 26.9607 19.7715 27.0834 20.0013 27.1162C20.231 27.149 20.4643 27.0892 20.65 26.95C20.8357 26.8108 20.9584 26.6035 20.9912 26.3737C21.024 26.144 20.9642 25.9107 20.825 25.725L19.25 23.625H20.125C21.0533 23.625 21.9435 23.2563 22.5999 22.5999C23.2563 21.9435 23.625 21.0533 23.625 20.125V6.125C23.625 5.19674 23.2563 4.3065 22.5999 3.65013C21.9435 2.99375 21.0533 2.625 20.125 2.625ZM7.875 4.375H20.125C20.5891 4.375 21.0342 4.55937 21.3624 4.88756C21.6906 5.21575 21.875 5.66087 21.875 6.125V13.125H6.125V6.125C6.125 5.66087 6.30937 5.21575 6.63756 4.88756C6.96575 4.55937 7.41087 4.375 7.875 4.375ZM20.125 21.875H7.875C7.41087 21.875 6.96575 21.6906 6.63756 21.3624C6.30937 21.0342 6.125 20.5891 6.125 20.125V14.875H21.875V20.125C21.875 20.5891 21.6906 21.0342 21.3624 21.3624C21.0342 21.6906 20.5891 21.875 20.125 21.875ZM10.5 18.8125C10.5 19.0721 10.423 19.3258 10.2788 19.5417C10.1346 19.7575 9.9296 19.9258 9.68977 20.0251C9.44994 20.1244 9.18604 20.1504 8.93144 20.0998C8.67684 20.0491 8.44298 19.9241 8.25942 19.7406C8.07587 19.557 7.95086 19.3232 7.90022 19.0686C7.84958 18.814 7.87557 18.5501 7.97491 18.3102C8.07425 18.0704 8.24247 17.8654 8.45831 17.7212C8.67415 17.577 8.92791 17.5 9.1875 17.5C9.5356 17.5 9.86944 17.6383 10.1156 17.8844C10.3617 18.1306 10.5 18.4644 10.5 18.8125ZM20.125 18.8125C20.125 19.0721 20.048 19.3258 19.9038 19.5417C19.7596 19.7575 19.5546 19.9258 19.3148 20.0251C19.0749 20.1244 18.811 20.1504 18.5564 20.0998C18.3018 20.0491 18.068 19.9241 17.8844 19.7406C17.7009 19.557 17.5759 19.3232 17.5252 19.0686C17.4746 18.814 17.5006 18.5501 17.5999 18.3102C17.6992 18.0704 17.8675 17.8654 18.0833 17.7212C18.2992 17.577 18.5529 17.5 18.8125 17.5C19.1606 17.5 19.4944 17.6383 19.7406 17.8844C19.9867 18.1306 20.125 18.4644 20.125 18.8125Z" />
    </svg>
  );
}

export function RouteMarker({ icon, color = 'brand', className }: RouteMarkerProps) {
  const { circle, icon: iconColor } = COLOR_CLASSES[color];

  return (
    <div className={`relative inline-flex size-14 items-center justify-center ${className ?? ''}`}>
      <PinFrame className="h-[53.47px] w-[45.5px] text-white drop-shadow-[0px_4.667px_3.5px_rgba(0,0,0,0.2)]" />
      <span
        className={`absolute left-1/2 top-[42.4%] size-[42.5px] -translate-x-1/2 -translate-y-1/2 rounded-full ${circle}`}
      >
        <span className={`absolute inset-0 flex items-center justify-center ${iconColor}`}>
          <span className="size-[29.65px] [&_svg]:size-full">{icon}</span>
        </span>
      </span>
    </div>
  );
}

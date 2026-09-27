import type { GalleryRoute } from '@/types';

// Mock gallery routes for v2's "Gallery Routes" mode (Figma node 373:23701 onward). The
// Figma mock's own map tooltips for "The Chinatown Route" (Kwai Chai Hong, The Zhongshan
// Building, UR-MU The Toffee, Sultan Abdul Samad Building) are real locations already in
// `locations.json` and genuinely walkable together (all within ~1.3km of each other) - so
// that route below uses those exact four rather than inventing new ones. Figma's tooltip
// also throws in "Ilham Gallery", but that's 2.5-3.3km from the rest of the cluster (checked
// via `distanceKm`), too far to be the same walking route, so it's left out here.
//
// Expect this file to be replaced with real curated content - `stopNames` order, `story`,
// and `description` are all reasonable-but-invented placeholders, not final copy.
export const GALLERY_ROUTES: GalleryRoute[] = [
  {
    id: 'chinatown-route',
    name: 'The Chinatown Route',
    description: 'Restored heritage lanes and colonial landmarks in the heart of old Kuala Lumpur.',
    story:
      "This pocket of old Chinatown packs restored shophouse alleys and colonial-era civic buildings into a walk of well under a kilometer. Start at Kwai Chai Hong, once a neglected back lane and now a free open-air gallery of 1960s-Chinatown murals, then continue past The Zhongshan Building and UR-MU The Toffee - both adaptive reuse projects turning older shoplots into gallery and event space - before finishing at the Sultan Abdul Samad Building, the Moorish-revival landmark that anchors Merdeka Square.",
    stopNames: ['Kwai Chai Hong', 'The Zhongshan Building', 'UR-MU The Toffee', 'Sultan Abdul Samad Building'],
    lastUpdated: '13 Sep 2026',
  },
  {
    id: 'merdeka-heritage-route',
    name: 'Merdeka Heritage Route',
    description: 'National museums and galleries clustered around the old administrative quarter.',
    story:
      "A short loop through the museums built up around KL's colonial-era civic core. The Islamic Arts Museum and National Textile Museum sit a few minutes apart near the Lake Gardens, with the Telekom Museum and Bank Negara's own museum and gallery a little further north - together covering everything from woven textile traditions to the country's telecommunications and monetary history.",
    stopNames: [
      'Islamic Arts Museum Malaysia',
      'National Textile Museum',
      'Telekom Museum',
      'Bank Negara Malaysia Museum & Art Gallery',
    ],
    lastUpdated: '13 Sep 2026',
  },
];

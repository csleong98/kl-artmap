export interface HistoryMilestone {
  title: string;
  description: string;
}

// Only Kwai Chai Hong has curated history content for now - every milestone here is drawn
// directly from its existing `details.overview.description` (see locations.json), not
// invented. Other locations simply won't render a "Timeline" section (see HistoryTab).
export const LOCATION_HISTORY: Record<string, HistoryMilestone[]> = {
  'Kwai Chai Hong': [
    {
      title: 'Known as Theatre Lane',
      description:
        "Before its restoration, this back alley in Kuala Lumpur's Chinatown was known as Theatre Lane and associated with vice.",
    },
    {
      title: '2019 restoration',
      description:
        "The alley (鬼仔巷, 'Little Demon/Ghost Alley') was restored in 2019, transforming it into a free open-air gallery.",
    },
    {
      title: 'Murals of 1960s Chinatown',
      description: 'The restored walls now depict everyday life in 1960s Chinatown through a series of murals.',
    },
    {
      title: 'Interactive touches',
      description:
        'Beyond decoration, the space includes interactive details - seating built into a barber-shop mural, and QR codes linking to period soundtracks.',
    },
  ],
};

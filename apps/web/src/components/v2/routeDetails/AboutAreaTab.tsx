import { Section } from '@/components/v2/details/Section';
import type { GalleryRoute } from '@/types';

// Matches Figma's "About this area" tab (node 373:24533/373:24584) - just one "The story"
// section using the route's own `story` field.
export function AboutAreaTab({ route }: { route: GalleryRoute }) {
  return (
    <Section title="The story">
      <p className="text-p-ui text-foreground">{route.story}</p>
    </Section>
  );
}

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImageCarousel } from './ImageCarousel';

const meta: Meta<typeof ImageCarousel> = {
  title: 'Components/ImageCarousel',
  component: ImageCarousel,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ padding: 40 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof ImageCarousel>;

const images = [
  { src: 'https://picsum.photos/seed/kl-artmap-1/424/482', alt: 'Colorful lantern display over a walkway' },
  { src: 'https://picsum.photos/seed/kl-artmap-2/424/482', alt: 'Street art mural' },
  { src: 'https://picsum.photos/seed/kl-artmap-3/424/482', alt: 'Heritage shophouses' },
  { src: 'https://picsum.photos/seed/kl-artmap-4/424/482', alt: 'Night market stalls' },
  { src: 'https://picsum.photos/seed/kl-artmap-5/424/482', alt: 'Temple courtyard' },
];

export const Playground: Story = {
  args: { images },
};

// Mixed portrait/landscape sources, to confirm the peek amount stays the same on both
// sides regardless of each photo's own dimensions (every photo is cropped into the same
// fixed box via `object-cover`, so source size was never actually the variable at play).
export const MixedAspectRatios: Story = {
  name: 'Mixed portrait/landscape sources',
  args: {
    images: [
      { src: 'https://picsum.photos/seed/kl-artmap-portrait/300/700', alt: 'Portrait photo' },
      { src: 'https://picsum.photos/seed/kl-artmap-landscape/900/400', alt: 'Landscape photo' },
      { src: 'https://picsum.photos/seed/kl-artmap-square/600/600', alt: 'Square photo' },
    ],
  },
};

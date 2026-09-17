import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CarouselIndicator } from './CarouselIndicator';

const meta: Meta<typeof CarouselIndicator> = {
  title: 'Components/CarouselIndicator',
  component: CarouselIndicator,
  tags: ['autodocs'],
  args: { total: 5, current: 0 },
};

export default meta;
type Story = StoryObj<typeof CarouselIndicator>;

// Matches the Figma composition exactly: 5 dots, static, first one active.
export const Playground: Story = {};

export const Interactive: Story = {
  render: (args) => {
    const [current, setCurrent] = useState(args.current);
    return <CarouselIndicator {...args} current={current} onDotClick={setCurrent} />;
  },
};

// The pill is meant to float over a photo, not sit on plain page background - this is why
// its default dot color is a near-white `neutral-100` rather than a page-background token.
export const OverAPhoto: Story = {
  name: 'Over a photo',
  render: (args) => {
    const [current, setCurrent] = useState(0);
    return (
      <div
        style={{
          position: 'relative',
          width: 360,
          height: 220,
          borderRadius: 12,
          overflow: 'hidden',
          backgroundImage: 'url(https://picsum.photos/seed/kl-artmap-carousel/720/440)',
          backgroundSize: 'cover',
        }}
      >
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)' }}>
          <CarouselIndicator {...args} current={current} onDotClick={setCurrent} />
        </div>
      </div>
    );
  },
};

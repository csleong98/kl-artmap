import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bicycle, ForkKnife, Coffee } from '@phosphor-icons/react';
import { RouteMarker, RouteMarkerEndIcon, RouteMarkerStartIcon, RouteMarkerTrainIcon } from './RouteMarker';

const meta: Meta<typeof RouteMarker> = {
  title: 'Components/RouteMarker',
  component: RouteMarker,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ background: '#1a1a1a', padding: 24, display: 'inline-flex', gap: 16, borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RouteMarker>;

// The three pairings Figma itself shows, reproduced with the exact icons it exports.
export const Start: Story = {
  args: { icon: <RouteMarkerStartIcon />, color: 'green' },
};

export const End: Story = {
  args: { icon: <RouteMarkerEndIcon />, color: 'red' },
};

export const Train: Story = {
  args: { icon: <RouteMarkerTrainIcon />, color: 'amber' },
};

export const AllTypes: Story = {
  name: 'All types',
  render: () => (
    <>
      <RouteMarker icon={<RouteMarkerStartIcon />} color="green" />
      <RouteMarker icon={<RouteMarkerTrainIcon />} color="amber" />
      <RouteMarker icon={<RouteMarkerEndIcon />} color="red" />
    </>
  ),
};

// Icon and color are both freely interchangeable - any Phosphor icon works, and every hue
// uses the same shade pairing (300 circle / 700 icon), not a per-color one-off.
export const InterchangeableIconsAndColors: Story = {
  name: 'Interchangeable icons/colors',
  render: () => (
    <>
      <RouteMarker icon={<Coffee />} color="brand" />
      <RouteMarker icon={<ForkKnife />} color="blue" />
      <RouteMarker icon={<Bicycle />} color="purple" />
    </>
  ),
};

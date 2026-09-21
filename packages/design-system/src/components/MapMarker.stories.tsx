import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapMarker } from './MapMarker';

const meta: Meta<typeof MapMarker> = {
  title: 'Components/MapMarker',
  component: MapMarker,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ background: '#e5e3df', padding: 48, display: 'inline-block', borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MapMarker>;

export const Pin: Story = {
  args: { type: 'pin' },
};

export const PinWithLabel: Story = {
  name: 'Pin (hover for tooltip)',
  args: { type: 'pin', label: 'Add to library' },
};

export const Photo: Story = {
  args: {
    type: 'photo',
    photo: { src: 'https://picsum.photos/seed/kl-artmap-marker/228/228', alt: 'Sultan Abdul Samad Building' },
  },
};

export const PhotoWithLabel: Story = {
  name: 'Photo (hover for tooltip)',
  args: {
    type: 'photo',
    photo: { src: 'https://picsum.photos/seed/kl-artmap-marker/228/228', alt: 'Sultan Abdul Samad Building' },
    label: 'Sultan Abdul Samad Building',
  },
};

export const OnAMap: Story = {
  name: 'A few markers together',
  decorators: [
    (Story) => (
      <div
        style={{
          background: '#e5e3df',
          padding: 64,
          display: 'flex',
          gap: 48,
          alignItems: 'flex-end',
          borderRadius: 8,
        }}
      >
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <MapMarker type="pin" label="Add to library" />
      <MapMarker type="pin" />
      <MapMarker
        type="photo"
        photo={{ src: 'https://picsum.photos/seed/kl-artmap-marker-1/228/228', alt: 'Sultan Abdul Samad Building' }}
        label="Sultan Abdul Samad Building"
      />
      <MapMarker
        type="photo"
        photo={{ src: 'https://picsum.photos/seed/kl-artmap-marker-2/228/228', alt: 'Central Market' }}
        label="Central Market"
      />
    </>
  ),
};

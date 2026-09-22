import type { Meta, StoryObj } from '@storybook/react-vite';
import { RouteCard } from './RouteCard';

const meta: Meta<typeof RouteCard> = {
  title: 'Components/RouteCard',
  component: RouteCard,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof RouteCard>;

const chips = [
  { label: 'Places', value: '6' },
  { label: 'Distance', value: '1.5 km' },
  { label: 'Est. travel time', value: '40 mins', tooltip: 'Estimated at an average walking pace between stops.' },
];

export const Default: Story = {
  args: {
    title: 'Bukit Bintang Gallery Route',
    description: 'Description about this route',
    previewImage: { src: 'https://picsum.photos/seed/kl-artmap-route-1/800/760', alt: 'Bukit Bintang Gallery Route map preview' },
    chips,
  },
};

export const Clickable: Story = {
  args: { ...Default.args, onClick: () => {} },
};

export const NoPreviewImage: Story = {
  name: 'No preview image (empty state)',
  args: { ...Default.args, previewImage: undefined },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapPinSimpleArea } from '@phosphor-icons/react';
import { TimelineItem } from './TimelineItem';
import { Button } from './Button';

const meta: Meta<typeof TimelineItem> = {
  title: 'Components/TimelineItem',
  component: TimelineItem,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 327 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof TimelineItem>;

export const Compact: Story = {
  args: {
    layout: 'compact',
    title: '10m',
    description: 'Starting point',
    icon: <MapPinSimpleArea weight="regular" />,
  },
};

export const CompactWithThumbnail: Story = {
  name: 'Compact, with thumbnail',
  args: {
    ...Compact.args,
    thumbnail: 'https://picsum.photos/seed/kl-artmap/96',
  },
};

export const Detailed: Story = {
  args: {
    title: 'Kwai Chai Hong',
    description: 'Kwai Chai Hong officially opens to the public as a restored heritage and cultural attraction.',
    icon: <MapPinSimpleArea />,
    action: (
      <Button variant="outline" size="xs">
        View details
      </Button>
    ),
  },
};

export const IconMarkerActive: Story = {
  name: 'Icon marker, active',
  args: {
    ...Detailed.args,
    active: true,
  },
};

export const IconMarkerInactive: Story = {
  name: 'Icon marker, inactive',
  args: {
    ...Detailed.args,
    active: false,
  },
};

export const DotMarkerActive: Story = {
  name: 'Dot marker, active',
  args: {
    title: 'REXKL',
    description: 'Featured in Chinese New Year celebrations with a flying dragon display.',
    active: true,
    action: (
      <Button variant="outline" size="xs">
        View details
      </Button>
    ),
  },
};

export const DotMarkerInactive: Story = {
  name: 'Dot marker, inactive',
  args: {
    ...DotMarkerActive.args,
    active: false,
  },
};

export const NoDescription: Story = {
  args: {
    layout: 'compact',
    title: 'Exit A',
  },
};

export const Expandable: Story = {
  args: {
    title: 'Mid-20th century (exact period not established)',
    description:
      "The lane falls into neglect over the decades, becoming associated with vice — accounts describe it as a haunt for prostitution and other 'undesirable' activity, the likely source of the name 'Little Demon/Ghost Alley'.",
    active: false,
    expandable: true,
  },
};

export const ExpandableExpandedByDefault: Story = {
  name: 'Expandable, expanded by default',
  args: {
    ...Expandable.args,
    defaultExpanded: true,
  },
};

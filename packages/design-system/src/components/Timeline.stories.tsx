import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapPinSimpleArea, ClockCounterClockwise } from '@phosphor-icons/react';
import { Timeline } from './Timeline';
import { Button } from './Button';

const meta: Meta<typeof Timeline> = {
  title: 'Components/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 431 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

const viewDetails = (
  <Button variant="outline" size="xs">
    View details
  </Button>
);

// Reproduces the Figma "route" example (node 373:24336): a mix of icon-marker bookends
// (opening event, historical origin) and plain dot-marker waypoints in between, no image
// thumbnails (matching `showImageThumbnail`'s default of off), and a mix of footer types -
// "View details" is an inert `action`, while "Read more"/"Read less" are real `expandable`
// toggles (Figma's later-added "text-only btn" variant) that clamp/unclamp their own
// description, not two static buttons standing in for each other.
export const TheRoute: Story = {
  render: () => (
    <Timeline>
      <Timeline.Item
        title="Kwai Chai Hong"
        description="Kwai Chai Hong officially opens to the public as a restored heritage and cultural attraction."
        icon={<MapPinSimpleArea weight="regular" />}
        action={viewDetails}
      />
      <Timeline.Item
        title="REXKL"
        description="Featured in Chinese New Year celebrations with a flying dragon display, reported by Malay Mail — evidence it was already an established fixture in KL's festival calendar less than a year after opening."
        active={false}
        action={viewDetails}
      />
      <Timeline.Item
        title="+n by UR-MU"
        description="Kwai Chai Hong officially opens to the public as a restored heritage and cultural attraction."
        active={false}
        action={viewDetails}
      />
      <Timeline.Item
        title="Sin Sze Si Ya Temple Pioneers of Kuala Lumpur"
        description="Restoration begins under Bai Chuan Management Sdn Bhd (five local partners); ~RM1.5 million invested overall, ~RM120,000 of it on the street art murals depicting 1960s Chinatown life."
        active={false}
        expandable
        expandLabel="Read more"
        collapseLabel="Read less"
      />
      <Timeline.Item
        title="Mid-20th century (exact period not established)"
        description="The lane falls into neglect over the decades, becoming associated with vice — accounts describe it as a haunt for prostitution and other 'undesirable' activity, the likely source of the name 'Little Demon/Ghost Alley'."
        active={false}
        expandable
        defaultExpanded
        expandLabel="Read more"
        collapseLabel="Read less"
      />
      <Timeline.Item
        title="Early 1900s (exact year not established)"
        description="The alley — then called Theatre Lane — is part of old Chinatown; a surviving lamppost dates to 1903, when Kuala Lumpur first received electricity, and nearby shophouses date to as early as 1893."
        icon={<ClockCounterClockwise weight="regular" />}
        expandable
        expandLabel="Read more"
        collapseLabel="Read less"
      />
    </Timeline>
  ),
};

export const WithThumbnails: Story = {
  name: 'With image thumbnails (opt-in)',
  render: () => (
    <Timeline>
      <Timeline.Item
        title="Kwai Chai Hong"
        description="Kwai Chai Hong officially opens to the public as a restored heritage and cultural attraction."
        icon={<MapPinSimpleArea weight="regular" />}
        thumbnail="https://picsum.photos/seed/kwai-chai-hong/96"
        action={viewDetails}
      />
      <Timeline.Item
        title="REXKL"
        description="Featured in Chinese New Year celebrations with a flying dragon display."
        active={false}
        thumbnail="https://picsum.photos/seed/rexkl/96"
        action={viewDetails}
      />
    </Timeline>
  ),
};

export const WalkingDirections: Story = {
  name: 'Compact items (walking directions)',
  render: () => (
    <Timeline>
      <Timeline.Item layout="compact" title="0m" description="Starting point" icon={<MapPinSimpleArea weight="regular" />} />
      <Timeline.Item layout="compact" title="120m" description="Turn left onto Jalan Petaling" />
      <Timeline.Item layout="compact" title="450m" description="Arrive at Kwai Chai Hong" icon={<MapPinSimpleArea weight="regular" />} />
    </Timeline>
  ),
};

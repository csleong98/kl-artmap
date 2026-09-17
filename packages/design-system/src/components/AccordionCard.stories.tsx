import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footprints, Path, PaperPlaneTilt } from '@phosphor-icons/react';
import { AccordionCard } from './AccordionCard';
import { Badge } from './Badge';
import { Button } from './Button';

const meta: Meta<typeof AccordionCard> = {
  title: 'Components/AccordionCard',
  component: AccordionCard,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 531 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof AccordionCard>;

const stationChips = [
  { icon: <Footprints weight="regular" />, label: '12 mins walk from station (Exit A)' },
  { icon: <Path weight="regular" />, label: '1.5 km' },
  { icon: <Path weight="regular" />, label: '1.5 km' },
];

export const Playground: Story = {
  args: {
    title: 'Muzium Negara Station',
    badge: <Badge>MRT Kajang line</Badge>,
    chips: stationChips,
  },
};

export const Expanded: Story = {
  args: {
    ...Playground.args,
    defaultOpen: true,
    children: (
      <div className="flex w-full flex-col gap-3">
        <div className="flex h-64 w-full items-center justify-center rounded-lg bg-secondary text-sm text-muted-foreground">
          Gallery image placeholder
        </div>
        <p className="w-full text-base leading-6 text-foreground [font-family:var(--font-geist)]">
          This station is an interchange station with LRT Kelana Jaya Line and MRT Putrajaya Line.
        </p>
        <Button variant="secondary" leadingIcon={<PaperPlaneTilt weight="regular" />} className="w-fit">
          View walking trail in maps
        </Button>
      </div>
    ),
  },
};

export const CustomExpandedContent: Story = {
  name: 'Expanded - other than the example',
  args: {
    title: 'Petronas Twin Towers',
    badge: <Badge color="info">LRT Kelana Jaya line</Badge>,
    chips: [{ icon: <Footprints weight="regular" />, label: '8 mins walk from station' }],
    defaultOpen: true,
    children: (
      <ul className="flex w-full flex-col gap-2 text-sm text-foreground [font-family:var(--font-geist)]">
        <li>Opening hours: 9:00 AM - 9:00 PM (closed Mondays)</li>
        <li>Ticket required for observation deck access</li>
        <li>Wheelchair accessible via Suria KLCC entrance</li>
      </ul>
    ),
  },
};

export const NoBadgeSingleChip: Story = {
  name: 'No badge, one chip, no icon',
  args: {
    title: 'Independent Landmark',
    chips: [{ label: '20 mins walk from nearest station' }],
  },
};

export const NoChips: Story = {
  name: 'No chips',
  args: {
    title: 'Minimal Card',
    badge: <Badge color="secondary">Bus only</Badge>,
  },
};

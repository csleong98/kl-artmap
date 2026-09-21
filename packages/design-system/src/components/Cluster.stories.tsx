import type { Meta, StoryObj } from '@storybook/react-vite';
import { Cluster } from './Cluster';

const meta: Meta<typeof Cluster> = {
  title: 'Components/Cluster',
  component: Cluster,
  tags: ['autodocs'],
  args: { count: 10 },
  decorators: [
    (Story) => (
      <div style={{ background: '#e5e3df', padding: 32, borderRadius: 8, display: 'inline-block' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Cluster>;

export const Small: Story = {
  args: { size: 'small' },
};

export const Default: Story = {
  args: { size: 'default' },
};

export const Large: Story = {
  args: { size: 'large' },
};

export const XLarge: Story = {
  name: 'X-large',
  args: { size: 'x-large' },
};

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <Cluster size="small" count={10} />
      <Cluster size="default" count={10} />
      <Cluster size="large" count={10} />
      <Cluster size="x-large" count={10} />
    </div>
  ),
};

export const DigitCounts: Story = {
  name: 'Single vs. double vs. triple digits',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <Cluster size="default" count={4} />
      <Cluster size="default" count={42} />
      <Cluster size="default" count={128} />
    </div>
  ),
};

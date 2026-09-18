import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabItem } from './TabItem';

const meta: Meta<typeof TabItem> = {
  title: 'Components/TabItem',
  component: TabItem,
  tags: ['autodocs'],
  args: { children: 'Tab text' },
};

export default meta;
type Story = StoryObj<typeof TabItem>;

export const PillDefault: Story = {
  name: 'Pill / default',
  args: { variant: 'pills', active: false },
};

export const PillActive: Story = {
  name: 'Pill / active',
  args: { variant: 'pills', active: true },
};

export const RoundedDefault: Story = {
  name: 'Rounded / default',
  args: { variant: 'rounded', active: false },
};

export const RoundedActive: Story = {
  name: 'Rounded / active',
  args: { variant: 'rounded', active: true },
};

export const LineDefault: Story = {
  name: 'Line / default',
  args: { variant: 'line', active: false },
};

export const LineActive: Story = {
  name: 'Line / active',
  args: { variant: 'line', active: true },
};

export const PillRow: Story = {
  name: 'Pill row (atom only)',
  render: () => (
    <div className="inline-flex w-fit items-center gap-1 rounded-lg bg-secondary p-1">
      <TabItem variant="pills" active>
        Tab text
      </TabItem>
      <TabItem variant="pills">Tab text</TabItem>
      <TabItem variant="pills">Tab text</TabItem>
      <TabItem variant="pills">Tab text</TabItem>
    </div>
  ),
};

export const RoundedRow: Story = {
  name: 'Rounded row (atom only)',
  render: () => (
    <div className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary p-1">
      <TabItem variant="rounded" active>
        Tab text
      </TabItem>
      <TabItem variant="rounded">Tab text</TabItem>
      <TabItem variant="rounded">Tab text</TabItem>
      <TabItem variant="rounded">Tab text</TabItem>
    </div>
  ),
};

export const LineRow: Story = {
  name: 'Line row (atom only)',
  render: () => (
    <div className="inline-flex items-center gap-6">
      <TabItem variant="line" active>
        Tab text
      </TabItem>
      <TabItem variant="line">Tab text</TabItem>
      <TabItem variant="line">Tab text</TabItem>
      <TabItem variant="line">Tab text</TabItem>
    </div>
  ),
};

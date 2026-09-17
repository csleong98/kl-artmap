import type { Meta, StoryObj } from '@storybook/react-vite';
import { Question } from '@phosphor-icons/react';
import { MenuItem, MenuSectionTitle } from './MenuItem';

const meta: Meta<typeof MenuItem> = {
  title: 'Components/MenuItem',
  component: MenuItem,
  tags: ['autodocs'],
  args: {
    label: 'Menu Item',
    icon: <Question weight="regular" />,
    shortcut: '⌘⇧B',
    trailingIcon: true,
  },
};

export default meta;
type Story = StoryObj<typeof MenuItem>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 236 }}>
      <MenuItem {...args} />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', width: 236, border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
      <MenuItem label="Menu Item" icon={<Question weight="regular" />} shortcut="⌘⇧B" trailingIcon />
      <MenuItem label="Menu Item (hover me)" icon={<Question weight="regular" />} shortcut="⌘⇧B" trailingIcon />
      <MenuSectionTitle>Section Title</MenuSectionTitle>
      <MenuItem label="Disabled item" icon={<Question weight="regular" />} shortcut="⌘⇧B" trailingIcon disabled />
    </div>
  ),
};

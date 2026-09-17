import type { Meta, StoryObj } from '@storybook/react-vite';
import { DotsThreeVertical, Question, Gear, SignOut } from '@phosphor-icons/react';
import { Menu } from './Menu';
import { IconButton } from './IconButton';

const meta: Meta<typeof Menu> = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Menu>;

export const Playground: Story = {
  render: () => (
    <div style={{ padding: 80 }}>
      <Menu trigger={<IconButton icon={<DotsThreeVertical weight="bold" />} aria-label="More options" />}>
        <Menu.Item label="Menu Item" icon={<Question weight="regular" />} shortcut="⌘⇧B" />
        <Menu.Item label="Menu Item" icon={<Question weight="regular" />} shortcut="⌘⇧B" />
        <Menu.Group label="Section Title">
          <Menu.Item label="Settings" icon={<Gear weight="regular" />} />
          <Menu.Item label="Log out" icon={<SignOut weight="regular" />} />
        </Menu.Group>
        <Menu.Item label="Disabled item" icon={<Question weight="regular" />} shortcut="⌘⇧B" disabled />
      </Menu>
    </div>
  ),
};

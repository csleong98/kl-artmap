import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';
import { Button } from './Button';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    side: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
  },
  args: {
    content: 'Add to library',
    side: 'top',
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ padding: 80 }}>
      <Tooltip {...args}>
        <Button variant="outline">Hover me</Button>
      </Tooltip>
    </div>
  ),
};

export const Sides: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48, padding: 80 }}>
      {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
        <Tooltip key={side} content="Add to library" side={side}>
          <Button variant="outline">{side}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './Alert';
import { Button } from './Button';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['accent', 'default', 'destructive'] },
  },
  args: {
    variant: 'accent',
    title: 'Alert title',
    description: 'This is a long description',
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 381 }}>
      <Alert {...args} action={<Button size="xs">Button</Button>} />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 381, padding: 24 }}>
      <Alert
        variant="accent"
        title="Alert title"
        description="This is a long description"
        action={<Button size="xs">Button</Button>}
      />
      <Alert
        variant="default"
        title="Alert title"
        description="This is a long description"
        action={
          <Button size="xs" variant="outline">
            Button
          </Button>
        }
      />
      <Alert
        variant="destructive"
        title="Alert title"
        description="This is a long description"
        action={
          <Button size="xs" variant="destructive">
            Button
          </Button>
        }
      />
      <Alert variant="default" title="No icon, no action" icon={false} />
    </div>
  ),
};

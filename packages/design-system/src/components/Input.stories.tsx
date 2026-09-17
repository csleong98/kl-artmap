import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['default', 'small'] },
    radius: { control: 'select', options: ['squared', 'rounded'] },
    labelPosition: { control: 'select', options: ['top', 'left'] },
  },
  args: {
    label: 'Email',
    placeholder: 'Email',
    helperText: 'Enter your email address',
    size: 'default',
    radius: 'squared',
    labelPosition: 'top',
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 384 }}>
      <Input {...args} />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 384, padding: 24 }}>
      <Input label="Email" placeholder="Email" helperText="Enter your email address" />
      <Input label="Email" defaultValue="pietro.schirano@gmail.com" helperText="Enter your email address" />
      <Input label="Email" placeholder="Email" helperText="Enter your email address" disabled />
      <Input label="Email" placeholder="Email" helperText="Enter your email address" radius="rounded" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 384, padding: 24 }}>
      <Input size="default" label="Email" placeholder="Email" helperText="Enter your email address" />
      <Input size="small" label="Email" placeholder="Email" helperText="Enter your email address" />
    </div>
  ),
};

export const LabelToTheLeft: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 480, padding: 24 }}>
      <Input labelPosition="left" label="Width" placeholder="Add value" />
      <Input labelPosition="left" label="Width" defaultValue="100%" />
      <Input labelPosition="left" label="Width" placeholder="Add value" disabled />
    </div>
  ),
};

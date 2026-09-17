import type { Meta, StoryObj } from '@storybook/react-vite';
import { Question } from '@phosphor-icons/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive', 'success', 'warning', 'info'],
    },
    variant: { control: 'select', options: ['default', 'accented', 'outline'] },
  },
  args: {
    children: 'MRT Kajang line',
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

const colors = ['primary', 'secondary', 'destructive', 'success', 'warning', 'info'] as const;
const variants = ['default', 'accented', 'outline'] as const;

export const Matrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {variants.map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {colors.map((color) => (
            <Badge key={color} color={color} variant={variant}>
              MRT Kajang line
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {variants.map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {colors.map((color) => (
            <Badge key={color} color={color} variant={variant} icon={<Question weight="regular" />}>
              MRT Kajang line
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

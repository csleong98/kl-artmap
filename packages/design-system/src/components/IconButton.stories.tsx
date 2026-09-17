import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from '@phosphor-icons/react';
import { IconButton } from './IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['outline', 'ghost'] },
    size: { control: 'select', options: ['default', 'sm'] },
    radius: { control: 'select', options: ['squared', 'rounded'] },
  },
  args: {
    variant: 'outline',
    size: 'sm',
    radius: 'squared',
    'aria-label': 'Add',
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Playground: Story = {
  render: (args) => <IconButton {...args} icon={<Plus weight="regular" />} />,
};

export const AllVariants: Story = {
  render: () => {
    const variants = ['outline', 'ghost'] as const;
    const sizes = ['default', 'sm'] as const;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
        {(['squared', 'rounded'] as const).map((radius) => (
          <div key={radius} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontFamily: 'sans-serif', fontSize: 13, color: 'var(--muted-foreground)' }}>
              radius: {radius}
            </h3>
            {sizes.map((size) => (
              <div key={size} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {variants.map((variant) => (
                  <IconButton
                    key={variant}
                    variant={variant}
                    size={size}
                    radius={radius}
                    icon={<Plus weight="regular" />}
                    aria-label="Add"
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

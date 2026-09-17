import type { Meta, StoryObj } from '@storybook/react-vite';
import { EnvelopeSimple, CaretDown } from '@phosphor-icons/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'link', 'destructive'],
    },
    size: { control: 'select', options: ['default', 'sm', 'xs', 'icon'] },
    radius: { control: 'select', options: ['squared', 'rounded'] },
  },
  args: {
    children: 'Login with Email',
    variant: 'primary',
    size: 'default',
    radius: 'squared',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {
  render: (args) => (
    <Button {...args} leadingIcon={<EnvelopeSimple weight="regular" />} trailingIcon={<CaretDown weight="regular" />} />
  ),
};

export const AllVariants: Story = {
  render: () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'link', 'destructive'] as const;
    const sizes = ['default', 'sm', 'xs'] as const;

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
                  <Button
                    key={variant}
                    variant={variant}
                    size={size}
                    radius={radius}
                    leadingIcon={<EnvelopeSimple weight="regular" />}
                    trailingIcon={variant !== 'link' ? <CaretDown weight="regular" /> : undefined}
                  >
                    {variant === 'primary' || variant === 'destructive' ? 'Login with Email' : variant === 'secondary' ? 'Subtle' : variant === 'ghost' ? 'Ghost' : variant === 'link' ? 'Link' : 'Cancel'}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

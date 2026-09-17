import type { Meta, StoryObj } from '@storybook/react-vite';
import { EnvelopeSimple } from '@phosphor-icons/react';
import { ButtonGroup } from './ButtonGroup';
import { Button } from './Button';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    radius: { control: 'select', options: ['squared', 'rounded'] },
  },
  args: {
    orientation: 'horizontal',
    radius: 'squared',
  },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Playground: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline" size="sm">Cancel</Button>
      <Button variant="outline" size="sm">Cancel</Button>
      <Button variant="outline" size="sm">Cancel</Button>
      <Button variant="outline" size="sm">Cancel</Button>
      <Button variant="outline" size="sm">Cancel</Button>
    </ButtonGroup>
  ),
};

export const IconOnly: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Button key={i} variant="outline" size="icon" leadingIcon={<EnvelopeSimple weight="regular" />}>
          <span className="sr-only">Send</span>
        </Button>
      ))}
    </ButtonGroup>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: 24 }}>
      {(['squared', 'rounded'] as const).map((radius) => (
        <div key={radius} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontFamily: 'sans-serif', fontSize: 13, color: 'var(--muted-foreground)' }}>
            radius: {radius}
          </h3>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <ButtonGroup orientation="horizontal" radius={radius}>
              <Button variant="outline" size="sm">Cancel</Button>
              <Button variant="outline" size="sm">Cancel</Button>
              <Button variant="outline" size="sm">Cancel</Button>
              <Button variant="outline" size="sm">Cancel</Button>
              <Button variant="outline" size="icon" leadingIcon={<EnvelopeSimple weight="regular" />}>
                <span className="sr-only">Send</span>
              </Button>
            </ButtonGroup>
            <ButtonGroup orientation="vertical" radius={radius}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Button key={i} variant="outline" size="icon" leadingIcon={<EnvelopeSimple weight="regular" />}>
                  <span className="sr-only">Send</span>
                </Button>
              ))}
            </ButtonGroup>
          </div>
        </div>
      ))}
    </div>
  ),
};

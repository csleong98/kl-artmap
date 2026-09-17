import type { Meta, StoryObj } from '@storybook/react-vite';
import { CarouselDot } from './CarouselDot';

const meta: Meta<typeof CarouselDot> = {
  title: 'Components/CarouselDot',
  component: CarouselDot,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ padding: 24 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof CarouselDot>;

export const Default: Story = {
  args: { active: false },
};

export const Active: Story = {
  args: { active: true },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchInput } from './SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Components/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 384 }}>
      <SearchInput {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  render: () => (
    <div style={{ width: 384 }}>
      <SearchInput defaultValue="pietro.schirano@gmail.com" />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ width: 384 }}>
      <SearchInput />
    </div>
  ),
};

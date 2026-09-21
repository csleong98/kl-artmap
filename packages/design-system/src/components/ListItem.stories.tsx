import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Buildings, Ruler } from '@phosphor-icons/react';
import { ListItem } from './ListItem';

const meta: Meta<typeof ListItem> = {
  title: 'Components/ListItem',
  component: ListItem,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 433 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof ListItem>;

const chips = [
  { icon: <Buildings />, label: '6 places' },
  { icon: <Ruler />, label: '1.5 km of walking distance' },
];

const singlePhoto = [{ src: 'https://picsum.photos/seed/kl-artmap-list-1/264/264', alt: 'National Art Gallery' }];

const multiPhotos = [
  { src: 'https://picsum.photos/seed/kl-artmap-list-1/264/264', alt: 'National Art Gallery' },
  { src: 'https://picsum.photos/seed/kl-artmap-list-2/264/264', alt: 'Gallery hallway' },
  { src: 'https://picsum.photos/seed/kl-artmap-list-3/264/264', alt: 'Gallery courtyard' },
];

export const SinglePhoto: Story = {
  args: { title: 'National Art Gallery', photos: singlePhoto, chips },
};

export const MultiPhoto: Story = {
  name: 'Multi photo (stacked)',
  args: { title: 'National Art Gallery', photos: multiPhotos, chips },
};

export const Active: Story = {
  args: { title: 'National Art Gallery', photos: multiPhotos, chips, active: true },
};

export const Clickable: Story = {
  render: (args) => {
    const [active, setActive] = useState(false);
    return <ListItem {...args} active={active} onClick={() => setActive((value) => !value)} />;
  },
  args: { title: 'National Art Gallery', photos: multiPhotos, chips },
};

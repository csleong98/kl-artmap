import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Pills: Story = {
  render: () => (
    <Tabs variant="pills" defaultValue="one">
      <Tabs.List>
        <Tabs.Tab value="one">Tab text</Tabs.Tab>
        <Tabs.Tab value="two">Tab text</Tabs.Tab>
        <Tabs.Tab value="three">Tab text</Tabs.Tab>
        <Tabs.Tab value="four">Tab text</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="one" className="pt-4 text-sm text-foreground">
        Content for tab one.
      </Tabs.Panel>
      <Tabs.Panel value="two" className="pt-4 text-sm text-foreground">
        Content for tab two.
      </Tabs.Panel>
      <Tabs.Panel value="three" className="pt-4 text-sm text-foreground">
        Content for tab three.
      </Tabs.Panel>
      <Tabs.Panel value="four" className="pt-4 text-sm text-foreground">
        Content for tab four.
      </Tabs.Panel>
    </Tabs>
  ),
};

export const Rounded: Story = {
  render: () => (
    <Tabs variant="rounded" defaultValue="one">
      <Tabs.List>
        <Tabs.Tab value="one">Tab text</Tabs.Tab>
        <Tabs.Tab value="two">Tab text</Tabs.Tab>
        <Tabs.Tab value="three">Tab text</Tabs.Tab>
        <Tabs.Tab value="four">Tab text</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="one" className="pt-4 text-sm text-foreground">
        Content for tab one.
      </Tabs.Panel>
      <Tabs.Panel value="two" className="pt-4 text-sm text-foreground">
        Content for tab two.
      </Tabs.Panel>
      <Tabs.Panel value="three" className="pt-4 text-sm text-foreground">
        Content for tab three.
      </Tabs.Panel>
      <Tabs.Panel value="four" className="pt-4 text-sm text-foreground">
        Content for tab four.
      </Tabs.Panel>
    </Tabs>
  ),
};

export const Line: Story = {
  render: () => (
    <Tabs variant="line" defaultValue="one">
      <Tabs.List>
        <Tabs.Tab value="one">Tab text</Tabs.Tab>
        <Tabs.Tab value="two">Tab text</Tabs.Tab>
        <Tabs.Tab value="three">Tab text</Tabs.Tab>
        <Tabs.Tab value="four">Tab text</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="one" className="pt-4 text-sm text-foreground">
        Content for tab one.
      </Tabs.Panel>
      <Tabs.Panel value="two" className="pt-4 text-sm text-foreground">
        Content for tab two.
      </Tabs.Panel>
      <Tabs.Panel value="three" className="pt-4 text-sm text-foreground">
        Content for tab three.
      </Tabs.Panel>
      <Tabs.Panel value="four" className="pt-4 text-sm text-foreground">
        Content for tab four.
      </Tabs.Panel>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  name: 'With a disabled tab',
  render: () => (
    <Tabs variant="pills" defaultValue="one">
      <Tabs.List>
        <Tabs.Tab value="one">Tab text</Tabs.Tab>
        <Tabs.Tab value="two" disabled>
          Disabled
        </Tabs.Tab>
        <Tabs.Tab value="three">Tab text</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="one" className="pt-4 text-sm text-foreground">
        Content for tab one.
      </Tabs.Panel>
      <Tabs.Panel value="three" className="pt-4 text-sm text-foreground">
        Content for tab three.
      </Tabs.Panel>
    </Tabs>
  ),
};

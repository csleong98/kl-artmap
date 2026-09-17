import type { Meta, StoryObj } from '@storybook/react-vite';

const STYLE_NAMES = [
  'h1', 'h2', 'h3', 'h4', 'large', 'lead', 'p', 'p-ui', 'p-ui-medium', 'list',
  'body', 'body-medium', 'subtle', 'subtle-medium', 'subtle-semibold', 'small',
  'detail', 'blockquote',
];

function TypographyScale() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      {STYLE_NAMES.map((name) => (
        <div key={name} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <code style={{ width: 140, flexShrink: 0, fontSize: 11, color: 'var(--muted-foreground)' }}>
            .text-{name}
          </code>
          <div className={`text-${name}`}>The quick brown fox jumps over the lazy dog</div>
        </div>
      ))}
    </div>
  );
}

const meta: Meta<typeof TypographyScale> = {
  title: 'Foundations/Typography',
  component: TypographyScale,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TypographyScale>;

export const AllStyles: Story = {};

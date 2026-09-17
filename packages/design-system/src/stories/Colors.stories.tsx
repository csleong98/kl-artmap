import type { Meta, StoryObj } from '@storybook/react-vite';

const SEMANTIC_SWATCHES: Array<[string, string]> = [
  ['background', 'foreground'],
  ['card', 'card-foreground'],
  ['popover', 'popover-foreground'],
  ['primary', 'primary-foreground'],
  ['secondary', 'secondary-foreground'],
  ['accent', 'accent-foreground'],
  ['muted', 'muted-foreground'],
  ['destructive', 'destructive-foreground'],
  ['warning', 'warning-foreground'],
  ['success', 'success-foreground'],
  ['info', 'info-foreground'],
];

const FLAT_SWATCHES = ['border', 'input', 'ring', 'link', 'separator'];

const PRIMITIVE_FAMILIES = [
  'brand', 'neutral', 'red', 'amber', 'green', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
];
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

function SemanticSwatch({ bg, fg }: { bg: string; fg: string }) {
  return (
    <div
      style={{
        background: `var(--${bg})`,
        color: `var(--${fg})`,
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        fontFamily: 'sans-serif',
        fontSize: '13px',
      }}
    >
      <div style={{ fontWeight: 600 }}>{bg}</div>
      <div style={{ opacity: 0.8 }}>{fg}</div>
    </div>
  );
}

function FlatSwatch({ name }: { name: string }) {
  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: '13px' }}>
      <div
        style={{
          background: `var(--${name})`,
          height: 48,
          borderRadius: '8px',
          border: '1px solid var(--border)',
        }}
      />
      <div style={{ marginTop: 4 }}>{name}</div>
    </div>
  );
}

function PrimitiveRow({ family }: { family: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'sans-serif', fontSize: '11px' }}>
      <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{family}</div>
      <div style={{ display: 'flex', gap: 4 }}>
        {SHADES.map((shade) => (
          <div key={shade} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 6,
                background: `var(--color-${family}-${shade})`,
                border: '1px solid var(--border)',
              }}
            />
            <div>{shade}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorTokens() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: 24 }}>
      <section>
        <h2 style={{ fontFamily: 'sans-serif' }}>Semantic tokens</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {SEMANTIC_SWATCHES.map(([bg, fg]) => (
            <SemanticSwatch key={bg} bg={bg} fg={fg} />
          ))}
        </div>
      </section>
      <section>
        <h2 style={{ fontFamily: 'sans-serif' }}>Flat tokens</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {FLAT_SWATCHES.map((name) => (
            <FlatSwatch key={name} name={name} />
          ))}
        </div>
      </section>
      <section>
        <h2 style={{ fontFamily: 'sans-serif' }}>Primitives</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PRIMITIVE_FAMILIES.map((family) => (
            <PrimitiveRow key={family} family={family} />
          ))}
        </div>
      </section>
    </div>
  );
}

const meta: Meta<typeof ColorTokens> = {
  title: 'Foundations/Colors',
  component: ColorTokens,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ColorTokens>;

export const AllTokens: Story = {};

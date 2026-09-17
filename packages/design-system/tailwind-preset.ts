import type { Config } from 'tailwindcss';

// Shared Tailwind theme for the design system and any app that consumes it.
// Colors point at CSS custom properties defined in src/styles/tokens.generated.css,
// so both this package's Storybook and a consuming app's globals.css must load that
// stylesheet (or re-declare the same variables) for these classes to resolve to real colors.
const preset: Omit<Config, 'content'> = {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
          800: 'var(--color-brand-800)',
          900: 'var(--color-brand-900)',
        },
        neutral: {
          50: 'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
          white: 'var(--color-neutral-white)',
        },
        red: {
          50: 'var(--color-red-50)', 100: 'var(--color-red-100)', 200: 'var(--color-red-200)',
          300: 'var(--color-red-300)', 400: 'var(--color-red-400)', 500: 'var(--color-red-500)',
          600: 'var(--color-red-600)', 700: 'var(--color-red-700)', 800: 'var(--color-red-800)',
          900: 'var(--color-red-900)',
        },
        amber: {
          50: 'var(--color-amber-50)', 100: 'var(--color-amber-100)', 200: 'var(--color-amber-200)',
          300: 'var(--color-amber-300)', 400: 'var(--color-amber-400)', 500: 'var(--color-amber-500)',
          600: 'var(--color-amber-600)', 700: 'var(--color-amber-700)', 800: 'var(--color-amber-800)',
          900: 'var(--color-amber-900)',
        },
        green: {
          50: 'var(--color-green-50)', 100: 'var(--color-green-100)', 200: 'var(--color-green-200)',
          300: 'var(--color-green-300)', 400: 'var(--color-green-400)', 500: 'var(--color-green-500)',
          600: 'var(--color-green-600)', 700: 'var(--color-green-700)', 800: 'var(--color-green-800)',
          900: 'var(--color-green-900)',
        },
        blue: {
          50: 'var(--color-blue-50)', 100: 'var(--color-blue-100)', 200: 'var(--color-blue-200)',
          300: 'var(--color-blue-300)', 400: 'var(--color-blue-400)', 500: 'var(--color-blue-500)',
          600: 'var(--color-blue-600)', 700: 'var(--color-blue-700)', 800: 'var(--color-blue-800)',
          900: 'var(--color-blue-900)',
        },
        indigo: {
          50: 'var(--color-indigo-50)', 100: 'var(--color-indigo-100)', 200: 'var(--color-indigo-200)',
          300: 'var(--color-indigo-300)', 400: 'var(--color-indigo-400)', 500: 'var(--color-indigo-500)',
          600: 'var(--color-indigo-600)', 700: 'var(--color-indigo-700)', 800: 'var(--color-indigo-800)',
          900: 'var(--color-indigo-900)',
        },
        violet: {
          50: 'var(--color-violet-50)', 100: 'var(--color-violet-100)', 200: 'var(--color-violet-200)',
          300: 'var(--color-violet-300)', 400: 'var(--color-violet-400)', 500: 'var(--color-violet-500)',
          600: 'var(--color-violet-600)', 700: 'var(--color-violet-700)', 800: 'var(--color-violet-800)',
          900: 'var(--color-violet-900)',
        },
        purple: {
          50: 'var(--color-purple-50)', 100: 'var(--color-purple-100)', 200: 'var(--color-purple-200)',
          300: 'var(--color-purple-300)', 400: 'var(--color-purple-400)', 500: 'var(--color-purple-500)',
          600: 'var(--color-purple-600)', 700: 'var(--color-purple-700)', 800: 'var(--color-purple-800)',
          900: 'var(--color-purple-900)',
        },
        fuchsia: {
          50: 'var(--color-fuchsia-50)', 100: 'var(--color-fuchsia-100)', 200: 'var(--color-fuchsia-200)',
          300: 'var(--color-fuchsia-300)', 400: 'var(--color-fuchsia-400)', 500: 'var(--color-fuchsia-500)',
          600: 'var(--color-fuchsia-600)', 700: 'var(--color-fuchsia-700)', 800: 'var(--color-fuchsia-800)',
          900: 'var(--color-fuchsia-900)',
        },
        pink: {
          50: 'var(--color-pink-50)', 100: 'var(--color-pink-100)', 200: 'var(--color-pink-200)',
          300: 'var(--color-pink-300)', 400: 'var(--color-pink-400)', 500: 'var(--color-pink-500)',
          600: 'var(--color-pink-600)', 700: 'var(--color-pink-700)', 800: 'var(--color-pink-800)',
          900: 'var(--color-pink-900)',
        },
        rose: {
          50: 'var(--color-rose-50)', 100: 'var(--color-rose-100)', 200: 'var(--color-rose-200)',
          300: 'var(--color-rose-300)', 400: 'var(--color-rose-400)', 500: 'var(--color-rose-500)',
          600: 'var(--color-rose-600)', 700: 'var(--color-rose-700)', 800: 'var(--color-rose-800)',
          900: 'var(--color-rose-900)',
        },

        // Semantic tokens - these are what components should actually use.
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        link: 'var(--link)',
        separator: 'var(--separator)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          foreground: 'var(--warning-foreground)',
        },
        success: {
          DEFAULT: 'var(--success)',
          foreground: 'var(--success-foreground)',
        },
        info: {
          DEFAULT: 'var(--info)',
          foreground: 'var(--info-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default preset;

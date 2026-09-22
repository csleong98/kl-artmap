import type { Config } from "tailwindcss";
import designSystemPreset from "design-system/tailwind-preset";

const config: Config = {
    darkMode: ["class"],
    presets: [designSystemPreset],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/design-system/src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['var(--font-geist-sans)', 'sans-serif'],
  		},
  		colors: {
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			ds: {
  				text: {
  					primary: 'var(--ds-text-primary)',
  					secondary: 'var(--ds-text-secondary)',
  					muted: 'var(--ds-text-muted)',
  				},
  				border: {
  					DEFAULT: 'var(--ds-border)',
  					light: 'var(--ds-border-light)',
  				},
  				surface: 'var(--ds-surface)',
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			input: 'var(--ds-radius-input)',
  		},
  		spacing: {
  			'grid-margin': 'var(--ds-grid-margin)',
  			'grid-gutter': 'var(--ds-grid-gutter)',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

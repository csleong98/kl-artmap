# KL Art Map - Claude Development Notes

## Project Overview
A Next.js 14 application for discovering street art in Kuala Lumpur, featuring an interactive map powered by Mapbox GL JS.

This is an **npm workspaces monorepo**:
- `apps/web` - the Next.js app (everything below under "Key Files" / "Project Structure" is relative to this directory, not the repo root)
- `packages/design-system` - Storybook-based design system (Base UI + Tailwind), built independently and ported into `apps/web` component by component. See `packages/design-system/README` context below under "Design System".

Root-level `npm run dev` / `npm run build` / `npm run storybook` proxy into the relevant workspace (see root `package.json`).

## Communication Style with the user
- **ALWAYS** suggest the way first and confirm with the user before acting on the decision
- **NEVER** execute any action without user's consent
- **Teach** the user and **Explain** concepts and execution because it is always about learning instead of handholding

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Mapping**: Mapbox GL JS (v3.18.1)
- **Package Manager**: npm

## Development Guidelines
- **ALWAYS use shadcn/ui components** instead of creating custom components
- **Install missing shadcn components** with `npx shadcn@latest add [component]` when needed
- **Available shadcn components**: Dialog, Sheet, Tabs, Button, Card, Badge, and more
- **Component imports**: Import from `./[component]` (e.g., `import { Button } from './button'`)

## Key Files
- `apps/web/src/app/page.tsx` - Main page with fullscreen map and floating panel
- `apps/web/src/components/ui/map.tsx` - Mapbox GL JS map component with geolocation
- `apps/web/.env.local` - Contains Mapbox access token
- `apps/web/next.config.mjs` - Next.js configuration

## Development Commands
```bash
# Start development server
npm run dev

# Build production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Variables
```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

## Project Structure
```
apps/web/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx          # Main fullscreen map page
│   ├── components/
│   │   └── ui/
│   │       └── map.tsx       # Mapbox GL JS component
│   ├── services/
│   │   └── mapService.ts     # Map markers and location services
│   └── types/
│       └── index.ts          # TypeScript interfaces
└── package.json

packages/design-system/
├── .storybook/
├── tokens/light/{primitives,tokens}.json   # Raw Figma variable export (light mode only so far)
├── scripts/build-tokens.mjs                # Generates src/styles/tokens.generated.css from tokens/
├── src/
│   ├── styles/{globals.css,tokens.generated.css}
│   └── stories/                            # Storybook stories, including Foundations/Colors
├── tailwind-preset.ts                      # Shared Tailwind theme; apps/web will consume via `presets`
└── package.json
```

## Map Configuration
- **Center**: Kuala Lumpur coordinates (101.6869, 3.1390)
- **Zoom**: 11
- **Style**: `mapbox://styles/mapbox/streets-v12`
- **Features**:
  - Navigation controls (zoom, compass)
  - Geolocation control (tracks user position)
  - Coordinate display popup (click to copy coordinates)
  - Dynamic loading for SSR compatibility

## UI Layout
- **Fullscreen map**: Takes entire viewport
- **Floating panel**: Left sidebar with app info and features
- **Responsive**: Panel adjusts on different screen sizes

## Design System (packages/design-system)
- Built on **Base UI** (not Radix) - shadcn/ui defaulted to Base UI in July 2026; since this design system is shadcn-based too, it's built on Base UI from the start rather than migrating later.
- Colors are generated, not hand-written: `tokens/light/primitives.json` (raw color scale, e.g. `neutral/200`) and `tokens/light/tokens.json` (semantic aliases, e.g. `Border` -> `neutral/200`) are Figma variable exports (W3C DTCG-ish format). Run `npm run build:tokens` (in this workspace) to regenerate `src/styles/tokens.generated.css` after re-exporting from Figma.
- Only light mode exists so far. When dark mode tokens are ready, drop them at `tokens/dark/{primitives,tokens}.json` and re-run `build:tokens` - the script already emits a `.dark { ... }` block once that directory exists.
- Typography works the same way: `tokens/typography.json` (a flat Figma text-styles export) -> `npm run build:typography` -> `src/styles/typography.generated.css`, producing one class per named style (`.text-h1`, `.text-blockquote`, etc.). Fonts (Geist Sans, Inter) are self-hosted via `@fontsource/*` packages loaded in `.storybook/preview.tsx`, independent of `apps/web`'s own `next/font` setup - that's expected, Storybook doesn't go through Next's bundler. Note: the source export has no `lineHeight` field, so generated classes don't set one (falls back to browser default).
- CSS variables store plain hex (not the old HSL-triplet shadcn trick) - Tailwind 3.4+ supports opacity modifiers (`bg-primary/50`) on any CSS variable automatically now, so the workaround isn't needed.
- `tailwind-preset.ts` is the shared theme. `apps/web`'s own `tailwind.config.ts` should eventually add `presets: [designSystemPreset]` once components start getting ported over, rather than duplicating color definitions.
- **Pitfall to avoid**: don't set an explicit `turbopack.root` in `apps/web/next.config.mjs` pointing at the monorepo root. With npm workspaces hoisting `node_modules` to the repo root, this makes Turbopack's file watcher cover the entire hoisted `node_modules` tree, which triggered a runaway spawn of `postcss.js` worker processes (1000+) during setup. Next infers the correct workspace root on its own from the root `package.json`'s `workspaces` field - no override needed.

## Known Issues & Solutions
- **Mapbox GL JS SSR Issues**: Resolved with dynamic imports and `ssr: false`
- **Dependency Conflicts**: Fixed with clean reinstall of node_modules
- **CSS Loading**: Mapbox GL CSS loaded dynamically in component

## Development Notes
- Map component uses dynamic loading to prevent SSR issues
- Mapbox access token is required for map tiles
- Geolocation control provides real-time user position tracking
- Coordinate popup allows easy copying of lat/lng values
- Clean dependency reinstall resolved initial compilation issues

## Claude Development Behavior
- **SUGGEST FIRST, IMPLEMENT SECOND**: Always propose solutions and get approval before implementing code changes
- **NO IMMEDIATE IMPLEMENTATION**: Do not directly edit files without first discussing the approach
- **EXPLAIN OPTIONS**: Present multiple solution options with pros/cons before proceeding
- **WAIT FOR APPROVAL**: Get explicit user confirmation before making code changes
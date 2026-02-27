# KL Art Map - Claude Development Notes

## Project Overview
A Next.js 14 application for discovering street art in Kuala Lumpur, featuring an interactive map powered by Mapbox GL JS.

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
- `src/app/page.tsx` - Main page with fullscreen map and floating panel
- `src/components/ui/map.tsx` - Mapbox GL JS map component with geolocation
- `.env.local` - Contains Mapbox access token
- `next.config.mjs` - Next.js configuration

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
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx          # Main fullscreen map page
├── components/
│   └── ui/
│       └── map.tsx       # Mapbox GL JS component
├── services/
│   └── mapService.ts     # Map markers and location services
└── types/
    └── index.ts          # TypeScript interfaces
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
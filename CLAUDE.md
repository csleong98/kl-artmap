# KL Art Map - Claude Development Notes

## Project Overview
A Next.js 14 application for discovering street art in Kuala Lumpur, featuring an interactive map powered by MapLibre GL JS and Maptiler tiles.

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Mapping**: MapLibre GL JS + Maptiler API
- **Package Manager**: npm

## Key Files
- `src/app/page.tsx` - Main page with fullscreen map and floating panel
- `src/components/ui/map.tsx` - MapLibre GL JS map component
- `.env.local` - Contains Maptiler API key
- `next.config.mjs` - Next.js configuration with MapLibre transpilation

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
NEXT_PUBLIC_MAPTILER_API_KEY=your_maptiler_api_key_here
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
│       └── map.tsx       # MapLibre GL JS component
└── types/
    └── index.ts          # TypeScript interfaces
```

## Map Configuration
- **Center**: Kuala Lumpur coordinates (101.6869, 3.1390)
- **Zoom**: 11
- **Style**: Maptiler Streets v2
- **Features**: Navigation controls, dynamic loading for SSR compatibility

## UI Layout
- **Fullscreen map**: Takes entire viewport
- **Floating panel**: Left sidebar with app info and features
- **Responsive**: Panel adjusts on different screen sizes

## Known Issues & Solutions
- **MapLibre SSR Issues**: Resolved with dynamic imports and `ssr: false`
- **Dependency Conflicts**: Fixed with clean reinstall of node_modules
- **Build Errors**: Transpiling maplibre-gl in next.config.mjs

## Development Notes
- Map component uses dynamic loading to prevent SSR issues
- Maptiler API key is required for map tiles
- Clean dependency reinstall resolved initial compilation issues
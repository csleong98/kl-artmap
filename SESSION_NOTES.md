# KL Art Map - Development Session Notes
*Date: March 11, 2026*

## Session Overview
Complete rebuild of map pin graphics and animation system to match Apple Maps aesthetic with custom enhancements.

---

## 🎯 Major Accomplishments

### 1. Pin Graphics System Rebuild
**Objective:** Replace default pins with custom 3D realistic pins inspired by Apple Maps

#### Default State (Circular Pin)
- **Design:** 3D sphere effect with radial gradients
- **Size:** 50x54px
- **Features:**
  - Multi-layer shadows for depth
  - Shine/highlight effect (top-left)
  - Inner shadow for realism
  - Small anchor dot at bottom
  - Hover animation (scale 1.15x)

#### Active State (Teardrop Pin)
- **Design:** Inverted teardrop with pointer
- **Size:** 60x85px
- **Features:**
  - Larger 3D badge circle
  - Extended pointer to ground
  - Enhanced shadows and gradients
  - Icon/image display area
  - Prominent anchor dot

### 2. Animation & Interaction System
**Approach:** Option C - Combination of lightweight layers and HTML markers

#### Default State
- Mapbox native symbol layers for performance
- Simple circles with icons
- Minimal resource usage

#### Active State
- HTML custom markers for rich visuals
- Swaps SVG content (no marker removal)
- Smooth transitions without position jumping

#### Key Fixes Applied
1. **Hover Movement Issue**
   - Problem: Pins moved away on hover
   - Solution: Scale SVG inside container, not container itself
   - Transform origin: `center bottom`

2. **Anchor Point Consistency**
   - Problem: Visual anchor shifted when zooming/clicking
   - Solution:
     - Both states use `anchor: 'bottom'`
     - Anchor dots at exact bottom of viewBox
     - Default: (25, 51) in 50x54 viewBox
     - Active: (30, 81) in 60x85 viewBox

3. **Clipped Anchor Dot**
   - Problem: Dots cut off at viewBox edge
   - Solution: Extended viewBox heights to accommodate full circles

---

## 🎨 Visual Enhancements

### 3D Realistic Styling (Pure CSS/SVG)
- **Radial gradients** for spherical lighting
- **Multi-layer drop shadows** (outer glow + depth)
- **Shine highlights** using ellipse overlays
- **Color gradients** from light (top) to dark (bottom)
- **Transform origin:** `center bottom` for natural scaling
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` for smooth animations

### Color System
```javascript
// Gradient stops
Light: adjustBrightness(color, +40)
Mid: color
Dark: adjustBrightness(color, -30)
```

---

## 🏛️ Icon Integration

### Lucide React Implementation
**Library:** `lucide-react` (already installed)

#### Icon Mapping by Location Type
| Type | Icon | Description |
|------|------|-------------|
| `art_museum` | Landmark | Columns/monument style |
| `art_gallery` | Building2 | Building with windows |
| `monument` | Castle | Historic building |
| `street_art` | Image | Picture frame |
| Default | Building | Generic building |

#### Icon Rendering
- **Default pin:** 12px icon (scale 0.5)
- **Active pin:** 18px icon (scale 0.75)
- **Positioning:** Centered using SVG transform
- **Color:** Semi-transparent black (default), fillColor (active)

### Smart Image/Icon Fallback (Option B)
```javascript
// Always render icon as background
// Attempt to load image if valid path
// Image fades in over icon if successful
// Falls back to icon if image fails
```

**Image Path Detection:**
- ❌ Skip: `/images/*` (known non-existent)
- ✅ Allow: HTTP/HTTPS URLs, other local paths

---

## 🏷️ Label System

### Active State Labels
**Design:** Clean text overlay (no background box)

#### Styling
- **Font:** Apple system font stack
- **Size:** 15px, weight 600
- **Color:** White
- **Effect:** Multi-layer text-shadow for stroke
  ```css
  text-shadow:
    /* 4-way black stroke */
    -1px -1px 0 rgba(0,0,0,0.8),
    1px -1px 0 rgba(0,0,0,0.8),
    -1px 1px 0 rgba(0,0,0,0.8),
    1px 1px 0 rgba(0,0,0,0.8),
    /* Glow + depth */
    0 0 4px rgba(0,0,0,0.6),
    0 2px 8px rgba(0,0,0,0.4);
  ```

#### Behavior
- Shows only location name (no category)
- Appears on pin click
- Positioned below anchor dot
- Fade-in animation (200ms)
- Disappears when clicking elsewhere

---

## 📂 Technical Architecture

### File Structure
```
src/
├── services/
│   └── mapService.ts         # Pin logic, SVG generation
├── components/
│   └── ui/
│       ├── map.tsx           # Mapbox map component
│       └── active-pin.tsx    # Active pin creator
└── data/
    └── mockLocations.ts      # Location data
```

### Key Functions
| Function | Purpose |
|----------|---------|
| `getIconPath()` | Returns SVG paths for location type icons |
| `getDefaultPinSVG()` | Generates default circle pin SVG |
| `getActivePinSVG()` | Generates active teardrop pin SVG |
| `createDefaultPinElement()` | Creates marker DOM element |
| `createLabelElement()` | Creates label DOM element |
| `activateMarker()` | Swaps to active state + shows label |
| `deactivateMarker()` | Swaps to default state + hides label |
| `addAllMarkers()` | Adds all location markers to map |

### State Management
```javascript
activeMarkerState: {
  marker: any | null;         // Currently active marker
  defaultElement: HTMLElement | null;
  location: any | null;       // Location data
  label: HTMLElement | null;  // Label element
}
```

---

## 🔧 Technical Decisions

### Why Pure CSS/SVG?
- ✅ No external dependencies for graphics
- ✅ Performant and lightweight
- ✅ Scalable at any zoom level
- ✅ Full control over styling

### Why HTML Markers for Active State?
- ✅ Easier to animate complex transitions
- ✅ Can use actual fonts for labels
- ✅ More flexible styling with CSS
- ✅ Better for dynamic content (images)

### Why Swap SVG Content Instead of Markers?
- ✅ No position jumping
- ✅ Instant transitions
- ✅ Preserves Mapbox anchor point
- ✅ Simpler state management

---

## 🐛 Issues Resolved

1. ✅ Pins moving away on hover
2. ✅ Pins disappearing on click
3. ✅ Anchor point shifting when zooming
4. ✅ Anchor dot clipped at viewBox edge
5. ✅ Icons not displaying properly
6. ✅ Icons not showing in active state
7. ✅ Images showing broken placeholders

---

## 📊 Current State

### Working Features
- ✅ Default circular pins with 3D effect
- ✅ Active teardrop pins with pointer
- ✅ Icon system with type-based icons
- ✅ Smart image/icon fallback
- ✅ Active state labels
- ✅ Smooth animations and transitions
- ✅ Consistent anchor points
- ✅ Hover effects

### Pending Enhancements
- ⏳ Animation refinements (can be improved later)
- ⏳ Real images (when available)
- ⏳ Additional icon customization options

---

## 🎓 Key Learnings

### SVG in Mapbox
- Use `anchor: 'bottom'` for pins pointing to locations
- ViewBox must accommodate all elements (including shadows/dots)
- Transform origin crucial for stable scaling
- Avoid nested SVG elements

### Text Shadows for Stroke Effect
- Multi-directional shadows create clean outlines
- Layer shadows (stroke + glow + depth) for best readability
- Works on any background without box

### Performance Optimization
- Default state: Lightweight (50x54px, simple SVG)
- Active state: Rich (60x85px, complex gradients)
- Only one active marker at a time
- Swap content instead of recreating markers

---

## 📝 Code Snippets

### Creating Pin with Anchor Point
```typescript
const marker = new mapboxgl.Marker({
  element: el,
  anchor: 'bottom'  // Critical for location accuracy
})
  .setLngLat(location.coordinates)
  .addTo(map);
```

### Swapping Pin State
```typescript
// Activation
element.innerHTML = getActivePinSVG(location, fillColor, locationType);
element.style.width = '60px';
element.style.height = '85px';

// Deactivation
element.innerHTML = getDefaultPinSVG(fillColor, locationType);
element.style.width = '50px';
element.style.height = '54px';
```

---

## 🚀 Next Steps (Suggested)

1. Add real location images when available
2. Implement click-to-zoom functionality
3. Add distance/direction indicators
4. Create info cards with full location details
5. Add routing/directions feature
6. Implement location filtering by type
7. Add search functionality

---

## 💡 Design Inspiration
- **Apple Maps:** Pin design and label styling
- **Google Maps:** Clean text overlays
- **3D Principles:** Radial gradients, multi-layer shadows
- **Modern UI:** Smooth animations, glass morphism hints

---

*Session completed successfully with all requested features implemented and working.*

# Indoor Routes Implementation

## What Was Implemented

Successfully integrated indoor walkway routing system that prioritizes covered/air-conditioned routes over outdoor walking.

### Features Added

1. **Indoor Connections Database** (`src/data/indoorConnections.ts`)
   - KL Sentral ↔ NU Sentral Mall (150m, 2 mins, air-conditioned)
   - NU Sentral ↔ Muzium Negara MRT (240m, 3 mins, covered walkway)
   - KL Sentral → Muzium Negara via NU Sentral (390m, 5 mins, fully indoor)
   - Pasar Seni LRT ↔ MRT (65m, 1 min, paid-to-paid bridge)
   - Pasar Seni ↔ Central Market (80m, 1.5 mins, covered)

2. **Smart Routing Algorithm**
   - Automatically detects when indoor routes are available
   - Gives 30% time bonus to indoor routes (prioritizes comfort over speed)
   - Falls back to Mapbox API when no indoor route exists
   - Compares all station exits and picks optimal route

3. **UI Enhancements**
   - 🏢 Indoor route badges
   - ❄️ Air-conditioned indicators
   - Indoor percentage display
   - Feature tags (wheelchair accessible, escalators, etc.)

## Testing Guide

### Test Case 1: KL Sentral → National Art Gallery

**Expected behavior:**
- Should show route via Muzium Negara MRT
- Route should be marked as "100% Indoor Route"
- Should show "Air-conditioned" badge
- Walking time should be ~5-7 mins (much faster than outdoor)

**Steps:**
1. Open http://localhost:3000
2. Select "National Art Gallery"
3. Click "Station guide" tab
4. Look for Muzium Negara MRT in the list
5. Verify it shows:
   - "🏢 100% Indoor Route"
   - "❄️ Air-conditioned"
   - Exit name and description

### Test Case 2: Pasar Seni → Central Market Area

**Expected behavior:**
- Should show indoor connection
- Very short walking time (~1.5 mins)

**Steps:**
1. Select any location near Pasar Seni area
2. Check Station guide
3. Verify Pasar Seni shows indoor connection

### Test Case 3: Other Stations (Fallback to API)

**Expected behavior:**
- Stations without indoor connections still work
- No indoor badges shown
- Uses standard Mapbox routing

**Steps:**
1. Select location near KLCC, Bukit Bintang, etc.
2. Routes should still work normally
3. No indoor indicators (since we haven't mapped those yet)

## How Indoor Routing Works

```
User selects location
    ↓
System finds nearby stations
    ↓
For each station exit:
    ├─ Check: Indoor connection available?
    ├─ YES → Use indoor route (with 30% priority bonus)
    └─ NO → Use Mapbox API outdoor route
    ↓
Pick best route per station (considering indoor bonus)
    ↓
Display with indoor indicators
```

## Adding More Indoor Connections

Edit `src/data/indoorConnections.ts` and add new connections:

```typescript
{
  id: 'unique-id',
  name: 'Start ↔ End',
  start: {
    name: 'Starting Point Name',
    coordinates: [longitude, latitude]  // Use Google Maps
  },
  end: {
    name: 'Ending Point Name',
    coordinates: [longitude, latitude]
  },
  distance: 200,  // meters
  duration: 150,  // seconds (2.5 mins)
  type: 'mall' | 'covered_walkway' | 'skybridge' | 'underground',
  features: ['air-conditioned', 'wheelchair accessible', 'escalators'],
  openingHours: '6am - 12am daily',  // optional
  instructions: 'Walk through [building] from [entrance] to [exit]',
  isBidirectional: true  // Can walk both ways
}
```

## Benefits

✅ **Faster routes** - Indoor shortcuts reduce walking time
✅ **Better UX** - Air-conditioned, covered routes preferred
✅ **Local knowledge** - Uses paths Mapbox doesn't know
✅ **Accessibility** - Shows wheelchair-accessible options
✅ **Scalable** - Easy to add more connections

## Data Sources

- [NU Sentral Connection](https://www.tripadvisor.com/FAQ_Answers-g298570-d6599717-t2002753)
- [Muzium Negara MRT Walkway](https://museumvolunteersjmm.com/2017/07/22/mrt-link-muzium-negara-to-kl-sentral/)
- [Pasar Seni LRT-MRT Bridge](https://en.wikipedia.org/wiki/Pasar_Seni_station)

## Next Steps

1. Test the current indoor routes
2. Map KLCC area indoor connections (Suria KLCC, etc.)
3. Map Bukit Bintang mall network
4. Add opening hours logic (avoid closed routes at night)
5. Consider multi-segment indoor routes (chain multiple connections)

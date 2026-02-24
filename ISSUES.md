# Known Issues

## Route Suggestion Not Working on First Load

**Status**: Deferred
**Priority**: Low
**Discovered**: 2026-02-24

### Description
The route suggestion feature (Station guide tab) occasionally fails to work on first load but works after refreshing the page.

### Observed Behavior
- User selects a location
- Clicks on "Station guide" tab
- Routes don't load or display
- After refreshing the browser, the feature works as expected

### Potential Causes
1. **Race Condition**: Map might not be fully loaded when route fetching is triggered
2. **State Initialization**: `mapRef.current` could be `null` on first render
3. **Timing Issue**: Mapbox library initialization might need extra time on first load
4. **HMR Side Effects**: Hot Module Replacement during development can cause state issues

### Files Involved
- `src/hooks/useWalkingRoutes.ts` - Route fetching logic
- `src/services/routeService.ts` - Mapbox API calls
- `src/components/ui/map.tsx` - Map initialization
- `src/app/page.tsx` - Map load handler and route coordination

### Suggested Fixes (Not Implemented)
1. Add safeguards to check if map is ready before fetching routes
2. Implement retry logic for failed API calls
3. Add better error handling and user feedback
4. Add loading state checks in `handleTabChange` (page.tsx:95-105)

### Steps to Reproduce
- Unclear - issue was intermittent
- Seemed to occur on first location selection after app load
- Could not consistently reproduce

### Notes
- Works consistently after refresh
- No console errors observed when issue occurred
- Mapbox API credentials are valid

# Removing PIN Activation - Clean Implementation

## What we're keeping:
- Default pin SVG
- Mute/unmute (opacity) for visual feedback
- Click to select location

## What we're removing:
- activateMarker()
- deactivateMarker()
- getActivePinSVG()
- createLabelElement()
- activeMarkerState
- All SVG swapping
- All size changes

## New addAllMarkers implementation:
- Simple default pins
- Click calls callback → updates React state
- No marker-side state tracking

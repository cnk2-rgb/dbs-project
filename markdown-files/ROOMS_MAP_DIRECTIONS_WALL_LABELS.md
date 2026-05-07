# Rooms, SVG Map, Directions, and Wall Labeling

This document summarizes the current playable layout implemented in code.

## Canonical sources

- Scene geometry:
  - `src/components/BedroomScene.tsx`
  - `src/components/scene/HallwayWing.tsx`
  - `src/components/scene/KitchenArea.tsx`
  - `src/components/scene/OfficeArea.tsx`
- Top-down SVG map (generated to reflect current geometry):
  - `inspiration/game-map-topdown.svg`
- Earlier concept/reference SVG (not the canonical implementation map):
  - `inspiration/long-hallway-layout-v2.svg`

## Rooms in the current layout

- Bedroom
  - Base shell in `BedroomScene` (walls `A-E`), around the player start area.
- Main Hall
  - Corridor network created in `HallwayWing`.
- Kitchen
  - Geometry and room label in `KitchenArea`.
- Office
  - Geometry in `OfficeArea`.
- Bathroom
  - Bathroom enclosure walls in `HallwayWing` (`BA-L`, `BA-T`, `BA-B`) with doorway opening on wall `S`.
- Living Room
  - Geometry and room label in `HallwayWing` (`LR-*` wall set).

## SVG map notes

`inspiration/game-map-topdown.svg` includes:

- Room footprints for Bedroom, Main Hall, Kitchen, Office, Bathroom, and Living Room.
- Wall overlays for all current debug IDs.
- Labeling for wall IDs and room names.
- Direction markers (`UP`, `DOWN`, `LEFT`, `RIGHT`).
- A projection note: hallway depth is compressed in 3D via `scale z = 0.5` in `HallwayWing`.

## Direction and coordinate conventions

World-space conventions in the current implementation:

- `x` increases to the right.
- `x` decreases to the left.
- `z` increases toward deeper hallway/living-room direction (shown as `DOWN` on `game-map-topdown.svg`).
- `z` decreases toward the bedroom back wall direction (shown as `UP` on `game-map-topdown.svg`).
- `y` is vertical.

Camera/movement behavior:

- Look input: pointer/touch modifies yaw/pitch.
- Move input: `W/A/S/D` and arrow keys.
- Position constraints are enforced in `constrainPlayerPosition()`:
  - Global clamp: `x in [-14.7, 3.2]`, `z in [-4.25, 17.8]`.
  - Bedroom zone (`x >= -3.2`): `z in [-3.7, 3.6]`.
  - Hall-transition zone (`-6.2 < x < -3.2` and `-2.2 < z < 1.2`): `z in [-1.95, -0.85]`.
  - Elsewhere (hall and deeper rooms): `z in [-4.1, 17.8]`.

## Wall labeling system

Wall IDs are rendered by `DebugWallLabel` and only appear in dev builds (`if (!import.meta.env.DEV) return null`).

### Bedroom shell labels

- `A`, `B`, `C`, `D`, `E`
- `FLOOR-ALL`
- `CEILING-ALL`

### Hall / connector labels

- `F`, `I`, `Y`, `Q`, `M`, `N`, `O`, `P`, `S`, `T`

### Kitchen edge labels

- `J`, `K`, `R`

### Office labels

- `U`, `V`, `W`

### Bathroom labels

- `BA-L` (left/outer wall)
- `BA-T` (top wall)
- `BA-B` (bottom wall)

### Living room labels

- `LR-L` (left wall)
- `LR-R` (right wall)
- `LR-C` (connector wall)
- `LR-F` (far wall)

## Current ID coverage note

The active code uses the IDs above. If you see other IDs in map artifacts (for example `L` in some generated/exported visuals), treat those as non-authoritative unless they also exist in current scene code.

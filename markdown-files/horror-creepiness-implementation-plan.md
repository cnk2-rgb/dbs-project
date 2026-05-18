# Horror Creepiness Implementation Plan

This document turns the horror atmosphere ideas into a prioritized implementation list for the game. The goal is to increase unease first, then layer in stronger scare delivery, and finally add polish and variation.

## Priority Order

1. Roughen the environment so the world feels worn and unsafe.
2. Make room lighting clearly different from room to room.
3. Add realistic furniture and props so spaces feel lived-in and uncanny.
4. Build audio layers that keep the player uneasy even when nothing is happening.
5. Add jumpscare lighting and sound effects that land with impact.
6. Add secondary creepiness systems like clutter, distortion, and environmental changes over time.

## P0: Environment Surface Pass

This is the highest-value visual change because it affects every room immediately.

### Goals

- Make walls, floors, ceilings, and trim feel old, dirty, and touched by time.
- Remove any sense that the environment is clean, procedural, or sterile.
- Add subtle material variation so the player notices decay without everything looking noisy.

### Implementation Details

- Replace overly smooth materials with rougher PBR values.
- Increase roughness variation across all major surfaces.
- Add grime masks, scuffed edges, chipped paint, cracked plaster, water stains, and faded patches.
- Use decals or layered textures for localized damage instead of applying one uniform dirty texture everywhere.
- Break up repeating textures with slight tiling offsets, scale variation, and different stain intensities per room.
- Add damp-looking dark patches in corners, near baseboards, and around doors or windows.
- Use worn edge wear to make door frames, furniture edges, and floor transitions feel handled and aged.

### Acceptance Criteria

- No major room surface should look flat or pristine.
- The same material should not repeat identically across the whole map.
- Damage and grime should read as environmental storytelling, not just noise.

## P1: Room-by-Room Lighting Identity

Lighting is the second biggest factor in horror readability and mood.

### Goals

- Give each room a distinct emotional tone.
- Use light to hide, reveal, and mislead.
- Make darkness feel deep enough that corners matter.

### Implementation Details

- Assign each room a lighting profile before final art pass.
- Use different color temperatures per room:
  - sickly green or fluorescent white for clinical or hallway spaces
  - warm but weak lamp light for bedrooms or living spaces
  - cold blue moonlight for exterior-facing areas
  - emergency red or failing amber for danger states
- Create per-room differences in shadow softness, exposure, and fill light.
- Use practical light sources that feel physically motivated, such as lamps, TVs, hallway bulbs, or monitors.
- Add slight flicker patterns to selected bulbs rather than every light source.
- Let some rooms have poor visibility by design, especially in corners and at long sightlines.
- Keep bright areas small and intentional so the player cannot fully trust what is outside them.

### Acceptance Criteria

- A player can tell they entered a new room partly by lighting alone.
- No two rooms should share the same lighting mood.
- Darkness should obscure detail without making gameplay unreadable.

## P1: Realistic Furniture and Prop Pass

Furniture should make the apartment feel plausible before it starts feeling wrong.

### Goals

- Replace placeholder or generic furnishings with realistic GLB assets.
- Make the rooms feel inhabited, but not comfortable.
- Use object placement to create subtle unease.

### Implementation Details

- Import realistic furniture as GLB models for beds, chairs, tables, couches, lamps, cabinets, and small decor.
- Match furniture scale carefully so everything feels physically believable.
- Avoid perfect symmetry unless a room is intentionally uncanny.
- Place furniture with slight practical messiness: chairs not fully tucked in, a lamp angled oddly, drawers partially open.
- Add small environmental props:
  - old photos
  - scattered papers
  - broken toys
  - medical or household items
  - half-used cups or plates
  - shoes or clothing left out
- Include one or two props that feel out of place in each room.
- Use wear on furniture surfaces: scuffs, frayed fabric, stains, dust, and sun-faded areas.

### Acceptance Criteria

- Every room contains believable furniture instead of empty geometry.
- At least some objects feel subtly wrong in arrangement, scale, or context.
- The player should be able to infer a lived-in history from the set dressing.

## P2: Audio Atmosphere Layer

Sound should maintain tension even when the player is not being attacked.

### Goals

- Build an ambient bed that suggests the building is breathing around the player.
- Use quiet details to create doubt.
- Make room tone part of the fear design.

### Implementation Details

- Add base ambient loops for each room or room type.
- Layer in low-level environmental sounds such as:
  - HVAC rumble
  - distant creaks
  - electrical hum
  - faint knocking
  - settling wood or pipes
  - wind or outdoor traffic where appropriate
- Use positional audio so off-screen sounds feel spatial instead of flat.
- Give each room a slightly different tone so the audio changes when the player moves.
- Use quiet repeating audio cues that are nearly imperceptible, then repeat them just enough for the player to notice.
- Add sound transitions when entering new rooms instead of hard cuts.
- Keep some sounds intentionally ambiguous so the player cannot tell if they are real or imagined.

### Acceptance Criteria

- Silence should almost never feel empty.
- The player should hear room changes before consciously identifying them.
- Ambient audio should be distinct enough to support tension without becoming distracting.

## P2: Jumpscare Lighting and Stinger System

This is the main scare delivery layer.

### Goals

- Make jumpscares feel like an event, not just a model pop-in.
- Use lighting to cue the scare and then release tension immediately after.

### Implementation Details

- Add a jumpscare-specific light sequence:
  - quick flicker
  - brief blackout
  - hard flash or overbright burst
  - abrupt return to darkness or partial visibility
- Sync the scare with a sharp audio stinger.
- Use shadow motion or silhouette buildup before the scare where possible.
- Make the scare happen with a small timing lead-in so the player senses something is wrong.
- After the scare, shift the lighting back to a lower-intensity state so the scene feels "after the damage."
- If the scare happens in a room with a visible light source, have that source fail or pulse during the event.

### Acceptance Criteria

- The jumpscare has a visible prelude and a clear finish.
- The scare reads through both light and sound.
- The scare should still work even if the player is not directly facing it.

## P3: Secondary Visual Distortion

These systems are lower priority because they should support the core atmosphere rather than replace it.

### Goals

- Add subtle instability when tension rises.
- Avoid making the screen effect-heavy all the time.

### Implementation Details

- Add light fog, dust motes, or grain in darker areas.
- Use vignette sparingly to pull focus into the center during tense moments.
- Apply subtle chromatic aberration or focus pulsing only during scares or warning states.
- Introduce small camera shake during high-intensity events, but keep normal movement stable.
- Use depth-of-field or focus shifts to make important objects temporarily harder to read.
- Add slight visual noise or screen warping when the monster is close.

### Acceptance Criteria

- Effects should be noticeable only when they add tension.
- Normal exploration should remain readable and playable.
- The player should feel pressure, not motion sickness.

## P3: Environmental Storytelling Pass

This deepens the feeling that the house has a history and a presence.

### Goals

- Suggest that something bad already happened here.
- Make the player feel observed without directly explaining everything.

### Implementation Details

- Add signs of recent activity:
  - moved furniture
  - open drawers
  - footprints
  - knocked-over objects
  - doors left slightly open
- Place evidence that someone was interrupted mid-task.
- Show that the world changes over time between visits or after major events.
- Move small objects between rooms or slightly change their positions when the player is not looking.
- Add room-specific details that imply a backstory without a full exposition dump.

### Acceptance Criteria

- The player can infer that the space is not static.
- Changes should feel plausible enough to be unsettling.
- Story hints should appear through environment, not text.

## P4: Uncanny Object Placement and Composition

This is a low-cost layer that can make rooms feel wrong without new systems.

### Goals

- Make the player uneasy by composition alone.
- Make common objects feel threatening through context.

### Implementation Details

- Avoid centered, perfectly staged layouts unless the room is supposed to feel unnatural.
- Create uncomfortable sightlines where the player sees partially hidden objects.
- Put chairs facing walls, objects slightly off alignment, or props in places they do not belong.
- Leave large empty spaces in otherwise furnished areas to make the room feel abandoned.
- Use one or two "wrong" objects per room so the player keeps scanning for anomalies.

### Acceptance Criteria

- The room should feel intentional, but not safe.
- At least one object in most spaces should feel subtly off.

## P4: Enemy and Reflection Presentation

These are presentation rules for the monster or other scare entity.

### Goals

- Keep the monster from becoming normal through overexposure.
- Make glimpses more effective than full reveals.

### Implementation Details

- Reveal the monster in partial views first:
  - reflections
  - door cracks
  - edge-of-frame sightings
  - dark windows
  - mirrors or screens
- Use stillness as much as movement.
- Make movement feel unnatural by delaying or exaggerating it slightly.
- Give the monster a recognizable audio signature before the player sees it.
- Limit full-body visibility to major scare moments.

### Acceptance Criteria

- The monster should remain unfamiliar for most of the run.
- Partial visibility should create more dread than constant visibility.

## P5: Room Variation and Reuse Strategy

Once the core atmosphere is working, use it consistently across spaces.

### Goals

- Make each room distinct while keeping production manageable.
- Reuse systems without making rooms feel copy-pasted.

### Implementation Details

- Define a room template with shared rules for lighting, sound, clutter, and surface wear.
- Override that template per room with specific values for:
  - light color
  - brightness
  - ambient loop
  - prop set
  - surface damage level
  - scare response
- Track room identity in data so future rooms can be added without custom logic for every one.
- Use the same asset library with different arrangements and lighting to reduce asset burden.

### Acceptance Criteria

- New rooms can be produced by combining existing systems.
- Each room still feels purpose-built.

## Suggested Build Order

1. Finish the surface roughness pass across all current rooms.
2. Assign unique lighting profiles per room.
3. Replace placeholder furniture with GLB assets and position them intentionally.
4. Add ambient sound layers and room-specific room tone.
5. Implement jumpscare lighting and sound sequences.
6. Add small environmental storytelling details and object movement.
7. Add optional postprocessing and other secondary effects.

## Practical Implementation Notes

- Build in layers, not all at once. The game gets creepier fastest when all the core senses agree.
- Prioritize readable darkness over pure darkness.
- Use fewer, stronger changes rather than many weak effects.
- Tie effects to specific game states so the scare language is consistent:
  - exploration uses subtle ambience
  - warning state uses flicker and tension audio
  - jumpscare state uses harsh light and a sharp stinger
  - aftermath returns to low, uneasy visibility

## Final Outcome

If these steps are implemented in order, the game should shift from a generic dark scene into a space that feels:

- worn
- inhabited
- unstable
- sound-driven
- and actively hostile during scare moments

That gives the horror a stronger base than any single jumpscare alone.

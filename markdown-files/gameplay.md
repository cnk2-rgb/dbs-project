# Gameplay Rules

## Core Goal
Survive the day by getting all `6` portable battery packs to charge your phone.

## Formal Gameplay Spec

### Core Loop
1. Battery packs auto-spawn in the level.
2. The player explores and collects packs.
3. Each pack adds `10 seconds` of phone charge.
4. Monster attacks occur at random intervals every `3-4 minutes`.
5. Before the attack resolves, the player gets a short warning phase.
6. During the warning phase, the player can defend by opening the phone and unlocking it.
7. If the defense succeeds, the player survives the attack.
8. If the defense fails, the player loses a life.
9. The player wins by collecting all `6` packs and surviving until the end of the day.

### Player Resources
- `Lives`: starts at `3`.
- `Phone charge`: starts at `0` unless the game provides a starting pack.
- `Battery packs collected`: starts at `0` and ends at `6`.

### Phone Charge Rules
- Each battery pack restores `10 seconds` of charge.
- Charge is consumed when the player uses the phone to defend.
- If the phone has no charge, the player cannot use it to protect against a monster attack.
- The UI should always make current charge easy to read.

### Monster Attack Rules
- Monster attacks happen randomly every `3-4 minutes`.
- The attack sequence has two phases:
  - warning phase
  - jumpscare resolution
- During the warning phase, lights will flicker in the apartment for `5 seconds`.
- After the `5 second` window ends, the monster jumpscare triggers.
- If the player has not successfully defended by then, the attack lands.

### Defense Rules
- The player can press `o` to open the phone.
- If the phone is charged, the player enters a short unlock minigame.
- Success means the monster attack is blocked.
- Failure means the player loses `1 life`.
- Defense should be simple and readable in v1, not a full puzzle system.

### Win and Loss
- Win condition:
  - collect all `6` battery packs
  - survive all monster attacks
  - reach the end-of-day state
- Loss condition:
  - lose all `3 lives`

### Battery Pack Rules
- Packs auto-spawn in the playable area.
- Packs should be visible and immediately understandable.
- Packs should be collectible with a simple pickup interaction.
- Collecting a pack should always be valuable because it directly extends survival time.

## v1 Scope
For the first implementation pass, keep the game focused on:
- auto-spawned battery packs
- random monster attacks
- phone charge and defense
- 3-life fail state
- end-of-day success state

## State Model
The gameplay can be implemented as a simple finite state machine.

### Suggested States
- `exploring`
- `monster_warning`
- `monster_attack`
- `phone_unlock`
- `day_complete`
- `game_over`

### State Transitions
- `exploring` -> `monster_warning` when the attack timer triggers.
- `monster_warning` -> `monster_attack` after the `5 second` warning window ends.
- `monster_warning` -> `phone_unlock` when the player presses `o` and the phone has charge.
- `phone_unlock` -> `exploring` on successful unlock if the attack is prevented.
- `phone_unlock` -> `monster_attack` on failed unlock if the attack is still active.
- `monster_attack` -> `exploring` if the attack is blocked.
- `monster_attack` -> `game_over` if lives reach `0`.
- `exploring` -> `day_complete` when all `6` packs are collected and the day ends.

## Future Systems
These are planned for later, but not required for the first playable version:
- extra tasks that change monster frequency
- tasks that grant battery packs
- difficulty scaling based on player decisions
- additional scare variants
- more complex phone interactions

## Technical Implementation Checklist

### 1. Core Game State
- Add a gameplay state object that tracks:
  - current state
  - lives remaining
  - phone charge remaining
  - packs collected
  - next monster attack time
  - whether the player is in a warning window
- Keep the state serializable so it can eventually work with the save system.

### 2. Battery Pack Spawning
- Implement auto-spawn logic for battery packs.
- Start with a fixed spawn count or fixed spawn points for v1.
- Ensure the player can see and collect packs reliably.
- On pickup:
  - increment collected packs
  - add `10 seconds` of phone charge
  - remove the pack from the world

### 3. Monster Timer
- Create a repeating attack timer.
- Each cycle should choose a random delay between `3` and `4` minutes.
- When the timer fires:
  - enter warning state
  - start the `5 second` flicker window
  - then resolve the attack

### 4. Warning and Jumpscare
- Show a visible warning indicator when an attack is approaching.
- Allow the player to flicker lights during the warning window.
- After the warning ends, trigger the monster jumpscare.
- Keep the timing strict so the feature is easy to test.

### 5. Phone Defense
- Bind `o` to open the phone.
- Gate the defense behind available charge.
- Add a short unlock minigame with a clear success and failure result.
- On success:
  - cancel the monster attack
  - consume charge
  - return to exploration
- On failure:
  - consume charge if applicable
  - remove `1 life`
  - continue or end the attack sequence

### 6. Lives and Fail State
- Initialize the player with `3 lives`.
- Decrement lives on failed monster attacks.
- End the run when lives reach `0`.
- Show a clear game over state and a restart path.

### 7. UI Feedback
- Display:
  - lives remaining
  - phone charge
  - packs collected out of `6`
  - current monster warning status
- Make the warning state hard to miss.

### 8. Testing Targets
- Verify that collecting `6` packs triggers the win path.
- Verify that each monster attack can remove exactly `1 life`.
- Verify that the phone cannot defend without charge.
- Verify that the warning window lasts `5 seconds`.
- Verify that random attack timing stays in the `3-4 minute` range.

## Implementation Notes
- Keep the first version deterministic enough to test, even if attacks feel random.
- The first build should prioritize simple, readable gameplay over depth.
- If a rule conflicts with fun or clarity, simplify the mechanic before adding more systems.

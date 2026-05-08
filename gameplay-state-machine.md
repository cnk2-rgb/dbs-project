# Gameplay State Machine Sketch

This is a first-pass state machine for the core gameplay loop.
It is intentionally small so implementation can start with one loop and grow later.

## State Shape

```ts
type GameplayState =
  | "exploring"
  | "monster_warning"
  | "phone_unlock"
  | "monster_attack"
  | "day_complete"
  | "game_over";

type GameplayModel = {
  state: GameplayState;
  lives: number; // starts at 3
  phoneChargeSeconds: number; // each battery pack adds 10
  packsCollected: number; // target is 6
  packsRequired: number; // fixed at 6 for v1
  attackTimerMs: number; // next random attack between 180000 and 240000
  warningTimerMs: number; // fixed at 5000
  hasPhoneOpen: boolean;
  isLightsFlickering: boolean;
  monsterAttackActive: boolean;
};
```

## Events

```ts
type GameplayEvent =
  | { type: "GAME_START" }
  | { type: "TICK"; deltaMs: number }
  | { type: "PACK_COLLECTED" }
  | { type: "ATTACK_TIMER_ELAPSED" }
  | { type: "WARNING_TIMER_ELAPSED" }
  | { type: "OPEN_PHONE" }
  | { type: "UNLOCK_SUCCESS" }
  | { type: "UNLOCK_FAIL" }
  | { type: "LIVES_DEPLETED" }
  | { type: "DAY_ENDED" }
  | { type: "RESTART"};
```

## Core Rules

```ts
const PACK_CHARGE_SECONDS = 10;
const REQUIRED_PACKS = 6;
const STARTING_LIVES = 3;
const ATTACK_MIN_DELAY_MS = 180000; // 3 minutes
const ATTACK_MAX_DELAY_MS = 240000; // 4 minutes
const WARNING_WINDOW_MS = 5000;
```

## Transition Pseudocode

```ts
function reduce(state: GameplayModel, event: GameplayEvent): GameplayModel {
  switch (state.state) {
    case "exploring": {
      if (event.type === "PACK_COLLECTED") {
        const packsCollected = state.packsCollected + 1;
        const phoneChargeSeconds = state.phoneChargeSeconds + PACK_CHARGE_SECONDS;

        if (packsCollected >= REQUIRED_PACKS) {
          return {
            ...state,
            packsCollected,
            phoneChargeSeconds,
            state: "day_complete",
          };
        }

        return { ...state, packsCollected, phoneChargeSeconds };
      }

      if (event.type === "ATTACK_TIMER_ELAPSED") {
        return {
          ...state,
          state: "monster_warning",
          monsterAttackActive: true,
          warningTimerMs: WARNING_WINDOW_MS,
        };
      }

      if (event.type === "OPEN_PHONE" && state.phoneChargeSeconds > 0) {
        return {
          ...state,
          state: "phone_unlock",
          hasPhoneOpen: true,
          phoneChargeSeconds: state.phoneChargeSeconds - 1,
        };
      }

      return state;
    }

    case "monster_warning": {
      if (event.type === "TICK") {
        const warningTimerMs = state.warningTimerMs - event.deltaMs;
        if (warningTimerMs <= 0) {
          return {
            ...state,
            state: "monster_attack",
            warningTimerMs: 0,
          };
        }
        return { ...state, warningTimerMs };
      }

      if (event.type === "OPEN_PHONE" && state.phoneChargeSeconds > 0) {
        return {
          ...state,
          state: "phone_unlock",
          hasPhoneOpen: true,
          phoneChargeSeconds: state.phoneChargeSeconds - 1,
        };
      }

      return state;
    }

    case "phone_unlock": {
      if (event.type === "UNLOCK_SUCCESS") {
        return {
          ...state,
          state: "exploring",
          hasPhoneOpen: false,
          monsterAttackActive: false,
        };
      }

      if (event.type === "UNLOCK_FAIL") {
        const lives = state.lives - 1;
        return {
          ...state,
          lives,
          hasPhoneOpen: false,
          state: lives <= 0 ? "game_over" : "monster_attack",
        };
      }

      return state;
    }

    case "monster_attack": {
      // If the attack reaches this state without a successful defense, it lands.
      const lives = state.lives - 1;
      return {
        ...state,
        lives,
        monsterAttackActive: false,
        hasPhoneOpen: false,
        state: lives <= 0 ? "game_over" : "exploring",
      };
    }

    case "day_complete":
    case "game_over": {
      if (event.type === "RESTART") {
        return createInitialState();
      }
      return state;
    }
  }
}
```

## Initial State

```ts
function createInitialState(): GameplayModel {
  return {
    state: "exploring",
    lives: STARTING_LIVES,
    phoneChargeSeconds: 0,
    packsCollected: 0,
    packsRequired: REQUIRED_PACKS,
    attackTimerMs: randomAttackDelay(),
    warningTimerMs: 0,
    hasPhoneOpen: false,
    isLightsFlickering: false,
    monsterAttackActive: false,
  };
}
```

## Helper Functions

```ts
function randomAttackDelay(): number {
  return randomBetween(ATTACK_MIN_DELAY_MS, ATTACK_MAX_DELAY_MS);
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

## Implementation Notes

- `PACK_COLLECTED` should be dispatched by the pickup system.
- `TICK` should be driven by the game loop.
- The monster timer should reset after each resolved attack.
- The `monster_attack` state is intentionally short-lived and should resolve immediately into `exploring` or `game_over`.
- `phoneChargeSeconds` can be reduced to `0` at any time; no negative charge.
- The first build can use fixed spawn points for packs while the rest of the system stays event-driven.

## Minimal UI Bindings

- `state === "exploring"`: normal gameplay HUD
- `state === "monster_warning"`: warning overlay, flicker prompt, pulse lighting
- `state === "phone_unlock"`: phone overlay and unlock minigame
- `state === "monster_attack"`: jumpscare animation
- `state === "day_complete"`: win screen
- `state === "game_over"`: fail screen

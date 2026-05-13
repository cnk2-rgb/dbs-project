export type GameplayPhase =
  | "bedroom"
  | "exploring"
  | "monster_warning"
  | "phone_unlock"
  | "monster_attack"
  | "defense_successful"
  | "day_complete"
  | "game_over";

export type GameplayState = {
  phase: GameplayPhase;
  lives: number;
  packsCollected: number;
  packsRequired: number;
  phoneChargeSeconds: number;
};

export const PACK_CHARGE_SECONDS = 10;
export const REQUIRED_PACKS = 6;
export const STARTING_LIVES = 3;
export const FIRST_ATTACK_DELAY_MS = 60000;
export const ATTACK_MIN_DELAY_MS = 180000;
export const ATTACK_MAX_DELAY_MS = 240000;
export const WARNING_WINDOW_MS = 5000;
export const DEFENSE_OPEN_COST_SECONDS = 1;
export const JUMPSCARE_FLASH_MS = 1000;
export const PHASE_FLASH_MS = JUMPSCARE_FLASH_MS;

export function createInitialGameplayState(): GameplayState {
  return {
    phase: "bedroom",
    lives: STARTING_LIVES,
    packsCollected: 0,
    packsRequired: REQUIRED_PACKS,
    phoneChargeSeconds: 0,
  };
}

export function randomAttackDelayMs() {
  return randomBetween(ATTACK_MIN_DELAY_MS, ATTACK_MAX_DELAY_MS);
}

export function gameplayLabel(phase: GameplayPhase) {
  switch (phase) {
    case "bedroom":
      return "[bedroom]";
    case "exploring":
      return "[exploring]";
    case "monster_warning":
    case "phone_unlock":
      return "[defense]";
    case "monster_attack":
      return "[attack]";
    case "defense_successful":
      return "[defense successful]";
    case "day_complete":
      return "[day complete]";
    case "game_over":
      return "[game over]";
  }
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

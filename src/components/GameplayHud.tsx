import type { GameplayPhase } from "../lib/gameplay";
import { gameplayLabel } from "../lib/gameplay";

export function GameplayHud({
  phase,
  lives,
  packsCollected,
  packsRequired,
  phoneChargeSeconds,
}: {
  phase: GameplayPhase;
  lives: number;
  packsCollected: number;
  packsRequired: number;
  phoneChargeSeconds: number;
}) {
  const label = gameplayLabel(phase);

  return (
    <>
      <div className="gameplay-hud gameplay-hud-left" aria-live="polite">
        <div className="gameplay-hud-chip">lives {Math.max(lives, 0)}</div>
        <div className="gameplay-hud-chip" data-testid="packs-chip">
          packs {packsCollected}/{packsRequired}
        </div>
        <div className="gameplay-hud-chip">charge {phoneChargeSeconds}s</div>
      </div>
      <div className="gameplay-hud gameplay-hud-center" aria-live="polite">
        <div className="gameplay-state-label">{label}</div>
      </div>
    </>
  );
}

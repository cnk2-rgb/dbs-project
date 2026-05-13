import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color } from "three";
import { GameplayHud } from "./components/GameplayHud";
import { BedroomScene } from "./components/BedroomScene";
import { PhonePanelOverlay, advancePhoneTimeByHour } from "./components/PhonePanelOverlay";
import {
  playPhoneCloseClick,
  playMonsterJumpscare,
  playPhoneOpenClick,
  playPhonePickupClick,
  playPhoneTapClick,
  playPhoneUnlockClick,
} from "./lib/audio";
import type { IntroPhase, PhonePanelScreen, YouTubePlayer } from "./types/app";
import {
  DEFENSE_OPEN_COST_SECONDS,
  FIRST_ATTACK_DELAY_MS,
  PACK_CHARGE_SECONDS,
  PHASE_FLASH_MS,
  REQUIRED_PACKS,
  STARTING_LIVES,
  WARNING_WINDOW_MS,
  type GameplayPhase,
  randomAttackDelayMs,
} from "./lib/gameplay";
const smsWebhookUrl = (import.meta.env.VITE_SMS_WEBHOOK_URL ?? "").trim();
const smsFromNumber = (import.meta.env.VITE_TWILIO_FROM_NUMBER ?? "").trim();
const inventoryWebhookUrl = (import.meta.env.VITE_INVENTORY_WEBHOOK_URL ?? "").trim();
const monsterJumpscareImages = [
  new URL("../monsters/monster-chatgpt-evil.png", import.meta.url).href,
  new URL("../monsters/monster-chatgpt-silent.png", import.meta.url).href,
  new URL("../monsters/monster-sad.jpeg", import.meta.url).href,
];

type E2EGameplayPreset =
  | "exploring"
  | "monster_warning"
  | "phone_unlock"
  | "monster_attack"
  | "defense_successful"
  | "day_complete"
  | "game_over";

function App() {
  const e2eMode = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("e2e") === "1";
  }, []);
  const debugNoAttacksMode = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("noAttacks") === "1";
  }, []);
  const [isAwake, setIsAwake] = useState(false);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("asleep");
  const [phoneSelected, setPhoneSelected] = useState(false);
  const [phoneOn, setPhoneOn] = useState(false);
  const [phoneUnlocked, setPhoneUnlocked] = useState(false);
  const [phonePanelScreen, setPhonePanelScreen] = useState<PhonePanelScreen>(null);
  const [doorOpen, setDoorOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [playerPhoneNumber, setPlayerPhoneNumber] = useState("");
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState<string | null>(null);
  const [wakeDialogVisible, setWakeDialogVisible] = useState(false);
  const [phoneDisplayTime, setPhoneDisplayTime] = useState("2:47");
  const [postPhoneDialogueVisible, setPostPhoneDialogueVisible] = useState(false);
  const [postPhoneFollowupDialogueVisible, setPostPhoneFollowupDialogueVisible] = useState(false);
  const [postPhoneDialogueShown, setPostPhoneDialogueShown] = useState(false);
  const [doorDialogueVisible, setDoorDialogueVisible] = useState(false);
  const [doorDialogueShown, setDoorDialogueShown] = useState(false);
  const [doorInteractionTick, setDoorInteractionTick] = useState(0);
  const [phoneInInventory, setPhoneInInventory] = useState(false);
  const [phoneOpenHintVisible, setPhoneOpenHintVisible] = useState(false);
  const [closePhoneHintVisible, setClosePhoneHintVisible] = useState(false);
  const [hasOpenedInventoryPhone, setHasOpenedInventoryPhone] = useState(false);
  const [skipIntroUsed, setSkipIntroUsed] = useState(false);
  const [gameplayStarted, setGameplayStarted] = useState(false);
  const [gameplayPhase, setGameplayPhase] = useState<GameplayPhase>("bedroom");
  const [lives, setLives] = useState(STARTING_LIVES);
  const [packsCollected, setPacksCollected] = useState(0);
  const [phoneChargeSeconds, setPhoneChargeSeconds] = useState(0);
  const [collectedPackIds, setCollectedPackIds] = useState<string[]>([]);
  const [phoneDefenseMode, setPhoneDefenseMode] = useState(false);
  const [showDefenseHint, setShowDefenseHint] = useState(false);
  const [monsterJumpscare, setMonsterJumpscare] = useState<{ id: number; imageUrl: string } | null>(null);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const youtubeReadyRef = useRef(false);
  const attackTimerRef = useRef<number | null>(null);
  const warningTimerRef = useRef<number | null>(null);
  const attackResolveTimerRef = useRef<number | null>(null);
  const defenseFlashTimerRef = useRef<number | null>(null);
  const monsterJumpscareTimerRef = useRef<number | null>(null);
  const gameplayStartedRef = useRef(false);
  const gameplayPhaseRef = useRef<GameplayPhase>("bedroom");

  const collectPhoneFromTable = ({
    showFollowupDialogue,
    unlockMovement,
  }: {
    showFollowupDialogue: boolean;
    unlockMovement: boolean;
  }) => {
    playPhonePickupClick();
    setPhoneInInventory(true);
    setPhoneOn(false);
    setPhoneSelected(false);
    setPhonePanelScreen(null);
    setPhoneOpenHintVisible(true);
    if (unlockMovement) {
      setPhoneUnlocked(true);
    }

    if (showFollowupDialogue) {
      setWakeDialogVisible(false);
      setPostPhoneDialogueVisible(false);
      setDoorDialogueVisible(false);
      setPostPhoneDialogueShown(true);
      setPostPhoneFollowupDialogueVisible(true);
      window.setTimeout(() => {
        setPostPhoneFollowupDialogueVisible(false);
      }, 4200);
    }

    void sendInventoryEvent("phone", "collected");
  };

  const skipIntroToPhonePickup = () => {
    setSkipIntroUsed(true);
    setIsAwake(true);
    setIntroPhase("active");
    setHasInteracted(true);
    setWakeDialogVisible(true);
    window.setTimeout(() => {
      setWakeDialogVisible(false);
    }, 3600);
  };

  useEffect(() => {
    const onYouTubeIframeAPIReady = () => {
      const win = window as typeof window & {
        YT?: {
          Player: new (
            elementId: string,
            options: {
              videoId: string;
              playerVars?: Record<string, number>;
              events?: { onReady?: () => void };
            },
          ) => YouTubePlayer;
        };
      };

      if (!win.YT) return;
      youtubePlayerRef.current = new win.YT.Player("landing-bg-music", {
        videoId: "PLFVGwGQcB0",
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          mute: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            youtubeReadyRef.current = true;
            if (!isAwake) {
              youtubePlayerRef.current?.mute();
              youtubePlayerRef.current?.playVideo();
            }
          },
        },
      });
    };

    const win = window as typeof window & {
      YT?: unknown;
      onYouTubeIframeAPIReady?: () => void;
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);
    win.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

    return () => {
      win.onYouTubeIframeAPIReady = undefined;
    };
  }, []);

  useEffect(() => {
    if (!youtubeReadyRef.current || !youtubePlayerRef.current) return;
    if (isAwake) {
      youtubePlayerRef.current.stopVideo();
      return;
    }
    youtubePlayerRef.current.mute();
    youtubePlayerRef.current.playVideo();
  }, [isAwake]);

  useEffect(() => {
    const onFirstInteraction = () => {
      if (!isAwake && youtubeReadyRef.current && youtubePlayerRef.current) {
        youtubePlayerRef.current.unMute();
        youtubePlayerRef.current.playVideo();
      }
      if (isAwake) {
        setHasInteracted(true);
      }
    };

    window.addEventListener("pointerdown", onFirstInteraction);
    window.addEventListener("touchstart", onFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
    };
  }, [isAwake]);

  useEffect(() => {
    if (introPhase === "flicker") {
      const flickerTimer = window.setTimeout(() => {
        setIntroPhase("pan");
      }, 1800);
      return () => {
        window.clearTimeout(flickerTimer);
      };
    }

    if (introPhase === "pan") {
      const panTimer = window.setTimeout(() => {
        setIntroPhase("active");
      }, 3600);
      return () => {
        window.clearTimeout(panTimer);
      };
    }
  }, [introPhase]);

  useEffect(() => {
    if (!isAwake || introPhase !== "active") return;
    setWakeDialogVisible(true);
    const hideTimer = window.setTimeout(() => {
      setWakeDialogVisible(false);
    }, 3600);
    return () => window.clearTimeout(hideTimer);
  }, [introPhase, isAwake]);

  useEffect(() => {
    return () => {
      if (playerPhotoUrl) {
        URL.revokeObjectURL(playerPhotoUrl);
      }
    };
  }, [playerPhotoUrl]);

  useEffect(() => {
    gameplayStartedRef.current = gameplayStarted;
  }, [gameplayStarted]);

  useEffect(() => {
    gameplayPhaseRef.current = gameplayPhase;
  }, [gameplayPhase]);

  useEffect(() => {
    if (!gameplayStartedRef.current || !phoneOn || phoneChargeSeconds <= 0) return;

    const drainTimer = window.setInterval(() => {
      setPhoneChargeSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(drainTimer);
          window.setTimeout(() => {
            if (phoneDefenseMode && (gameplayPhaseRef.current === "monster_warning" || gameplayPhaseRef.current === "phone_unlock")) {
              resolveMonsterAttack();
              return;
            }

            playPhoneCloseClick();
            setPhoneDefenseMode(false);
            setPhonePanelScreen(null);
            setPhoneOn(false);
          }, 0);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(drainTimer);
    };
  }, [gameplayStarted, phoneChargeSeconds, phoneDefenseMode, phoneOn]);

  const clearTimer = (timerRef: { current: number | null }) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearGameplayTimers = () => {
    clearTimer(attackTimerRef);
    clearTimer(warningTimerRef);
    clearTimer(attackResolveTimerRef);
    clearTimer(defenseFlashTimerRef);
    clearTimer(monsterJumpscareTimerRef);
  };

  useEffect(() => {
    return () => {
      clearGameplayTimers();
    };
  }, []);

  const setGameplayPhaseSafely = (nextPhase: GameplayPhase) => {
    gameplayPhaseRef.current = nextPhase;
    setGameplayPhase(nextPhase);
  };

  const setE2EGameplayPreset = (preset: E2EGameplayPreset) => {
    clearGameplayTimers();
    gameplayStartedRef.current = true;
    setGameplayStarted(true);
    setIsAwake(true);
    setIntroPhase("active");
    setHasInteracted(true);
    setWakeDialogVisible(false);
    setPostPhoneDialogueVisible(false);
    setPostPhoneFollowupDialogueVisible(false);
    setDoorDialogueVisible(false);
    setPhoneSelected(false);
    setPhoneOpenHintVisible(false);
    setClosePhoneHintVisible(false);
    setPhonePanelScreen(null);
    setPhoneOn(false);
    setPhoneDefenseMode(false);
    setShowDefenseHint(false);
    setMonsterJumpscare(null);

    switch (preset) {
      case "exploring":
        setPhoneInInventory(false);
        setPhoneUnlocked(false);
        setLives(STARTING_LIVES);
        setPacksCollected(0);
        setPhoneChargeSeconds(0);
        setGameplayPhaseSafely("exploring");
        break;
      case "monster_warning":
        setPhoneInInventory(true);
        setPhoneUnlocked(true);
        setLives(STARTING_LIVES);
        setPacksCollected(0);
        setPhoneChargeSeconds(20);
        setShowDefenseHint(false);
        setGameplayPhaseSafely("monster_warning");
        break;
      case "phone_unlock":
        setPhoneInInventory(true);
        setPhoneUnlocked(true);
        setLives(STARTING_LIVES);
        setPacksCollected(0);
        setPhoneChargeSeconds(20);
        setPhoneOn(true);
        setPhoneDefenseMode(true);
        setShowDefenseHint(false);
        setPhonePanelScreen("lock");
        setGameplayPhaseSafely("phone_unlock");
        break;
      case "monster_attack":
        setPhoneInInventory(true);
        setPhoneUnlocked(true);
        setLives(2);
        setPacksCollected(0);
        setPhoneChargeSeconds(0);
        setShowDefenseHint(false);
        setGameplayPhaseSafely("monster_attack");
        break;
      case "defense_successful":
        setPhoneInInventory(true);
        setPhoneUnlocked(true);
        setLives(2);
        setPacksCollected(0);
        setPhoneChargeSeconds(0);
        setShowDefenseHint(false);
        setGameplayPhaseSafely("defense_successful");
        break;
      case "day_complete":
        setPhoneInInventory(true);
        setPhoneUnlocked(true);
        setLives(STARTING_LIVES);
        setPacksCollected(REQUIRED_PACKS);
        setPhoneChargeSeconds(60);
        setShowDefenseHint(false);
        setGameplayPhaseSafely("day_complete");
        break;
      case "game_over":
        setPhoneInInventory(true);
        setPhoneUnlocked(true);
        setLives(0);
        setPacksCollected(0);
        setPhoneChargeSeconds(0);
        setShowDefenseHint(false);
        setMonsterJumpscare(null);
        setGameplayPhaseSafely("game_over");
        break;
    }
  };

  const scheduleMonsterAttack = (initialAttack: boolean) => {
    clearTimer(attackTimerRef);

    if (!gameplayStartedRef.current) return;
    if (gameplayPhaseRef.current === "day_complete" || gameplayPhaseRef.current === "game_over") return;
    if (debugNoAttacksMode) return;

    attackTimerRef.current = window.setTimeout(() => {
      clearTimer(attackTimerRef);
      if (!gameplayStartedRef.current) return;
      if (gameplayPhaseRef.current !== "exploring") return;

      if (initialAttack) {
        setShowDefenseHint(true);
      }
      setGameplayPhaseSafely("monster_warning");
      clearTimer(warningTimerRef);
      warningTimerRef.current = window.setTimeout(() => {
        if (!gameplayStartedRef.current) return;
        if (gameplayPhaseRef.current === "monster_warning" || gameplayPhaseRef.current === "phone_unlock") {
          resolveMonsterAttack();
        }
      }, WARNING_WINDOW_MS);
    }, initialAttack ? FIRST_ATTACK_DELAY_MS : randomAttackDelayMs());
  };

  const resolveMonsterAttack = () => {
    clearTimer(attackTimerRef);
    clearTimer(warningTimerRef);
    clearTimer(attackResolveTimerRef);
    clearTimer(monsterJumpscareTimerRef);
    setPhoneDefenseMode(false);
    setShowDefenseHint(false);
    setPhonePanelScreen(null);
    setPhoneOn(false);
    const imageUrl = monsterJumpscareImages[Math.floor(Math.random() * monsterJumpscareImages.length)];
    setMonsterJumpscare({ id: Date.now(), imageUrl });
    playMonsterJumpscare();
    monsterJumpscareTimerRef.current = window.setTimeout(() => {
      setMonsterJumpscare(null);
      clearTimer(monsterJumpscareTimerRef);
    }, 1000);
    setGameplayPhaseSafely("monster_attack");

    let nextLives = 0;
    setLives((current) => {
      nextLives = Math.max(current - 1, 0);
      return nextLives;
    });

    attackResolveTimerRef.current = window.setTimeout(() => {
      clearTimer(attackResolveTimerRef);
      if (nextLives <= 0) {
        clearGameplayTimers();
        setGameplayPhaseSafely("game_over");
        return;
      }

      if (gameplayPhaseRef.current !== "monster_attack") return;
      setGameplayPhaseSafely("exploring");
      scheduleMonsterAttack(false);
    }, PHASE_FLASH_MS);
  };

  const triggerDefenseSuccess = () => {
    clearTimer(attackTimerRef);
    clearTimer(warningTimerRef);
    clearTimer(attackResolveTimerRef);
    clearTimer(monsterJumpscareTimerRef);
    setPhoneDefenseMode(false);
    setShowDefenseHint(false);
    setPhonePanelScreen(null);
    setPhoneOn(false);
    setMonsterJumpscare(null);
    setGameplayPhaseSafely("defense_successful");

    defenseFlashTimerRef.current = window.setTimeout(() => {
      clearTimer(defenseFlashTimerRef);
      if (gameplayPhaseRef.current !== "defense_successful") return;
      setGameplayPhaseSafely("exploring");
      scheduleMonsterAttack(false);
    }, PHASE_FLASH_MS);
  };

  const startGameplay = () => {
    if (gameplayStartedRef.current) return;
    gameplayStartedRef.current = true;
    setGameplayStarted(true);
    setGameplayPhaseSafely("exploring");
    if (debugNoAttacksMode) return;
    window.setTimeout(() => {
      if (gameplayStartedRef.current && gameplayPhaseRef.current === "exploring") {
        scheduleMonsterAttack(true);
      }
    }, 0);
  };

  const collectBatteryPack = (packId: string) => {
    if (collectedPackIds.includes(packId)) return;
    setCollectedPackIds((current) => (current.includes(packId) ? current : [...current, packId]));
    setPacksCollected((current) => {
      const next = current + 1;
      if (next >= REQUIRED_PACKS) {
        clearGameplayTimers();
        setPhoneDefenseMode(false);
            setPhoneOn(false);
            setPhonePanelScreen(null);
            setGameplayPhaseSafely("day_complete");
            setMonsterJumpscare(null);
        }
        return next;
      });
    setPhoneChargeSeconds((current) => current + PACK_CHARGE_SECONDS);
  };

  const introActive = introPhase !== "active";
  const panelActive = phonePanelScreen !== null;
  const gameplayFrozen = gameplayPhase === "monster_attack" || gameplayPhase === "defense_successful";
  const gameplayFinished = gameplayPhase === "day_complete" || gameplayPhase === "game_over";
  const visiblePackCount = Math.min(Math.max(2, packsCollected + 2), REQUIRED_PACKS);
  const controlsLocked =
    panelActive ||
    introActive ||
    wakeDialogVisible ||
    postPhoneDialogueVisible ||
    postPhoneFollowupDialogueVisible ||
    doorDialogueVisible ||
    gameplayFrozen ||
    gameplayFinished;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyO") return;
      if (!isAwake || introPhase !== "active") return;
      if (
        gameplayStartedRef.current &&
        gameplayPhaseRef.current === "monster_warning" &&
        phoneInInventory &&
        phonePanelScreen === null &&
        phoneChargeSeconds >= DEFENSE_OPEN_COST_SECONDS
      ) {
        event.preventDefault();
        playPhoneOpenClick();
        setPhoneOn(true);
        setPhoneDefenseMode(true);
        setPhonePanelScreen("lock");
        setPhoneOpenHintVisible(false);
        setGameplayPhaseSafely("phone_unlock");
        return;
      }
      if (!phoneInInventory || panelActive) return;

      event.preventDefault();
      playPhoneOpenClick();
      setPhoneOn(true);
      setPhonePanelScreen("black");
      setPhoneOpenHintVisible(false);

      if (!hasOpenedInventoryPhone) {
        setHasOpenedInventoryPhone(true);
        setClosePhoneHintVisible(true);
        window.setTimeout(() => {
          setClosePhoneHintVisible(false);
        }, 4200);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasOpenedInventoryPhone, introPhase, isAwake, panelActive, phoneInInventory, phoneChargeSeconds, phonePanelScreen]);

  return (
    <main className="app-shell">
      <div className="scene-frame" data-testid="bedroom-canvas">
        <Canvas
          dpr={[0.7, 1.05]}
          gl={{ antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: true }}
          camera={{
            fov: 58,
            near: 0.05,
            far: 34,
            position: [-0.72, 1.14, 3.12],
            rotation: [(-7 * Math.PI) / 180, 0, 0],
          }}
          onPointerMissed={() => {
            if (isAwake) {
              if (phoneInInventory && phonePanelScreen) {
                if (phoneDefenseMode) return;
                playPhoneCloseClick();
                setPhonePanelScreen(null);
                setPhoneOn(false);
                return;
              }
              setPhoneSelected(false);
            }
          }}
          shadows
          onCreated={({ gl }) => {
            gl.setClearColor(new Color("#0b0f0f"));
          }}
        >
          <BedroomScene
            isAwake={isAwake}
            introPhase={introPhase}
            phoneOn={phoneOn}
            phoneUnlocked={phoneUnlocked}
            phonePanelActive={panelActive}
            phoneSelected={phoneSelected}
            phoneInInventory={phoneInInventory}
            gameplayStarted={gameplayStarted}
            visiblePackCount={visiblePackCount}
            collectedPackIds={collectedPackIds}
            doorOpen={doorOpen}
            onSelectPhone={() => {
              if (skipIntroUsed) {
                collectPhoneFromTable({ showFollowupDialogue: true, unlockMovement: true });
                return;
              }
              playPhoneTapClick();
              setPhoneSelected(true);
            }}
            onTurnOnPhone={() => {
              playPhoneOpenClick();
              setPhoneOn(true);
              setPhoneUnlocked(false);
              setPhonePanelScreen("lock");
            }}
            onPickupPhone={() => {
              collectPhoneFromTable({ showFollowupDialogue: skipIntroUsed, unlockMovement: skipIntroUsed });
            }}
            onCollectPack={collectBatteryPack}
            onEnterHallway={startGameplay}
            skipIntroUsed={skipIntroUsed}
            onToggleDoor={() => {
              setDoorInteractionTick((value) => value + 1);
              setDoorOpen((value) => {
                const next = !value;
                if (next && !doorDialogueShown) {
                  setDoorDialogueShown(true);
                  setDoorDialogueVisible(true);
                  window.setTimeout(() => {
                    setDoorDialogueVisible(false);
                  }, 4600);
                }
                return next;
              });
            }}
            inputLocked={controlsLocked}
            doorInteractionTick={doorInteractionTick}
            returnToPhoneTick={0}
          />
        </Canvas>
      </div>

      <div className="sleep-vignette" />
      {isAwake && introPhase === "active" && (
        <GameplayHud
          phase={gameplayPhase}
          lives={lives}
          packsCollected={packsCollected}
          packsRequired={REQUIRED_PACKS}
          phoneChargeSeconds={phoneChargeSeconds}
        />
      )}
      {debugNoAttacksMode && isAwake && introPhase === "active" && (
        <div className="debug-mode-badge" aria-live="polite">
          attacks disabled
        </div>
      )}

      {isAwake && introPhase === "active" && gameplayPhase === "monster_warning" && (
        <div className="gameplay-overlay gameplay-overlay-warning" aria-hidden="true" />
      )}
      {isAwake && introPhase === "active" && gameplayPhase === "phone_unlock" && (
        <div className="gameplay-overlay gameplay-overlay-defense" aria-hidden="true" />
      )}
      {isAwake && introPhase === "active" && gameplayPhase === "monster_attack" && (
        <div className="gameplay-overlay gameplay-overlay-attack" aria-hidden="true" />
      )}
      {isAwake && introPhase === "active" && gameplayPhase === "defense_successful" && (
        <div className="gameplay-overlay gameplay-overlay-success" aria-hidden="true" />
      )}
      {isAwake && introPhase === "active" && monsterJumpscare && (
        <div
          key={monsterJumpscare.id}
          className="monster-jumpscare-overlay"
          aria-hidden="true"
          style={{ backgroundImage: `url(${monsterJumpscare.imageUrl})` }}
        />
      )}

      {introPhase === "flicker" && <div className="intro-blackout intro-blackout-flicker" />}
      {introPhase === "pan" && <div className="intro-blackout intro-blackout-pan" />}

      {!isAwake && (
        <div className="start-overlay">
          <div id="landing-bg-music" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", opacity: 0 }} />
          <div className="start-intake">
            <p className="start-directive">enter your phone number (optional)</p>
            <input
              className="start-input"
              type="tel"
              inputMode="tel"
              placeholder="Phone number"
              value={playerPhoneNumber}
              onChange={(event) => setPlayerPhoneNumber(event.target.value)}
            />
            <p className="start-directive">upload your image (optional)</p>
            <label className="start-file">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setPlayerPhotoUrl((previous) => {
                    if (previous) URL.revokeObjectURL(previous);
                    return URL.createObjectURL(file);
                  });
                }}
              />
            </label>
          </div>
          <button
            className="wake-button"
            type="button"
            onClick={() => {
              setSkipIntroUsed(false);
              setIsAwake(true);
              setIntroPhase("flicker");
            }}
          >
            Open your eyes
          </button>
          <button className="wake-button skip-intro-button" type="button" onClick={skipIntroToPhonePickup}>
            Skip intro
          </button>
        </div>
      )}

      {isAwake && introPhase === "active" && wakeDialogVisible && (
        <div className="wake-line-dialog" aria-live="polite">
          ...where&apos;s my phone?
        </div>
      )}

      {isAwake && introPhase === "active" && postPhoneDialogueVisible && (
        <div className="post-phone-dialogue" aria-live="polite">
          what was that?? my phone won&apos;t turn on again... ugh whatever. I&apos;ve been scrolling for an hour
          already, let me get out of bed.
        </div>
      )}

      {isAwake && introPhase === "active" && postPhoneFollowupDialogueVisible && (
        <div className="post-phone-dialogue" aria-live="polite">
          I should take my phone with me just in case
        </div>
      )}

      {isAwake && introPhase === "active" && doorDialogueVisible && (
        <div className="post-phone-dialogue" aria-live="polite">
          I&apos;m hungry - let&apos;s make some breakfast in the kitchen
        </div>
      )}

      {isAwake && introPhase === "active" && !panelActive && !wakeDialogVisible && !phoneUnlocked && (
        <div className="look-hint" aria-hidden="true">
          Click and drag to look around
        </div>
      )}

      {isAwake && introPhase === "active" && !panelActive && phoneUnlocked && !phoneInInventory && (
        <div className="look-hint" aria-live="polite">
          use WASD to move • double click to interact
        </div>
      )}

      {isAwake && introPhase === "active" && phoneInInventory && phoneOpenHintVisible && !panelActive && (
        <div className="look-hint" aria-live="polite">
          press o to open phone • use WASD to move • double click to interact
        </div>
      )}

      {isAwake && introPhase === "active" && closePhoneHintVisible && panelActive && (
        <div className="phone-close-hint" aria-live="polite">
          click outside the phone to close
        </div>
      )}

      {e2eMode && isAwake && introPhase === "active" && (
        <>
          <button
            type="button"
            className="e2e-open-phone"
            style={{ top: 76 }}
            onClick={() => {
              if (skipIntroUsed) {
                collectPhoneFromTable({ showFollowupDialogue: true, unlockMovement: true });
                return;
              }
              playPhoneTapClick();
              setPhoneSelected(true);
            }}
          >
            Interact phone prop (e2e)
          </button>
          <button
            type="button"
            className="e2e-open-phone"
            onClick={() => {
              setPhoneOn(true);
              setPhoneUnlocked(true);
              setPhoneSelected(true);
              setPhonePanelScreen("home");
            }}
          >
            Open phone panel (e2e)
          </button>
          <button
            type="button"
            className="e2e-open-phone"
            style={{ top: 44 }}
            onClick={() => {
              playPhonePickupClick();
              setPhoneInInventory(true);
              setPhoneOn(false);
              setPhoneSelected(false);
              setPhonePanelScreen(null);
              setPhoneOpenHintVisible(true);
              void sendInventoryEvent("phone", "collected");
            }}
          >
            Collect phone (e2e)
          </button>
          <div className="e2e-gameplay-controls" aria-label="Gameplay state controls">
            <button type="button" onClick={() => setE2EGameplayPreset("exploring")}>
              Set exploring
            </button>
            <button type="button" onClick={() => setE2EGameplayPreset("monster_warning")}>
              Set warning
            </button>
            <button type="button" onClick={() => setE2EGameplayPreset("phone_unlock")}>
              Set unlock
            </button>
            <button type="button" onClick={() => setE2EGameplayPreset("monster_attack")}>
              Set attack
            </button>
            <button type="button" onClick={() => setE2EGameplayPreset("defense_successful")}>
              Set success
            </button>
            <button type="button" onClick={() => setE2EGameplayPreset("day_complete")}>
              Set win
            </button>
            <button type="button" onClick={() => setE2EGameplayPreset("game_over")}>
              Set lose
            </button>
          </div>
        </>
      )}

      {isAwake && phoneOn && phonePanelScreen && (
        <PhonePanelOverlay
          screen={phonePanelScreen}
          phoneNumber={playerPhoneNumber}
          lockscreenImageUrl={playerPhotoUrl}
          displayTime={phoneDisplayTime}
          isDefenseMode={phoneDefenseMode}
          showDefenseHint={showDefenseHint}
          onOpenSocial={() => {
            playPhoneTapClick();
            setPhonePanelScreen("social");
          }}
          onUnlock={() => {
            playPhoneUnlockClick();
            setPhoneUnlocked(true);
            setPhoneDefenseMode(false);
            setPhonePanelScreen("home");
            void sendUnlockText(playerPhoneNumber);
          }}
          onDefenseSuccess={() => {
            playPhoneUnlockClick();
            triggerDefenseSuccess();
          }}
          onCloseAndReturn={() => {
            if (phoneDefenseMode) return;
            playPhoneCloseClick();
            setPhoneDefenseMode(false);
            setPhonePanelScreen(null);
            setPhoneOn(false);
            setPhoneSelected(true);
            setPhoneDisplayTime((current) => advancePhoneTimeByHour(current));
            if (!postPhoneDialogueShown) {
              setPostPhoneDialogueShown(true);
              setPostPhoneDialogueVisible(true);
              window.setTimeout(() => {
                setPostPhoneDialogueVisible(false);
              }, 5600);
              window.setTimeout(() => {
                setPostPhoneFollowupDialogueVisible(true);
                window.setTimeout(() => {
                  setPostPhoneFollowupDialogueVisible(false);
                }, 4200);
              }, 7600);
            }
          }}
        />
      )}

      {isAwake && introPhase === "active" && gameplayFinished && (
        <div className="gameplay-finish-overlay" aria-live="polite">
          <div className="gameplay-finish-card">
            <div className="gameplay-finish-title">
              {gameplayPhase === "day_complete" ? "day complete" : "game over"}
            </div>
            <div className="gameplay-finish-copy">
              {gameplayPhase === "day_complete"
                ? "You got all six battery packs and made it through."
                : "The monster broke through your last life."}
            </div>
            <button
              type="button"
              className="wake-button gameplay-restart-button"
              onClick={() => window.location.reload()}
            >
              restart
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

async function sendUnlockText(phoneNumber: string) {
  const to = phoneNumber.trim();
  if (!to || !smsWebhookUrl) return;

  try {
    const payload = new URLSearchParams({
      To: to,
      Body: "wyd",
    });
    if (smsFromNumber) {
      payload.set("From", smsFromNumber);
    }

    const response = await fetch(smsWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: payload.toString(),
    });

    if (!response.ok) {
      console.warn("Failed to send unlock text:", response.status);
    }
  } catch (error) {
    console.warn("Failed to send unlock text:", error);
  }
}

async function sendInventoryEvent(item: string, action: string) {
  if (!inventoryWebhookUrl) return;

  try {
    const payload = new URLSearchParams({
      item,
      action,
    });

    const response = await fetch(inventoryWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: payload.toString(),
    });

    if (!response.ok) {
      console.warn("Failed to send inventory event:", response.status);
    }
  } catch (error) {
    console.warn("Failed to send inventory event:", error);
  }
}

export default App;

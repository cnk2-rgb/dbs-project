import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color } from "three";
import { BedroomScene } from "./components/BedroomScene";
import { PhonePanelOverlay, advancePhoneTimeByHour } from "./components/PhonePanelOverlay";
import {
  playPhoneCloseClick,
  playPhoneOpenClick,
  playPhonePickupClick,
  playPhoneTapClick,
  playPhoneUnlockClick,
} from "./lib/audio";
import type { IntroPhase, PhonePanelScreen, YouTubePlayer } from "./types/app";
const smsWebhookUrl = (import.meta.env.VITE_SMS_WEBHOOK_URL ?? "").trim();
const smsFromNumber = (import.meta.env.VITE_TWILIO_FROM_NUMBER ?? "").trim();
const inventoryWebhookUrl = (import.meta.env.VITE_INVENTORY_WEBHOOK_URL ?? "").trim();

function App() {
  const e2eMode = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("e2e") === "1";
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
  const [phoneInInventory, setPhoneInInventory] = useState(false);
  const [phoneOpenHintVisible, setPhoneOpenHintVisible] = useState(false);
  const [closePhoneHintVisible, setClosePhoneHintVisible] = useState(false);
  const [hasOpenedInventoryPhone, setHasOpenedInventoryPhone] = useState(false);
  const [skipIntroUsed, setSkipIntroUsed] = useState(false);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const youtubeReadyRef = useRef(false);

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
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            youtubeReadyRef.current = true;
            if (!isAwake) {
              youtubePlayerRef.current?.unMute();
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
    youtubePlayerRef.current.unMute();
    youtubePlayerRef.current.playVideo();
  }, [isAwake]);

  useEffect(() => {
    const onFirstInteraction = () => {
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

  const introActive = introPhase !== "active";
  const panelActive = phonePanelScreen !== null;
  const controlsLocked =
    panelActive || introActive || wakeDialogVisible || postPhoneDialogueVisible || postPhoneFollowupDialogueVisible || doorDialogueVisible;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyO") return;
      if (!isAwake || introPhase !== "active") return;
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
  }, [hasOpenedInventoryPhone, introPhase, isAwake, panelActive, phoneInInventory]);

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
            skipIntroUsed={skipIntroUsed}
            onToggleDoor={() => {
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
            returnToPhoneTick={0}
          />
        </Canvas>
      </div>

      <div className="sleep-vignette" />

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
        </>
      )}

      {isAwake && phoneOn && phonePanelScreen && (
        <PhonePanelOverlay
          screen={phonePanelScreen}
          phoneNumber={playerPhoneNumber}
          lockscreenImageUrl={playerPhotoUrl}
          displayTime={phoneDisplayTime}
          onOpenSocial={() => {
            playPhoneTapClick();
            setPhonePanelScreen("social");
          }}
          onUnlock={() => {
            playPhoneUnlockClick();
            setPhoneUnlocked(true);
            setPhonePanelScreen("home");
            void sendUnlockText(playerPhoneNumber);
          }}
          onCloseAndReturn={() => {
            playPhoneCloseClick();
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

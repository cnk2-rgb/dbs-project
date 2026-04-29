import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import {
  CanvasTexture,
  Color,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
} from "three";

const pointerSensitivity = 0.002;
const touchSensitivity = 0.004;
const horizontalGazeLimit = MathUtils.degToRad(180);
const minPitch = MathUtils.degToRad(-42);
const maxPitch = MathUtils.degToRad(20);
const panelFocusPitch = MathUtils.degToRad(78);
const fixedHeadPosition = new Vector3(-0.72, 1.14, 3.12);
const phoneModelPath = "/models/phone-quaternius-public-domain.glb";
const worldUp = new Vector3(0, 1, 0);
const standingEyeHeight = 1.64;
const bedExitDistance = 0.48;
const socialImagePool = [
  "/social-samples/01.jpg",
  "/social-samples/02.jpg",
  "/social-samples/03.jpg",
  "/social-samples/04.jpg",
  "/social-samples/05.jpg",
  "/social-samples/06.jpg",
];

type DragState = {
  active: boolean;
  x: number;
  y: number;
};

type IntroPhase = "asleep" | "flicker" | "pan" | "active";
type PhonePanelScreen = "lock" | "home" | "social" | "black" | null;
type YouTubePlayer = {
  playVideo: () => void;
  stopVideo: () => void;
  mute: () => void;
  unMute: () => void;
};
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
            position: fixedHeadPosition,
            rotation: [MathUtils.degToRad(-7), 0, 0],
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
          ... I should take my phone with me just in case
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
          press o to open phone
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

function BedroomScene({
  isAwake,
  introPhase,
  phoneOn,
  phoneUnlocked,
  phonePanelActive,
  phoneSelected,
  phoneInInventory,
  doorOpen,
  onSelectPhone,
  onTurnOnPhone,
  onPickupPhone,
  skipIntroUsed,
  onToggleDoor,
  inputLocked,
  returnToPhoneTick,
}: {
  isAwake: boolean;
  introPhase: IntroPhase;
  phoneOn: boolean;
  phoneUnlocked: boolean;
  phonePanelActive: boolean;
  phoneSelected: boolean;
  phoneInInventory: boolean;
  doorOpen: boolean;
  onSelectPhone: () => void;
  onTurnOnPhone: () => void;
  onPickupPhone: () => void;
  skipIntroUsed: boolean;
  onToggleDoor: () => void;
  inputLocked: boolean;
  returnToPhoneTick: number;
}) {
  return (
    <>
      <color attach="background" args={["#0b0f0f"]} />
      <fog attach="fog" args={["#0b0f0f", 6.5, 19]} />
      <LookOnlyCamera
        enabled={isAwake}
        canMove={phoneUnlocked}
        inputLocked={inputLocked}
        introPhase={introPhase}
        phonePanelActive={phonePanelActive}
        returnToPhoneTick={returnToPhoneTick}
      />
      <hemisphereLight intensity={0.46} color="#9fb4ba" groundColor="#1d1612" />
      <ambientLight intensity={0.3} color="#879ba5" />
      <directionalLight
        position={[-2.2, 3.2, 1.8]}
        intensity={0.78}
        color="#8091a0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-2.85, 1.15, -2.3]} intensity={3.8} color="#8fb7c6" distance={6.8} decay={2} />
      <pointLight position={[2.3, 2.2, -1.7]} intensity={1.05} color="#bad6df" distance={8} decay={2} />
      <pointLight position={[0, 1.2, 2.05]} intensity={1.15} color="#7f9495" distance={3.5} decay={2.3} />

      <RoomShell doorOpen={doorOpen} onToggleDoor={onToggleDoor} />
      <HallwayWing />
      <Bed />
      <Furniture
        phoneOn={phoneOn}
        phoneSelected={phoneSelected}
        phoneInInventory={phoneInInventory}
        onSelectPhone={onSelectPhone}
        onTurnOnPhone={onTurnOnPhone}
        onPickupPhone={onPickupPhone}
        disablePhoneAutoOpen={skipIntroUsed}
      />
      <ScareDetails />

      <EffectComposer multisampling={0}>
        <Vignette eskil={false} offset={0.38} darkness={0.34} />
      </EffectComposer>
    </>
  );
}

function LookOnlyCamera({
  enabled,
  canMove,
  inputLocked,
  introPhase,
  phonePanelActive,
  returnToPhoneTick,
}: {
  enabled: boolean;
  canMove: boolean;
  inputLocked: boolean;
  introPhase: IntroPhase;
  phonePanelActive: boolean;
  returnToPhoneTick: number;
}) {
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(MathUtils.degToRad(-14));
  const targetYaw = useRef(0);
  const targetPitch = useRef(MathUtils.degToRad(-14));
  const drag = useRef<DragState>({ active: false, x: 0, y: 0 });
  const position = useRef(fixedHeadPosition.clone());
  const movement = useRef({ forward: false, backward: false, left: false, right: false });
  const forwardDirection = useRef(new Vector3());
  const rightDirection = useRef(new Vector3());
  const returnCameraUntil = useRef(0);

  useEffect(() => {
    if (returnToPhoneTick <= 0) return;
    returnCameraUntil.current = performance.now() + 2200;
  }, [returnToPhoneTick]);

  useFrame((_, delta) => {
    const now = performance.now();
    const returnCameraActive = now < returnCameraUntil.current;
    if (introPhase === "flicker") {
      targetYaw.current = 0;
      targetPitch.current = maxPitch;
    } else if (introPhase === "pan") {
      targetYaw.current = MathUtils.lerp(targetYaw.current, 0, 0.016);
      targetPitch.current = MathUtils.lerp(targetPitch.current, MathUtils.degToRad(-14), 0.016);
    }

    if (!enabled) {
      targetYaw.current += (Math.sin(performance.now() * 0.00025) * 0.055 - targetYaw.current) * 0.012;
      targetPitch.current += (MathUtils.degToRad(-14) - targetPitch.current) * 0.02;
    }

    yaw.current = MathUtils.lerp(yaw.current, targetYaw.current, 0.1);
    pitch.current = MathUtils.lerp(pitch.current, targetPitch.current, 0.1);
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;
    camera.rotation.z = Math.sin(performance.now() * 0.00042) * 0.006;

    if (!enabled || inputLocked) {
      movement.current = { forward: false, backward: false, left: false, right: false };
      if (introPhase === "flicker") {
        position.current.copy(fixedHeadPosition);
      } else if (phonePanelActive) {
        position.current.lerp(fixedHeadPosition, 0.12);
        targetYaw.current = MathUtils.lerp(targetYaw.current, 0, 0.12);
        targetPitch.current = MathUtils.lerp(targetPitch.current, panelFocusPitch, 0.12);
      } else if (returnCameraActive) {
        position.current.lerp(fixedHeadPosition, 0.08);
        targetYaw.current = MathUtils.lerp(targetYaw.current, 0, 0.08);
        targetPitch.current = MathUtils.lerp(targetPitch.current, MathUtils.degToRad(-14), 0.08);
      } else {
        position.current.lerp(fixedHeadPosition, 0.05);
      }
      if (introPhase !== "flicker" && introPhase !== "pan" && !returnCameraActive) {
        targetYaw.current = MathUtils.lerp(targetYaw.current, 0, 0.1);
        targetPitch.current = MathUtils.lerp(targetPitch.current, MathUtils.degToRad(-14), 0.1);
      }
    } else if (!canMove) {
      movement.current = { forward: false, backward: false, left: false, right: false };
      position.current.copy(fixedHeadPosition);
    } else {
      const movementVector = new Vector3();
      const movementSpeed = 1.55;

      camera.getWorldDirection(forwardDirection.current);
      forwardDirection.current.y = 0;
      if (forwardDirection.current.lengthSq() > 0.00001) {
        forwardDirection.current.normalize();
      } else {
        forwardDirection.current.set(Math.sin(yaw.current), 0, -Math.cos(yaw.current));
      }
      rightDirection.current.crossVectors(forwardDirection.current, worldUp).normalize();

      if (movement.current.forward) {
        movementVector.add(forwardDirection.current);
      }
      if (movement.current.backward) {
        movementVector.sub(forwardDirection.current);
      }
      if (movement.current.right) {
        movementVector.add(rightDirection.current);
      }
      if (movement.current.left) {
        movementVector.sub(rightDirection.current);
      }

      if (movementVector.lengthSq() > 0) {
        movementVector.normalize().multiplyScalar(movementSpeed * delta);
        position.current.add(movementVector);
        constrainPlayerPosition(position.current);
      }

      const distanceFromBed = Math.hypot(
        position.current.x - fixedHeadPosition.x,
        position.current.z - fixedHeadPosition.z,
      );
      const targetHeight = distanceFromBed > bedExitDistance ? standingEyeHeight : fixedHeadPosition.y;
      position.current.y = MathUtils.lerp(position.current.y, targetHeight, 0.1);
    }

    camera.position.copy(position.current);
  });

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerMove = (event: PointerEvent) => {
      if (!enabled || inputLocked) return;

      if (!drag.current.active) return;

      targetYaw.current -= (event.clientX - drag.current.x) * pointerSensitivity;
      targetPitch.current -= (event.clientY - drag.current.y) * pointerSensitivity;
      drag.current = { active: true, x: event.clientX, y: event.clientY };

      clampGaze(targetYaw, targetPitch);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!enabled || inputLocked) return;
      drag.current = { active: true, x: event.clientX, y: event.clientY };
    };

    const onPointerUp = () => {
      drag.current.active = false;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!enabled || inputLocked || event.touches.length !== 1) return;
      const touch = event.touches[0];

      if (drag.current.active) {
        targetYaw.current -= (touch.clientX - drag.current.x) * touchSensitivity;
        targetPitch.current -= (touch.clientY - drag.current.y) * touchSensitivity;
      }

      drag.current = { active: true, x: touch.clientX, y: touch.clientY };
      clampGaze(targetYaw, targetPitch);
    };

    const onTouchEnd = () => {
      drag.current.active = false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!enabled || inputLocked || !canMove) return;
      if (event.code === "KeyW" || event.code === "ArrowUp") movement.current.forward = true;
      if (event.code === "KeyS" || event.code === "ArrowDown") movement.current.backward = true;
      if (event.code === "KeyA" || event.code === "ArrowLeft") movement.current.left = true;
      if (event.code === "KeyD" || event.code === "ArrowRight") movement.current.right = true;
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "KeyW" || event.code === "ArrowUp") movement.current.forward = false;
      if (event.code === "KeyS" || event.code === "ArrowDown") movement.current.backward = false;
      if (event.code === "KeyA" || event.code === "ArrowLeft") movement.current.left = false;
      if (event.code === "KeyD" || event.code === "ArrowRight") movement.current.right = false;
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [enabled, canMove, inputLocked, introPhase, phonePanelActive, gl.domElement]);

  return null;
}

function RoomShell({ doorOpen, onToggleDoor }: { doorOpen: boolean; onToggleDoor: () => void }) {
  const floorMaterial = useRoughMaterial("#252626", "#161716", 0.82, "concrete");
  const wallMaterial = useRoughMaterial("#202221", "#111514", 0.76, "paint");
  const ceilingMaterial = useRoughMaterial("#181a19", "#0b0d0c", 0.68, "paint");
  const rugMaterial = useRoughMaterial("#15100f", "#080606", 0.96, "fabric");

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 8, 24, 24]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      <mesh position={[0, 2.25, -4]} receiveShadow>
        <boxGeometry args={[7, 4.5, 0.18, 16, 10, 1]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      <mesh position={[-3.5, 2.25, -3]} receiveShadow>
        <boxGeometry args={[0.18, 4.5, 2.0, 1, 10, 8]} />
        <primitive object={wallMaterial.clone()} attach="material" />
      </mesh>

      <mesh position={[-3.5, 2.25, 1.6]} receiveShadow>
        <boxGeometry args={[0.18, 4.5, 4.8, 1, 10, 8]} />
        <primitive object={wallMaterial.clone()} attach="material" />
      </mesh>

      <mesh position={[-3.5, 3.35, -1.4]} receiveShadow>
        <boxGeometry args={[0.18, 2.3, 1.2, 1, 6, 4]} />
        <primitive object={wallMaterial.clone()} attach="material" />
      </mesh>

      <mesh position={[3.5, 2.25, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[8, 4.5, 0.18, 16, 10, 1]} />
        <primitive object={wallMaterial.clone()} attach="material" />
      </mesh>

      <mesh position={[0, 4.45, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 8, 10, 12]} />
        <primitive object={ceilingMaterial} attach="material" />
      </mesh>

      <mesh position={[0.2, 0.025, 0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.9, 2.1, 6, 6]} />
        <primitive object={rugMaterial} attach="material" />
      </mesh>

      <FloorSeams />
      <Baseboards />
      <Window />
      <Door open={doorOpen} onToggle={onToggleDoor} />
      <CeilingLight />
    </group>
  );
}

function HallwayWing() {
  const hallwaySurface = useRoughMaterial("#1c2429", "#0a0f13", 0.84, "concrete");
  const hallwayWall = useRoughMaterial("#202b31", "#0b1116", 0.76, "paint");
  const hallwayCeiling = useRoughMaterial("#1a2329", "#090e12", 0.74, "paint");
  const kitchenCabinet = useRoughMaterial("#dad4c8", "#5f5a50", 0.62, "wood");
  const kitchenCounter = useRoughMaterial("#c6c1b5", "#6c6558", 0.52, "concrete");
  const kitchenMetal = useRoughMaterial("#9ea6ad", "#394149", 0.28, "none");
  const kitchenDark = useRoughMaterial("#2a2f34", "#0a0d10", 0.46, "none");
  const kitchenWood = useRoughMaterial("#9a7f61", "#3e2c1e", 0.78, "wood");

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-7.9, 0.01, -1.4]} receiveShadow>
        <planeGeometry args={[8.8, 2.4, 16, 4]} />
        <primitive object={hallwaySurface} attach="material" />
      </mesh>

      <mesh position={[-5.525, 2.1, -2.6]} receiveShadow>
        <boxGeometry args={[4.05, 4.2, 0.14]} />
        <primitive object={hallwayWall} attach="material" />
      </mesh>
      <mesh position={[-9.575, 2.1, -2.6]} receiveShadow>
        <boxGeometry args={[0.85, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>

      <mesh position={[-8.95, 2.1, -0.2]} receiveShadow>
        <boxGeometry args={[2.1, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh position={[-4.9, 2.1, -0.2]} receiveShadow>
        <boxGeometry args={[2.8, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>

      <mesh position={[-12.28, 2.1, -1.4]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 2.4]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>

      <mesh position={[-9.98, 2.1, -1.4]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 2.4]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-7.9, 4.2, -1.4]} receiveShadow>
        <planeGeometry args={[8.8, 2.4, 8, 2]} />
        <primitive object={hallwayCeiling} attach="material" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8.35, 0.01, -4.1]} receiveShadow>
        <planeGeometry args={[4.6, 4.4, 10, 10]} />
        <primitive object={hallwaySurface.clone()} attach="material" />
      </mesh>
      <mesh position={[-8.35, 2.1, -6.3]} receiveShadow>
        <boxGeometry args={[4.6, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh position={[-10.65, 2.1, -4.1]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 4.4]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh position={[-6.05, 2.1, -4.1]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 4.4]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-8.35, 4.2, -4.1]} receiveShadow>
        <planeGeometry args={[4.6, 4.4, 6, 6]} />
        <primitive object={hallwayCeiling.clone()} attach="material" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8.35, 0.01, 1.3]} receiveShadow>
        <planeGeometry args={[4.6, 4.4, 10, 10]} />
        <primitive object={hallwaySurface.clone()} attach="material" />
      </mesh>
      <mesh position={[-8.35, 2.1, 3.5]} receiveShadow>
        <boxGeometry args={[4.6, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh position={[-10.65, 2.1, 1.3]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 4.4]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh position={[-6.05, 2.1, 1.3]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 4.4]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-8.35, 4.2, 1.3]} receiveShadow>
        <planeGeometry args={[4.6, 4.4, 6, 6]} />
        <primitive object={hallwayCeiling.clone()} attach="material" />
      </mesh>

      <pointLight position={[-6.5, 2.35, -1.35]} intensity={0.88} color="#86adc0" distance={8.6} decay={2} />
      <pointLight position={[-8.45, 2.1, -4.05]} intensity={0.56} color="#78a0bb" distance={5.5} decay={2} />
      <pointLight position={[-8.45, 2.1, 1.35]} intensity={0.56} color="#78a0bb" distance={5.5} decay={2} />
      <pointLight position={[-7.2, 2.05, -1.35]} intensity={0.46} color="#6b90a7" distance={6.8} decay={2} />
      <pointLight position={[-8.25, 2.55, 1.45]} intensity={1.65} color="#ffe3ba" distance={7.2} decay={1.8} />
      <pointLight position={[-8.35, 2.9, 1.4]} intensity={7.5} color="#fff6de" distance={11} decay={1.35} />
      <pointLight position={[-8.35, 1.1, 1.2]} intensity={3.6} color="#fff0cf" distance={8.5} decay={1.2} />
      <rectAreaLight
        position={[-8.35, 3.85, 1.25]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={2.6}
        height={1.8}
        intensity={18}
        color="#fff8e6"
      />

      <group position={[-8.35, 0, 1.75]}>
        <mesh position={[-1.34, 0.48, -0.52]} castShadow receiveShadow>
          <boxGeometry args={[0.56, 0.96, 0.62]} />
          <primitive object={kitchenCabinet.clone()} attach="material" />
        </mesh>
        <mesh position={[-1.34, 1.02, -0.52]} castShadow receiveShadow>
          <boxGeometry args={[0.58, 0.12, 0.66]} />
          <primitive object={kitchenCounter.clone()} attach="material" />
        </mesh>
        <mesh position={[-1.34, 0.95, -0.52]} castShadow>
          <boxGeometry args={[0.38, 0.08, 0.38]} />
          <primitive object={kitchenDark.clone()} attach="material" />
        </mesh>
        <mesh position={[-1.34, 0.86, -0.52]} castShadow>
          <boxGeometry args={[0.1, 0.12, 0.1]} />
          <primitive object={kitchenDark.clone()} attach="material" />
        </mesh>

        <mesh position={[-0.72, 0.48, -0.52]} castShadow receiveShadow>
          <boxGeometry args={[0.64, 0.96, 0.62]} />
          <primitive object={kitchenCabinet.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.72, 1.02, -0.52]} castShadow receiveShadow>
          <boxGeometry args={[0.68, 0.12, 0.66]} />
          <primitive object={kitchenCounter.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.72, 0.96, -0.52]} castShadow receiveShadow>
          <boxGeometry args={[0.38, 0.06, 0.24]} />
          <primitive object={kitchenMetal.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.72, 0.88, -0.52]} castShadow>
          <boxGeometry args={[0.08, 0.2, 0.08]} />
          <primitive object={kitchenMetal.clone()} attach="material" />
        </mesh>

        <mesh position={[-0.02, 0.44, -0.52]} castShadow receiveShadow>
          <boxGeometry args={[0.72, 0.88, 0.62]} />
          <primitive object={kitchenCabinet.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.02, 0.96, -0.52]} castShadow receiveShadow>
          <boxGeometry args={[0.74, 0.1, 0.66]} />
          <primitive object={kitchenCounter.clone()} attach="material" />
        </mesh>

        <mesh position={[0.16, 0.46, 0.72]} castShadow receiveShadow>
          <boxGeometry args={[1.46, 0.1, 0.92]} />
          <primitive object={kitchenWood.clone()} attach="material" />
        </mesh>
        <mesh position={[0.16, 0.23, 0.4]} castShadow>
          <boxGeometry args={[0.09, 0.46, 0.09]} />
          <primitive object={kitchenDark.clone()} attach="material" />
        </mesh>
        <mesh position={[0.16, 0.23, 1.04]} castShadow>
          <boxGeometry args={[0.09, 0.46, 0.09]} />
          <primitive object={kitchenDark.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.42, 0.23, 0.4]} castShadow>
          <boxGeometry args={[0.09, 0.46, 0.09]} />
          <primitive object={kitchenDark.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.42, 0.23, 1.04]} castShadow>
          <boxGeometry args={[0.09, 0.46, 0.09]} />
          <primitive object={kitchenDark.clone()} attach="material" />
        </mesh>

        <KitchenChair position={[1.02, 0, 0.42]} rotation={-0.22} />
        <KitchenChair position={[1.02, 0, 0.96]} rotation={-0.12} />
        <KitchenChair position={[-0.96, 0, 0.44]} rotation={0.12} />
        <KitchenChair position={[-0.96, 0, 0.96]} rotation={0.18} />
      </group>
    </group>
  );
}

function KitchenChair({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  const wood = useRoughMaterial("#886f55", "#302114", 0.82, "wood");
  const dark = useRoughMaterial("#2a2f33", "#090c0f", 0.84, "none");

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.05, 0.34]} />
        <primitive object={wood} attach="material" />
      </mesh>
      <mesh position={[0, 0.53, -0.14]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.58, 0.05]} />
        <primitive object={wood.clone()} attach="material" />
      </mesh>
      <mesh position={[0.13, 0.12, 0.13]} castShadow>
        <boxGeometry args={[0.05, 0.24, 0.05]} />
        <primitive object={dark} attach="material" />
      </mesh>
      <mesh position={[-0.13, 0.12, 0.13]} castShadow>
        <boxGeometry args={[0.05, 0.24, 0.05]} />
        <primitive object={dark.clone()} attach="material" />
      </mesh>
      <mesh position={[0.13, 0.12, -0.13]} castShadow>
        <boxGeometry args={[0.05, 0.24, 0.05]} />
        <primitive object={dark.clone()} attach="material" />
      </mesh>
      <mesh position={[-0.13, 0.12, -0.13]} castShadow>
        <boxGeometry args={[0.05, 0.24, 0.05]} />
        <primitive object={dark.clone()} attach="material" />
      </mesh>
    </group>
  );
}

function Bed() {
  const frame = useRoughMaterial("#181412", "#0a0808", 0.76, "wood");
  const mattress = useRoughMaterial("#7c776d", "#36332f", 0.96, "fabric");
  const blanket = useRoughMaterial("#2a3431", "#0d1211", 0.98, "fabric");

  return (
    <group position={[0, 0, 2.55]}>
      <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.72, 0.24, 2.75, 8, 2, 8]} />
        <primitive object={mattress} attach="material" />
      </mesh>

      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.94, 0.25, 2.95]} />
        <primitive object={frame} attach="material" />
      </mesh>

      <mesh position={[0, 0.56, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.76, 0.18, 2.76, 12, 2, 12]} />
        <primitive object={blanket} attach="material" />
      </mesh>

      <mesh position={[0, 1.08, 1.48]} castShadow receiveShadow>
        <boxGeometry args={[2.02, 1.25, 0.22, 10, 6, 1]} />
        <primitive object={frame.clone()} attach="material" />
      </mesh>
    </group>
  );
}

function Furniture({
  phoneOn,
  phoneSelected,
  phoneInInventory,
  onSelectPhone,
  onTurnOnPhone,
  onPickupPhone,
  disablePhoneAutoOpen,
}: {
  phoneOn: boolean;
  phoneSelected: boolean;
  phoneInInventory: boolean;
  onSelectPhone: () => void;
  onTurnOnPhone: () => void;
  onPickupPhone: () => void;
  disablePhoneAutoOpen: boolean;
}) {
  const wood = useRoughMaterial("#2a211b", "#0d0a08", 0.88, "wood");
  const darkMetal = useRoughMaterial("#111415", "#050606", 0.8);
  const paper = useRoughMaterial("#504940", "#1d1a17", 0.9, "paper");

  return (
    <group>
      <group position={[-2.45, 0, -2.35]}>
        <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.45, 0.14, 0.72]} />
          <primitive object={wood} attach="material" />
        </mesh>
        <mesh position={[-0.58, 0.23, -0.22]} castShadow>
          <boxGeometry args={[0.12, 0.46, 0.12]} />
          <primitive object={darkMetal} attach="material" />
        </mesh>
        <mesh position={[0.58, 0.23, -0.22]} castShadow>
          <boxGeometry args={[0.12, 0.46, 0.12]} />
          <primitive object={darkMetal.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.58, 0.23, 0.22]} castShadow>
          <boxGeometry args={[0.12, 0.46, 0.12]} />
          <primitive object={darkMetal.clone()} attach="material" />
        </mesh>
        <mesh position={[0.58, 0.23, 0.22]} castShadow>
          <boxGeometry args={[0.12, 0.46, 0.12]} />
          <primitive object={darkMetal.clone()} attach="material" />
        </mesh>
        <mesh position={[0.28, 0.55, 0]} rotation={[-Math.PI / 2, 0, -0.12]} castShadow>
          <boxGeometry args={[0.42, 0.72, 0.025]} />
          <primitive object={paper} attach="material" />
        </mesh>
      </group>

      <group position={[2.86, 0, -1.25]}>
        <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 3.1, 0.32]} />
          <primitive object={wood.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.02, 0.12, 0.36]} />
          <primitive object={wood.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 1.38, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.02, 0.12, 0.36]} />
          <primitive object={wood.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 2.16, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.02, 0.12, 0.36]} />
          <primitive object={wood.clone()} attach="material" />
        </mesh>
        <BookStack position={[-0.22, 0.78, 0.01]} />
        <BookStack position={[0.18, 1.56, 0.02]} rotation={0.05} />
        <mesh position={[0.18, 2.38, 0.02]} castShadow>
          <sphereGeometry args={[0.13, 10, 8]} />
          <meshStandardMaterial color="#1c1715" roughness={0.97} metalness={0.02} />
        </mesh>
      </group>

      <group position={[-1.38, 0, 3.12]}>
        <mesh position={[0, 0.31, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.54, 0.48, 0.48]} />
          <primitive object={wood.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 0.585, 0.01]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.07, 0.52]} />
          <primitive object={wood.clone()} attach="material" />
        </mesh>
        {!phoneInInventory && (
          <Suspense fallback={null}>
            <SmallPhone
              selected={phoneSelected}
              poweredOn={phoneOn}
              disableAutoOpen={disablePhoneAutoOpen}
              onSelect={onSelectPhone}
              onTurnOn={onTurnOnPhone}
              onPickup={onPickupPhone}
            />
          </Suspense>
        )}
      </group>
    </group>
  );
}

function FloorSeams() {
  const seam = useRoughMaterial("#101211", "#000000", 0.92, "none");

  return (
    <group>
      {[-2.1, -0.7, 0.7, 2.1].map((x) => (
        <mesh key={`x-${x}`} position={[x, 0.034, 0]} receiveShadow>
          <boxGeometry args={[0.018, 0.01, 8]} />
          <primitive object={seam.clone()} attach="material" />
        </mesh>
      ))}
      {[-2.4, -1.2, 0, 1.2, 2.4].map((z) => (
        <mesh key={`z-${z}`} position={[0, 0.036, z]} receiveShadow>
          <boxGeometry args={[7, 0.01, 0.018]} />
          <primitive object={seam.clone()} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

function Baseboards() {
  const trim = useRoughMaterial("#181411", "#070504", 0.86, "wood");

  return (
    <group>
      <mesh position={[0, 0.18, -3.88]} castShadow receiveShadow>
        <boxGeometry args={[6.86, 0.18, 0.08]} />
        <primitive object={trim} attach="material" />
      </mesh>
      <mesh position={[-3.38, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.18, 7.78]} />
        <primitive object={trim.clone()} attach="material" />
      </mesh>
      <mesh position={[3.38, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.18, 7.78]} />
        <primitive object={trim.clone()} attach="material" />
      </mesh>
    </group>
  );
}

function SmallPhone({
  selected,
  poweredOn,
  onSelect,
  onTurnOn,
  onPickup,
  disableAutoOpen,
}: {
  selected: boolean;
  poweredOn: boolean;
  onSelect: () => void;
  onTurnOn: () => void;
  onPickup: () => void;
  disableAutoOpen: boolean;
}) {
  const { scene } = useGLTF(phoneModelPath);
  const [hovered, setHovered] = useState(false);
  const autoOpenUsed = useRef(false);

  useEffect(() => {
    if (disableAutoOpen || !hovered || poweredOn || autoOpenUsed.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      autoOpenUsed.current = true;
      onTurnOn();
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [disableAutoOpen, hovered, poweredOn, onTurnOn]);

  const lockscreenTexture = useMemo(() => createLockscreenTexture(), []);
  const screenOffMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#020304",
        roughness: 0.2,
        metalness: 0.08,
        emissive: "#02080b",
        emissiveIntensity: 0.07,
      }),
    [],
  );
  const screenOnMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#ffffff",
        map: lockscreenTexture,
        roughness: 0.16,
        metalness: 0.03,
        emissive: "#214048",
        emissiveIntensity: 0.22,
      }),
    [lockscreenTexture],
  );
  const phone = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((object) => {
      if (!(object instanceof Mesh)) return;

      object.castShadow = true;
      object.receiveShadow = true;

      const materials = Array.isArray(object.material)
        ? object.material.map((material) => material.clone())
        : object.material.clone();

      object.material = materials;

      const materialList = Array.isArray(materials) ? materials : [materials];
      for (const material of materialList) {
        if (!(material instanceof MeshStandardMaterial)) continue;

        if (material.name.toLowerCase().includes("black")) {
          material.roughness = 0.18;
          material.metalness = 0.08;
          material.emissive.set("#071719");
          material.emissiveIntensity = 0.18;
        }
      }
    });

    return clone;
  }, [scene]);

  return (
    <group
      position={[0.13, 0.635, 0.09]}
      rotation={[-Math.PI / 2, 0, MathUtils.degToRad(-14)]}
      scale={0.18}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        if (!selected) {
          onSelect();
        }
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onPickup();
      }}
    >
      <primitive object={phone} />
      <mesh position={[0, 0, 0.062]} rotation={[0, 0, poweredOn ? Math.PI : 0]}>
        <planeGeometry args={[0.36, 0.69]} />
        <primitive object={poweredOn ? screenOnMaterial : screenOffMaterial} attach="material" />
      </mesh>
      <pointLight
        position={[0, 0.03, 0.03]}
        intensity={poweredOn ? 0.24 : hovered || selected ? 0.2 : 0.06}
        color={poweredOn ? "#6db7d9" : "#4fb5c6"}
        distance={0.52}
        decay={2}
      />
    </group>
  );
}

useGLTF.preload(phoneModelPath);

function ScareDetails() {
  const frame = useRoughMaterial("#110f0d", "#050403", 0.85);
  const cloth = useRoughMaterial("#171414", "#070606", 1);
  const stalePaper = useRoughMaterial("#403a34", "#171411", 0.9);

  return (
    <group>
      <group position={[0.55, 1.85, -3.9]} rotation={[0, 0, -0.02]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.9, 0.08]} />
          <primitive object={frame} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[0.52, 0.68, 8, 8]} />
          <primitive object={stalePaper} attach="material" />
        </mesh>
        <mesh position={[0, 0.07, 0.075]}>
          <sphereGeometry args={[0.12, 10, 8]} />
          <meshStandardMaterial color="#16110f" roughness={0.98} />
        </mesh>
        <mesh position={[-0.042, 0.09, 0.155]}>
          <sphereGeometry args={[0.012, 8, 6]} />
          <meshBasicMaterial color="#bec7b8" />
        </mesh>
        <mesh position={[0.046, 0.09, 0.155]}>
          <sphereGeometry args={[0.012, 8, 6]} />
          <meshBasicMaterial color="#bec7b8" />
        </mesh>
      </group>

      <mesh position={[-1.75, 1.12, -3.78]} rotation={[0, 0, 0.08]} castShadow>
        <planeGeometry args={[0.88, 1.3, 6, 6]} />
        <primitive object={cloth} attach="material" />
      </mesh>

      <mesh position={[1.9, 1.2, -3.86]} rotation={[0, 0, -0.05]}>
        <planeGeometry args={[0.68, 0.44]} />
        <meshStandardMaterial color="#0a0d0d" roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  );
}

function Window() {
  const frame = useRoughMaterial("#0f1111", "#020202", 0.86, "wood");
  const glass = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#101819",
        roughness: 0.74,
        metalness: 0.05,
        transparent: true,
        opacity: 0.52,
        emissive: "#071011",
        emissiveIntensity: 0.12,
      }),
    [],
  );

  return (
    <group position={[2.4, 2.15, -3.89]}>
      <mesh castShadow>
        <boxGeometry args={[1.25, 1.1, 0.08]} />
        <primitive object={frame} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[1.02, 0.86, 4, 4]} />
        <primitive object={glass} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[0.025, 0.88]} />
        <meshBasicMaterial color="#0b0d0d" />
      </mesh>
      <mesh position={[0, 0, 0.095]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[0.025, 1.02]} />
        <meshBasicMaterial color="#0b0d0d" />
      </mesh>
      <mesh position={[0, -0.63, 0.12]} castShadow receiveShadow>
        <boxGeometry args={[1.42, 0.08, 0.18]} />
        <primitive object={frame.clone()} attach="material" />
      </mesh>
    </group>
  );
}

function Door({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const door = useRoughMaterial("#1a1512", "#070504", 0.9, "wood");
  const metal = useRoughMaterial("#151717", "#040404", 0.62);
  const trim = useRoughMaterial("#120f0d", "#050403", 0.85, "wood");
  const leafRef = useRef<Group>(null);

  useFrame(() => {
    if (!leafRef.current) return;
    const target = open ? -MathUtils.degToRad(86) : 0;
    leafRef.current.rotation.y = MathUtils.lerp(leafRef.current.rotation.y, target, 0.12);
  });

  return (
    <group position={[-3.41, 1.04, -1.4]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[-0.61, 0, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 2.24, 0.08]} />
        <primitive object={trim} attach="material" />
      </mesh>
      <mesh position={[0.61, 0, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 2.24, 0.08]} />
        <primitive object={trim.clone()} attach="material" />
      </mesh>
      <mesh position={[0, 1.14, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[1.26, 0.06, 0.08]} />
        <primitive object={trim.clone()} attach="material" />
      </mesh>

      <group
        ref={leafRef}
        position={[-0.55, 0, 0]}
        onDoubleClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      >
        <mesh position={[0.55, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 2.08, 0.08]} />
          <primitive object={door} attach="material" />
        </mesh>
        <mesh position={[0.55, 0.6, 0.055]} castShadow receiveShadow>
          <boxGeometry args={[0.82, 0.68, 0.035]} />
          <primitive object={door.clone()} attach="material" />
        </mesh>
        <mesh position={[0.55, -0.42, 0.055]} castShadow receiveShadow>
          <boxGeometry args={[0.82, 0.74, 0.035]} />
          <primitive object={door.clone()} attach="material" />
        </mesh>
        <mesh position={[0.91, 0.02, 0.07]} castShadow>
          <sphereGeometry args={[0.045, 12, 8]} />
          <primitive object={metal} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

function CeilingLight() {
  const fixture = useRoughMaterial("#23201b", "#080706", 0.7);

  return (
    <group position={[-1.25, 4.31, -1.45]} rotation={[0, 0, 0.09]}>
      <mesh castShadow>
        <boxGeometry args={[1.35, 0.08, 0.34]} />
        <primitive object={fixture} attach="material" />
      </mesh>
      <mesh position={[0, -0.045, 0]}>
        <boxGeometry args={[1.18, 0.025, 0.22]} />
        <meshBasicMaterial color="#252415" />
      </mesh>
    </group>
  );
}

function BookStack({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const bookA = useRoughMaterial("#312821", "#0d0908", 0.92, "paper");
  const bookB = useRoughMaterial("#1d2826", "#090d0d", 0.92, "paper");
  const bookC = useRoughMaterial("#2b1b1a", "#0b0505", 0.92, "paper");

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.44, 0.08, 0.25]} />
        <primitive object={bookA} attach="material" />
      </mesh>
      <mesh position={[0.02, 0.08, 0]} castShadow>
        <boxGeometry args={[0.38, 0.07, 0.25]} />
        <primitive object={bookB} attach="material" />
      </mesh>
      <mesh position={[-0.03, 0.15, 0]} castShadow>
        <boxGeometry args={[0.42, 0.06, 0.23]} />
        <primitive object={bookC} attach="material" />
      </mesh>
    </group>
  );
}

type TextureStyle = "concrete" | "fabric" | "paint" | "paper" | "wood" | "none";

function useRoughMaterial(
  color: string,
  emissive = "#000000",
  roughness = 0.95,
  textureStyle: TextureStyle = "concrete",
) {
  return useMemo(() => {
    const texture = textureStyle === "none" ? null : createSurfaceTexture(color, textureStyle);
    const material = new MeshStandardMaterial({
      color: texture ? "#ffffff" : color,
      map: texture ?? undefined,
      roughness,
      metalness: 0.01,
      emissive,
      emissiveIntensity: 0.06,
    });

    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          #include <begin_vertex>
          float warp = sin(position.x * 9.0 + position.y * 3.0) * 0.006;
          transformed += normal * warp;
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
          #include <color_fragment>
          float dirt = fract(sin(dot(vViewPosition.xy, vec2(12.9898,78.233))) * 43758.5453);
          diffuseColor.rgb *= 0.86 + dirt * 0.09;
        `,
      );
    };

    return material;
  }, [color, emissive, roughness, textureStyle]);
}

function createSurfaceTexture(baseColor: string, style: TextureStyle) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  if (!context) return null;

  context.fillStyle = baseColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const lightOpacity = style === "fabric" ? 0.012 : 0.018;
  const darkOpacity = style === "wood" ? 0.08 : 0.035;
  const markCount = style === "wood" ? 80 : style === "fabric" ? 120 : 170;

  for (let index = 0; index < markCount; index += 1) {
    const value = Math.random() > 0.52 ? 255 : 0;
    const opacity = value === 255 ? lightOpacity : darkOpacity;
    context.fillStyle = `rgba(${value}, ${value}, ${value}, ${opacity})`;
    context.fillRect(
      Math.random() * 256,
      Math.random() * 256,
      Math.random() * 24 + 6,
      Math.random() * 18 + 5,
    );
  }

  if (style === "wood") {
    for (let y = 0; y < 256; y += 12) {
      context.strokeStyle = "rgba(0, 0, 0, 0.16)";
      context.beginPath();
      context.moveTo(0, y + Math.sin(y) * 2);
      context.bezierCurveTo(64, y + 4, 160, y - 6, 256, y + 2);
      context.stroke();
    }
  }

  if (style === "fabric") {
    context.strokeStyle = "rgba(255, 255, 255, 0.035)";
    for (let x = 0; x < 256; x += 8) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x + 20, 256);
      context.stroke();
    }
    context.strokeStyle = "rgba(0, 0, 0, 0.06)";
    for (let y = 0; y < 256; y += 9) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(256, y + 8);
      context.stroke();
    }
  }

  if (style === "paint" || style === "concrete") {
    context.strokeStyle = "rgba(255, 255, 255, 0.025)";
    for (let line = 0; line < 16; line += 1) {
      const y = Math.random() * 256;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(256, y + Math.random() * 18 - 9);
      context.stroke();
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(style === "wood" ? 2 : 3, style === "fabric" ? 4 : 3);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

function createLockscreenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#203743");
  gradient.addColorStop(0.52, "#3b5966");
  gradient.addColorStop(1, "#11181d");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(232, 236, 236, 0.95)";
  context.font = "600 74px Inter, system-ui, sans-serif";
  context.textAlign = "center";
  const lockscreenYOffset = 150;

  context.fillText("2:47", canvas.width / 2, 118 + lockscreenYOffset);

  context.fillStyle = "rgba(221, 227, 229, 0.92)";
  context.font = "500 26px Inter, system-ui, sans-serif";
  context.fillText("Monday", canvas.width / 2, 160 + lockscreenYOffset);

  context.fillStyle = "rgba(8, 14, 18, 0.34)";
  context.fillRect(44, 220 + lockscreenYOffset, canvas.width - 88, 660);

  context.fillStyle = "#2f3f48";
  context.fillRect(66, 242 + lockscreenYOffset, canvas.width - 132, 616);

  context.fillStyle = "#223037";
  context.beginPath();
  context.arc(canvas.width / 2, 455 + lockscreenYOffset, 136, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#d6c3ae";
  context.beginPath();
  context.arc(canvas.width / 2, 410 + lockscreenYOffset, 82, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#241916";
  context.beginPath();
  context.arc(canvas.width / 2, 394 + lockscreenYOffset, 88, Math.PI * 0.94, Math.PI * 2.05);
  context.fill();

  context.fillStyle = "#10161a";
  context.beginPath();
  context.moveTo(canvas.width / 2 - 126, 600 + lockscreenYOffset);
  context.lineTo(canvas.width / 2 + 126, 600 + lockscreenYOffset);
  context.lineTo(canvas.width / 2 + 188, 820 + lockscreenYOffset);
  context.lineTo(canvas.width / 2 - 188, 820 + lockscreenYOffset);
  context.closePath();
  context.fill();

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function clampGaze(
  yaw: MutableRefObject<number>,
  pitch: MutableRefObject<number>,
) {
  yaw.current = MathUtils.clamp(yaw.current, -horizontalGazeLimit, horizontalGazeLimit);
  pitch.current = MathUtils.clamp(pitch.current, minPitch, maxPitch);
}

function constrainPlayerPosition(position: Vector3) {
  position.x = MathUtils.clamp(position.x, -12.1, 3.2);
  position.z = MathUtils.clamp(position.z, -6.4, 4.2);

  const inBedroom = position.x >= -3.2;
  const inHallTransition = position.x < -3.2 && position.x > -6.2;

  if (inBedroom) {
    position.z = MathUtils.clamp(position.z, -3.7, 3.6);
    return;
  }

  if (inHallTransition) {
    position.z = MathUtils.clamp(position.z, -2.55, -0.25);
    return;
  }

  position.z = MathUtils.clamp(position.z, -6.2, 3.45);
}

function playPhoneOpenClick() {
  const AudioContextImpl = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return;

  const context = new AudioContextImpl();
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(1240, now);
  oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.02);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.26, now + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.048);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.052);
  oscillator.onended = () => {
    context.close().catch(() => {});
  };
}

function playPhoneUnlockClick() {
  const AudioContextImpl =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return;

  const context = new AudioContextImpl();
  const now = context.currentTime;

  const oscillator = context.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(980, now);
  oscillator.frequency.exponentialRampToValueAtTime(1240, now + 0.04);

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.11, now + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.07);
  oscillator.onended = () => {
    context.close().catch(() => {});
  };
}

function playPhoneTapClick() {
  const AudioContextImpl =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return;

  const context = new AudioContextImpl();
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(860, now);
  oscillator.frequency.exponentialRampToValueAtTime(720, now + 0.018);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.034);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.038);
  oscillator.onended = () => {
    context.close().catch(() => {});
  };
}

function playPhoneCloseClick() {
  const AudioContextImpl =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return;

  const context = new AudioContextImpl();
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(760, now);
  oscillator.frequency.exponentialRampToValueAtTime(520, now + 0.03);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.0015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.048);
  oscillator.onended = () => {
    context.close().catch(() => {});
  };
}

function playPhonePickupClick() {
  const AudioContextImpl =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return;

  const context = new AudioContextImpl();
  const now = context.currentTime;

  const oscA = context.createOscillator();
  const oscB = context.createOscillator();
  const gain = context.createGain();

  oscA.type = "sine";
  oscA.frequency.setValueAtTime(560, now);
  oscA.frequency.exponentialRampToValueAtTime(820, now + 0.06);

  oscB.type = "triangle";
  oscB.frequency.setValueAtTime(280, now);
  oscB.frequency.exponentialRampToValueAtTime(410, now + 0.06);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

  oscA.connect(gain);
  oscB.connect(gain);
  gain.connect(context.destination);
  oscA.start(now);
  oscB.start(now);
  oscA.stop(now + 0.09);
  oscB.stop(now + 0.09);
  oscA.onended = () => {
    context.close().catch(() => {});
  };
}

function playSocialFlickerSuspense(durationMs: number) {
  const AudioContextImpl =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return () => {};

  const context = new AudioContextImpl();
  const now = context.currentTime;
  const duration = Math.max(durationMs / 1000, 0.2);

  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.16, now + 0.04);
  master.gain.setValueAtTime(0.16, now + duration * 0.72);
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  master.connect(context.destination);

  const oscA = context.createOscillator();
  oscA.type = "sawtooth";
  oscA.frequency.setValueAtTime(342, now);
  oscA.frequency.exponentialRampToValueAtTime(272, now + duration * 0.88);

  const oscB = context.createOscillator();
  oscB.type = "triangle";
  oscB.frequency.setValueAtTime(171, now);
  oscB.frequency.exponentialRampToValueAtTime(134, now + duration * 0.92);

  const tremolo = context.createOscillator();
  tremolo.type = "square";
  tremolo.frequency.setValueAtTime(13.5, now);

  const tremoloDepth = context.createGain();
  tremoloDepth.gain.setValueAtTime(0.058, now);

  const toneGain = context.createGain();
  toneGain.gain.setValueAtTime(0.062, now);

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1480, now);
  filter.frequency.exponentialRampToValueAtTime(980, now + duration);

  tremolo.connect(tremoloDepth);
  tremoloDepth.connect(toneGain.gain);

  oscA.connect(toneGain);
  oscB.connect(toneGain);
  toneGain.connect(filter);
  filter.connect(master);

  oscA.start(now);
  oscB.start(now);
  tremolo.start(now);

  const stopAt = now + duration + 0.03;
  oscA.stop(stopAt);
  oscB.stop(stopAt);
  tremolo.stop(stopAt);

  let closed = false;
  const closeContext = () => {
    if (closed) return;
    closed = true;
    context.close().catch(() => {});
  };

  oscA.onended = closeContext;

  return () => {
    if (closed) return;
    const releaseNow = context.currentTime;
    master.gain.cancelScheduledValues(releaseNow);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), releaseNow);
    master.gain.exponentialRampToValueAtTime(0.0001, releaseNow + 0.03);
    window.setTimeout(closeContext, 40);
  };
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

function PhonePanelOverlay({
  screen,
  phoneNumber,
  lockscreenImageUrl,
  displayTime,
  onOpenSocial,
  onUnlock,
  onCloseAndReturn,
}: {
  screen: Exclude<PhonePanelScreen, null>;
  phoneNumber: string;
  lockscreenImageUrl: string | null;
  displayTime: string;
  onOpenSocial: () => void;
  onUnlock: () => void;
  onCloseAndReturn: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [blackoutActive, setBlackoutActive] = useState(false);
  const [blackoutFlickerPhase, setBlackoutFlickerPhase] = useState(false);
  const [socialPostCount, setSocialPostCount] = useState(30);
  const trackRef = useRef<HTMLDivElement>(null);
  const socialFeedRef = useRef<HTMLDivElement>(null);
  const socialFeedDragging = useRef(false);
  const socialFeedLastY = useRef(0);

  useEffect(() => {
    const resize = () => {
      if (!trackRef.current) return;
      setTrackWidth(trackRef.current.getBoundingClientRect().width);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (screen !== "lock") return;
    if (!dragging) return;

    const onMove = (event: PointerEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const raw = (event.clientX - rect.left) / rect.width;
      const next = MathUtils.clamp(raw, 0, 1);
      setProgress(next);
      if (next >= 0.95) {
        setDragging(false);
        onUnlock();
      }
    };

    const onUp = () => {
      setDragging(false);
      setProgress((value) => (value >= 0.95 ? 1 : 0));
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, onUnlock, screen]);

  useEffect(() => {
    if (screen !== "social") {
      setBlackoutActive(false);
      setBlackoutFlickerPhase(false);
      setSocialPostCount(30);
    }
  }, [screen]);

  useEffect(() => {
    if (screen !== "social") return;
    const blackTimer = window.setTimeout(() => {
      setBlackoutActive(true);
      setBlackoutFlickerPhase(true);
    }, 10000);
    return () => window.clearTimeout(blackTimer);
  }, [screen]);

  useEffect(() => {
    if (screen !== "social" || !blackoutFlickerPhase) return;
    const flickerPhaseTimer = window.setTimeout(() => {
      setBlackoutFlickerPhase(false);
    }, 2000);
    return () => {
      window.clearTimeout(flickerPhaseTimer);
    };
  }, [blackoutFlickerPhase, screen]);

  useEffect(() => {
    if (screen !== "social" || !blackoutFlickerPhase) return;
    const stopSound = playSocialFlickerSuspense(2000);
    return () => {
      stopSound();
    };
  }, [blackoutFlickerPhase, screen]);

  useEffect(() => {
    if (screen !== "social" || !blackoutActive || blackoutFlickerPhase) return;
    const closeTimer = window.setTimeout(() => {
      onCloseAndReturn();
    }, 1000);
    return () => {
      window.clearTimeout(closeTimer);
    };
  }, [blackoutActive, blackoutFlickerPhase, onCloseAndReturn, screen]);

  const knobTravel = Math.max((trackWidth || 1) - 56, 0);
  const knobX = knobTravel * progress;
  const socialPosts = Array.from({ length: socialPostCount }, (_, index) => index + 1);

  return (
    <div
      className="phone-focus-overlay"
      onPointerDown={() => {
        onCloseAndReturn();
      }}
    >
      <div
        className="phone-focus-panel"
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        {screen === "lock" ? (
          <div className="phone-lock-screen">
            <div className="phone-focus-status">
              <span>9:41</span>
              <div className="phone-focus-island" aria-hidden="true" />
              <div className="phone-focus-status-icons" aria-hidden="true">
                <span className="signal-bars" />
                <span className="wifi-icon" />
                <span className="battery-icon" />
              </div>
            </div>
            <div className="phone-focus-time">{displayTime}</div>
            <div className="phone-focus-day">Monday</div>
            <div className={`phone-focus-photo${lockscreenImageUrl ? " has-image" : ""}`}>
              {lockscreenImageUrl ? (
                <img src={lockscreenImageUrl} alt="Your lockscreen" className="phone-focus-photo-image" />
              ) : (
                <>
                  <div className="phone-focus-person-head" />
                  <div className="phone-focus-person-body" />
                </>
              )}
            </div>
            <div className="phone-focus-slider" ref={trackRef}>
              <div className="phone-focus-slider-label">slide to unlock</div>
              <button
                className="phone-focus-slider-knob"
                type="button"
                style={{ transform: `translateX(${knobX}px)` }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  playPhoneTapClick();
                  setDragging(true);
                }}
                aria-label="Slide to unlock"
              />
            </div>
          </div>
        ) : screen === "home" ? (
          <div className="phone-home">
            <div className="phone-home-top">
              <div className="phone-home-clock">09:41</div>
              <div className="phone-home-top-icons" aria-hidden="true">
                <span className="signal-bars" />
                <span className="wifi-icon" />
                <span className="battery-icon" />
              </div>
            </div>
            <div className="phone-home-grid">
              <div className="phone-home-widget">
                <div className="phone-home-widget-ring" aria-hidden="true" />
                <div className="phone-home-widget-percent">100%</div>
              </div>
              <div className="phone-home-app">
                <div className="phone-home-icon icon-calendar">9</div>
                <div className="phone-home-label">Calendar</div>
              </div>
              <div className="phone-home-app">
                <div className="phone-home-icon icon-photos" />
                <div className="phone-home-label">Photos</div>
              </div>
              <div className="phone-home-app">
                <div className="phone-home-icon icon-tv">tv</div>
                <div className="phone-home-label">TV</div>
              </div>
              <div className="phone-home-app">
                <div className="phone-home-icon icon-camera" />
                <div className="phone-home-label">Camera</div>
              </div>
              <div className="phone-home-app">
                <div className="phone-home-icon icon-maps" />
                <div className="phone-home-label">Maps</div>
              </div>
              <div className="phone-home-app">
                <div className="phone-home-icon icon-settings" />
                <div className="phone-home-label">Settings</div>
              </div>
              <div className="phone-home-app">
                <div className="phone-home-icon icon-mail">6,608</div>
                <div className="phone-home-label">Mail</div>
              </div>
              <div className="phone-home-app">
                <div className="phone-home-icon icon-reminders" />
                <div className="phone-home-label">Reminders</div>
              </div>
            </div>
            <div className="phone-home-dock">
              <div className="phone-home-dock-icon icon-phone" />
              <div className="phone-home-dock-icon icon-safari" />
              <div className="phone-home-dock-icon icon-messages" />
              <button
                type="button"
                className="phone-home-dock-icon icon-music active-social-app"
                aria-label="Open social feed"
                onClick={onOpenSocial}
              />
            </div>
            <div className="phone-home-number">{phoneNumber || "No phone number set"}</div>
          </div>
        ) : screen === "social" ? (
          <div className="phone-social">
            <div className="phone-social-header">For You</div>
            <div
              className="phone-social-feed"
              ref={socialFeedRef}
              onPointerDownCapture={(event) => {
                socialFeedDragging.current = true;
                socialFeedLastY.current = event.clientY;
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (!socialFeedDragging.current) return;
                const feed = socialFeedRef.current;
                if (!feed) return;
                const deltaY = socialFeedLastY.current - event.clientY;
                feed.scrollTop += deltaY;
                socialFeedLastY.current = event.clientY;
              }}
              onPointerUp={(event) => {
                socialFeedDragging.current = false;
                event.currentTarget.releasePointerCapture(event.pointerId);
              }}
              onPointerCancel={() => {
                socialFeedDragging.current = false;
              }}
              onScroll={() => {
                const feed = socialFeedRef.current;
                if (!feed) return;
                const remaining = feed.scrollHeight - feed.scrollTop - feed.clientHeight;
                if (remaining < 260) {
                  setSocialPostCount((count) => count + 20);
                }
              }}
            >
              {socialPosts.map((postId) => (
                <article key={postId} className="phone-social-post">
                  <div className="phone-social-post-head">
                    <span className="avatar" />
                    <span>@nightfeed_{postId}</span>
                  </div>
                  <img
                    src={socialImagePool[(postId - 1) % socialImagePool.length]}
                    alt={`Social post ${postId}`}
                    className="phone-social-media"
                    loading="lazy"
                  />
                  <p>Late-night clip #{postId}.</p>
                </article>
              ))}
            </div>
            {blackoutActive && (
              <div className="phone-social-blackout">
                {blackoutFlickerPhase && (
                  <div className="phone-social-reflection" aria-hidden="true">
                    <img
                      src="/reflections/monster-sad.jpeg"
                      alt=""
                      className="phone-social-reflection-image"
                      loading="eager"
                      decoding="sync"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="phone-black-screen" aria-label="Phone screen off" />
        )}
      </div>
    </div>
  );
}

function advancePhoneTimeByHour(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return value;

  const hour = Number.parseInt(match[1], 10);
  const minute = match[2];
  const nextHour = ((hour % 12) || 12) + 1;
  const normalizedHour = ((nextHour - 1) % 12) + 1;

  return `${normalizedHour}:${minute}`;
}

export default App;

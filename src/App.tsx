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

type DragState = {
  active: boolean;
  x: number;
  y: number;
};

type IntroPhase = "asleep" | "flicker" | "pan" | "active";
type PhonePanelScreen = "lock" | "home" | null;
const smsWebhookUrl = (import.meta.env.VITE_SMS_WEBHOOK_URL ?? "").trim();
const smsFromNumber = (import.meta.env.VITE_TWILIO_FROM_NUMBER ?? "").trim();

function App() {
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
    return () => {
      if (playerPhotoUrl) {
        URL.revokeObjectURL(playerPhotoUrl);
      }
    };
  }, [playerPhotoUrl]);

  const introActive = introPhase !== "active";
  const panelActive = phonePanelScreen !== null;
  const controlsLocked = panelActive || introActive;

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
            doorOpen={doorOpen}
            onSelectPhone={() => setPhoneSelected(true)}
            onTurnOnPhone={() => {
              setPhoneOn((current) => {
                if (!current) {
                  playPhoneOpenClick();
                }
                return true;
              });
              setPhoneUnlocked(false);
              setPhonePanelScreen("lock");
            }}
            onToggleDoor={() => setDoorOpen((value) => !value)}
            inputLocked={controlsLocked}
          />
        </Canvas>
      </div>

      <div className="sleep-vignette" />

      {introPhase === "flicker" && <div className="intro-blackout intro-blackout-flicker" />}
      {introPhase === "pan" && <div className="intro-blackout intro-blackout-pan" />}

      {!isAwake && (
        <div className="start-overlay">
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
              setIsAwake(true);
              setIntroPhase("flicker");
            }}
          >
            Open your eyes
          </button>
        </div>
      )}

      {isAwake && introPhase === "active" && !panelActive && (
        <div className="look-hint" aria-hidden="true">
          {phoneUnlocked
            ? "WASD/Arrow keys to move. Double-click objects to interact"
            : "Click and drag to look around"}
        </div>
      )}

      {isAwake && phoneOn && phonePanelScreen && (
        <PhonePanelOverlay
          screen={phonePanelScreen}
          phoneNumber={playerPhoneNumber}
          lockscreenImageUrl={playerPhotoUrl}
          onUnlock={() => {
            setPhoneUnlocked(true);
            setPhonePanelScreen("home");
            void sendUnlockText(playerPhoneNumber);
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
  doorOpen,
  onSelectPhone,
  onTurnOnPhone,
  onToggleDoor,
  inputLocked,
}: {
  isAwake: boolean;
  introPhase: IntroPhase;
  phoneOn: boolean;
  phoneUnlocked: boolean;
  phonePanelActive: boolean;
  phoneSelected: boolean;
  doorOpen: boolean;
  onSelectPhone: () => void;
  onTurnOnPhone: () => void;
  onToggleDoor: () => void;
  inputLocked: boolean;
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
        onSelectPhone={onSelectPhone}
        onTurnOnPhone={onTurnOnPhone}
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
}: {
  enabled: boolean;
  canMove: boolean;
  inputLocked: boolean;
  introPhase: IntroPhase;
  phonePanelActive: boolean;
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

  useFrame((_, delta) => {
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
      } else {
        position.current.lerp(fixedHeadPosition, 0.05);
      }
      if (introPhase !== "flicker" && introPhase !== "pan") {
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

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6.75, 0.01, -1.4]} receiveShadow>
        <planeGeometry args={[6.5, 2.4, 12, 4]} />
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

      <mesh position={[-9.98, 2.1, -1.4]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 2.4]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-6.75, 4.2, -1.4]} receiveShadow>
        <planeGeometry args={[6.5, 2.4, 6, 2]} />
        <primitive object={hallwayCeiling} attach="material" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8.35, 0.01, -4.1]} receiveShadow>
        <planeGeometry args={[3.3, 3.0, 8, 8]} />
        <primitive object={hallwaySurface.clone()} attach="material" />
      </mesh>
      <mesh position={[-8.35, 2.1, -5.6]} receiveShadow>
        <boxGeometry args={[3.3, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh position={[-9.98, 2.1, -4.1]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 3.0]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh position={[-6.72, 2.1, -4.1]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 3.0]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-8.35, 4.2, -4.1]} receiveShadow>
        <planeGeometry args={[3.3, 3.0, 4, 4]} />
        <primitive object={hallwayCeiling.clone()} attach="material" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8.35, 0.01, 1.3]} receiveShadow>
        <planeGeometry args={[3.3, 3.0, 8, 8]} />
        <primitive object={hallwaySurface.clone()} attach="material" />
      </mesh>
      <mesh position={[-8.35, 2.1, 2.8]} receiveShadow>
        <boxGeometry args={[3.3, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh position={[-9.98, 2.1, 1.3]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 3.0]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh position={[-6.72, 2.1, 1.3]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 3.0]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-8.35, 4.2, 1.3]} receiveShadow>
        <planeGeometry args={[3.3, 3.0, 4, 4]} />
        <primitive object={hallwayCeiling.clone()} attach="material" />
      </mesh>

      <pointLight position={[-6.5, 2.35, -1.35]} intensity={0.88} color="#86adc0" distance={8.6} decay={2} />
      <pointLight position={[-8.45, 2.1, -4.05]} intensity={0.56} color="#78a0bb" distance={5.5} decay={2} />
      <pointLight position={[-8.45, 2.1, 1.35]} intensity={0.56} color="#78a0bb" distance={5.5} decay={2} />
      <pointLight position={[-7.2, 2.05, -1.35]} intensity={0.46} color="#6b90a7" distance={6.8} decay={2} />
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
  onSelectPhone,
  onTurnOnPhone,
}: {
  phoneOn: boolean;
  phoneSelected: boolean;
  onSelectPhone: () => void;
  onTurnOnPhone: () => void;
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
        <Suspense fallback={null}>
          <SmallPhone
            selected={phoneSelected}
            poweredOn={phoneOn}
            onSelect={onSelectPhone}
            onTurnOn={onTurnOnPhone}
          />
        </Suspense>
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
}: {
  selected: boolean;
  poweredOn: boolean;
  onSelect: () => void;
  onTurnOn: () => void;
}) {
  const { scene } = useGLTF(phoneModelPath);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!hovered || poweredOn) {
      return;
    }

    const timer = window.setTimeout(() => {
      onTurnOn();
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hovered, poweredOn, onTurnOn]);

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
  position.x = MathUtils.clamp(position.x, -9.6, 3.2);
  position.z = MathUtils.clamp(position.z, -5.7, 3.7);

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

  position.z = MathUtils.clamp(position.z, -5.55, 2.75);
}

function playPhoneOpenClick() {
  const AudioContextImpl = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextImpl) return;

  const context = new AudioContextImpl();
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(1720, now);
  oscillator.frequency.exponentialRampToValueAtTime(1400, now + 0.012);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.0016);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.024);
  oscillator.onended = () => {
    context.close().catch(() => {});
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

function PhonePanelOverlay({
  screen,
  phoneNumber,
  lockscreenImageUrl,
  onUnlock,
}: {
  screen: Exclude<PhonePanelScreen, null>;
  phoneNumber: string;
  lockscreenImageUrl: string | null;
  onUnlock: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

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

  const knobTravel = Math.max((trackWidth || 1) - 56, 0);
  const knobX = knobTravel * progress;

  return (
    <div className="phone-focus-overlay">
      <div className="phone-focus-panel">
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
            <div className="phone-focus-time">2:47</div>
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
                  setDragging(true);
                }}
                aria-label="Slide to unlock"
              />
            </div>
          </div>
        ) : (
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
            <div className="phone-home-dots" aria-hidden="true">
              <span className="dot active" />
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
            <div className="phone-home-dock">
              <div className="phone-home-dock-icon icon-phone" />
              <div className="phone-home-dock-icon icon-safari" />
              <div className="phone-home-dock-icon icon-messages" />
              <div className="phone-home-dock-icon icon-music" />
            </div>
            <div className="phone-home-number">{phoneNumber || "No phone number set"}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

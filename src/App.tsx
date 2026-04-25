import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import {
  CanvasTexture,
  Color,
  MathUtils,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
} from "three";

const pointerSensitivity = 0.002;
const touchSensitivity = 0.004;
const gazeLimit = MathUtils.degToRad(45);
const fixedHeadPosition = new Vector3(0, 1.14, 2.82);

type DragState = {
  active: boolean;
  x: number;
  y: number;
};

function App() {
  const [isAwake, setIsAwake] = useState(false);

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
          shadows
          onCreated={({ gl }) => {
            gl.setClearColor(new Color("#0b0f0f"));
          }}
        >
          <BedroomScene isAwake={isAwake} />
        </Canvas>
      </div>

      <div className="sleep-vignette" />

      {!isAwake && (
        <div className="start-overlay">
          <button className="wake-button" type="button" onClick={() => setIsAwake(true)}>
            Open your eyes
          </button>
        </div>
      )}

      {isAwake && (
        <div className="look-hint" aria-hidden="true">
          Move the mouse to look around
        </div>
      )}
    </main>
  );
}

function BedroomScene({ isAwake }: { isAwake: boolean }) {
  return (
    <>
      <color attach="background" args={["#0b0f0f"]} />
      <fog attach="fog" args={["#0b0f0f", 6.5, 19]} />
      <LookOnlyCamera enabled={isAwake} />
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

      <RoomShell />
      <Bed />
      <Furniture />
      <ScareDetails />

      <EffectComposer multisampling={0}>
        <Vignette eskil={false} offset={0.38} darkness={0.34} />
      </EffectComposer>
    </>
  );
}

function LookOnlyCamera({ enabled }: { enabled: boolean }) {
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(MathUtils.degToRad(-14));
  const targetYaw = useRef(0);
  const targetPitch = useRef(MathUtils.degToRad(-14));
  const drag = useRef<DragState>({ active: false, x: 0, y: 0 });

  useFrame(() => {
    if (!enabled) {
      targetYaw.current += (Math.sin(performance.now() * 0.00025) * 0.055 - targetYaw.current) * 0.012;
      targetPitch.current += (MathUtils.degToRad(-14) - targetPitch.current) * 0.02;
    }

    yaw.current = MathUtils.lerp(yaw.current, targetYaw.current, 0.1);
    pitch.current = MathUtils.lerp(pitch.current, targetPitch.current, 0.1);
    camera.position.copy(fixedHeadPosition);
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;
    camera.rotation.z = Math.sin(performance.now() * 0.00042) * 0.006;
  });

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerMove = (event: PointerEvent) => {
      if (!enabled) return;

      if (document.pointerLockElement === canvas) {
        targetYaw.current -= event.movementX * pointerSensitivity;
        targetPitch.current -= event.movementY * pointerSensitivity;
      } else if (drag.current.active) {
        targetYaw.current -= (event.clientX - drag.current.x) * pointerSensitivity;
        targetPitch.current -= (event.clientY - drag.current.y) * pointerSensitivity;
        drag.current = { active: true, x: event.clientX, y: event.clientY };
      } else {
        const rect = canvas.getBoundingClientRect();
        const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
        const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;
        targetYaw.current += (normalizedX * 0.34 - targetYaw.current) * 0.04;
        targetPitch.current += (MathUtils.degToRad(-14) + normalizedY * -0.16 - targetPitch.current) * 0.04;
      }

      clampGaze(targetYaw, targetPitch);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!enabled) return;

      drag.current = { active: true, x: event.clientX, y: event.clientY };
      if (event.pointerType === "mouse" && canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
    };

    const onPointerUp = () => {
      drag.current.active = false;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!enabled || event.touches.length !== 1) return;
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

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [enabled, gl.domElement]);

  return null;
}

function RoomShell() {
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

      <mesh position={[-3.5, 2.25, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[8, 4.5, 0.18, 16, 10, 1]} />
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
      <Door />
      <CeilingLight />
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

      <mesh position={[0, 0.56, -0.18]} castShadow receiveShadow>
        <boxGeometry args={[1.52, 0.18, 1.85, 12, 2, 12]} />
        <primitive object={blanket} attach="material" />
      </mesh>

      <mesh position={[0, 1.08, 1.48]} castShadow receiveShadow>
        <boxGeometry args={[2.02, 1.25, 0.22, 10, 6, 1]} />
        <primitive object={frame.clone()} attach="material" />
      </mesh>
    </group>
  );
}

function Furniture() {
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

      <group position={[-1.16, 0, 2.2]}>
        <mesh position={[0, 0.69, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.54, 0.64, 0.48]} />
          <primitive object={wood.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 1.04, 0.01]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.07, 0.52]} />
          <primitive object={wood.clone()} attach="material" />
        </mesh>
        <SmallPhone />
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

function SmallPhone() {
  const body = useRoughMaterial("#050606", "#000000", 0.62, "none");
  const bevel = useRoughMaterial("#151717", "#050606", 0.72, "none");
  const screen = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#071012",
        roughness: 0.86,
        metalness: 0.03,
        emissive: "#0b2428",
        emissiveIntensity: 0.58,
      }),
    [],
  );

  return (
    <group position={[0.16, 1.095, 0.14]} rotation={[-Math.PI / 2, 0, MathUtils.degToRad(-14)]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.36, 0.024]} />
        <primitive object={body} attach="material" />
      </mesh>
      <pointLight position={[0, 0, 0.08]} intensity={0.16} color="#4fb5c6" distance={0.7} decay={2} />
      <mesh position={[0, 0, 0.021]}>
        <planeGeometry args={[0.14, 0.28]} />
        <primitive object={screen} attach="material" />
      </mesh>
      <mesh position={[0, -0.16, 0.024]} castShadow>
        <boxGeometry args={[0.06, 0.008, 0.005]} />
        <primitive object={bevel} attach="material" />
      </mesh>
      <mesh position={[0, 0.155, 0.024]} castShadow>
        <boxGeometry args={[0.036, 0.006, 0.005]} />
        <primitive object={bevel.clone()} attach="material" />
      </mesh>
    </group>
  );
}

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

function Door() {
  const door = useRoughMaterial("#1a1512", "#070504", 0.9, "wood");
  const metal = useRoughMaterial("#151717", "#040404", 0.62);
  const trim = useRoughMaterial("#120f0d", "#050403", 0.85, "wood");

  return (
    <group position={[-3.41, 1.04, -1.4]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.1, 2.08, 0.08]} />
        <primitive object={door} attach="material" />
      </mesh>
      <mesh position={[0, 0.6, 0.055]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 0.68, 0.035]} />
        <primitive object={door.clone()} attach="material" />
      </mesh>
      <mesh position={[0, -0.42, 0.055]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 0.74, 0.035]} />
        <primitive object={door.clone()} attach="material" />
      </mesh>
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
      <mesh position={[0.36, 0.02, 0.07]} castShadow>
        <sphereGeometry args={[0.045, 12, 8]} />
        <primitive object={metal} attach="material" />
      </mesh>
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

function clampGaze(
  yaw: MutableRefObject<number>,
  pitch: MutableRefObject<number>,
) {
  yaw.current = MathUtils.clamp(yaw.current, -gazeLimit, gazeLimit);
  pitch.current = MathUtils.clamp(pitch.current, MathUtils.degToRad(-34), MathUtils.degToRad(16));
}

export default App;

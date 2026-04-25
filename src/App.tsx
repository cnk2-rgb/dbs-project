import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  MathUtils,
  MeshStandardMaterial,
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
      <div className="film-grain" />

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
      <pointLight position={[-2.85, 1.15, -2.3]} intensity={4.3} color="#a97855" distance={6.8} decay={2} />
      <pointLight position={[2.3, 2.2, -1.7]} intensity={1.05} color="#bad6df" distance={8} decay={2} />
      <pointLight position={[0, 1.2, 2.05]} intensity={1.15} color="#7f9495" distance={3.5} decay={2.3} />

      <RoomShell />
      <Bed />
      <Furniture />
      <ScareDetails />
      <DustMotes />

      <EffectComposer multisampling={0}>
        <Noise opacity={0.23} premultiply blendFunction={BlendFunction.ADD} />
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
  const floorMaterial = useRoughMaterial("#252626", "#161716", 0.8);
  const wallMaterial = useRoughMaterial("#202221", "#111514", 0.7);
  const ceilingMaterial = useRoughMaterial("#181a19", "#0b0d0c", 0.6);
  const rugMaterial = useRoughMaterial("#15100f", "#080606", 0.9);

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

      <Window />
      <Door />
      <CeilingLight />
    </group>
  );
}

function Bed() {
  const frame = useRoughMaterial("#181412", "#0a0808", 0.7);
  const mattress = useRoughMaterial("#7c776d", "#36332f", 0.9);
  const blanket = useRoughMaterial("#2a3431", "#0d1211", 0.95);
  const pillow = useRoughMaterial("#8a8275", "#3a352f", 0.8);

  return (
    <group position={[0, 0, 2.55]}>
      <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.35, 0.24, 2.75, 8, 2, 8]} />
        <primitive object={mattress} attach="material" />
      </mesh>

      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.55, 0.25, 2.95]} />
        <primitive object={frame} attach="material" />
      </mesh>

      <mesh position={[0, 0.56, -0.18]} castShadow receiveShadow>
        <boxGeometry args={[2.18, 0.18, 1.85, 12, 2, 12]} />
        <primitive object={blanket} attach="material" />
      </mesh>

      <mesh position={[-0.43, 0.63, 1.08]} rotation={[0.08, -0.04, 0.03]} castShadow receiveShadow>
        <boxGeometry args={[0.78, 0.2, 0.54, 8, 2, 6]} />
        <primitive object={pillow} attach="material" />
      </mesh>

      <mesh position={[0.45, 0.61, 1.07]} rotation={[0.04, 0.08, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.18, 0.5, 8, 2, 6]} />
        <primitive object={pillow.clone()} attach="material" />
      </mesh>

      <mesh position={[0, 1.08, 1.48]} castShadow receiveShadow>
        <boxGeometry args={[2.7, 1.25, 0.22, 10, 6, 1]} />
        <primitive object={frame.clone()} attach="material" />
      </mesh>
    </group>
  );
}

function Furniture() {
  const wood = useRoughMaterial("#2a211b", "#0d0a08", 0.85);
  const darkMetal = useRoughMaterial("#111415", "#050606", 0.8);
  const paper = useRoughMaterial("#504940", "#1d1a17", 0.85);
  const phone = useRoughMaterial("#080909", "#000000", 0.55);

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
        <mesh position={[-0.34, 0.56, 0.06]} rotation={[-Math.PI / 2, 0, 0.22]} castShadow>
          <boxGeometry args={[0.26, 0.5, 0.028]} />
          <primitive object={phone} attach="material" />
        </mesh>
        <mesh position={[-0.34, 0.578, 0.06]} rotation={[-Math.PI / 2, 0, 0.22]}>
          <planeGeometry args={[0.2, 0.38]} />
          <meshBasicMaterial color="#080b0a" transparent opacity={0.86} />
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

      <mesh position={[-2.85, 0.72, 1.8]} castShadow receiveShadow>
        <boxGeometry args={[0.68, 0.7, 0.56]} />
        <primitive object={wood.clone()} attach="material" />
      </mesh>
      <mesh position={[-2.85, 1.15, 1.68]} castShadow>
        <cylinderGeometry args={[0.16, 0.23, 0.28, 16]} />
        <meshStandardMaterial color="#241611" roughness={0.92} emissive="#1c0c04" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-2.85, 1.3, 1.68]} castShadow>
        <cylinderGeometry args={[0.24, 0.16, 0.32, 16, 1, true]} />
        <meshStandardMaterial color="#4b3228" roughness={0.98} transparent opacity={0.9} />
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
  const frame = useRoughMaterial("#0f1111", "#020202", 0.8);
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
    </group>
  );
}

function Door() {
  const door = useRoughMaterial("#1a1512", "#070504", 0.88);
  const metal = useRoughMaterial("#151717", "#040404", 0.62);

  return (
    <group position={[-3.41, 1.04, -1.4]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.1, 2.08, 0.08]} />
        <primitive object={door} attach="material" />
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
  const bookA = useRoughMaterial("#312821", "#0d0908", 0.9);
  const bookB = useRoughMaterial("#1d2826", "#090d0d", 0.9);
  const bookC = useRoughMaterial("#2b1b1a", "#0b0505", 0.9);

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

function DustMotes() {
  const points = useMemo(() => {
    const geometry = new BufferGeometry();
    const positions: number[] = [];

    for (let index = 0; index < 210; index += 1) {
      positions.push(
        MathUtils.randFloatSpread(6.2),
        MathUtils.randFloat(0.75, 3.4),
        MathUtils.randFloat(-3.6, 2.2),
      );
    }

    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geometry;
  }, []);

  const material = useMemo(
    () => (
      <pointsMaterial
        size={0.016}
        color="#b5ad93"
        transparent
        opacity={0.19}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    ),
    [],
  );

  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.08) * 0.02;
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.22) * 0.035;
  });

  return (
    <group ref={ref}>
      <points geometry={points}>{material}</points>
    </group>
  );
}

function useRoughMaterial(color: string, emissive = "#000000", roughness = 0.95) {
  return useMemo(() => {
    const material = new MeshStandardMaterial({
      color,
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
          float warp = sin(position.x * 9.0 + position.y * 3.0) * 0.015;
          transformed += normal * warp;
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
          #include <color_fragment>
          float dirt = fract(sin(dot(vViewPosition.xy, vec2(12.9898,78.233))) * 43758.5453);
          diffuseColor.rgb *= 0.78 + dirt * 0.18;
        `,
      );
    };

    return material;
  }, [color, emissive, roughness]);
}

function clampGaze(
  yaw: MutableRefObject<number>,
  pitch: MutableRefObject<number>,
) {
  yaw.current = MathUtils.clamp(yaw.current, -gazeLimit, gazeLimit);
  pitch.current = MathUtils.clamp(pitch.current, MathUtils.degToRad(-34), MathUtils.degToRad(16));
}

export default App;

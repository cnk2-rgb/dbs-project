import { KitchenArea } from "./KitchenArea";
import { OfficeArea } from "./OfficeArea";
import { RoomLabel } from "./RoomLabel";
import { WallGroup } from "./WallGroup";
import { useRoughMaterial } from "./useRoughMaterial";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState } from "react";
import { Group, MathUtils, Mesh } from "three";
import { DebrisPapersModel, PaperModel, TshirtModel } from "./ImportedClutterModels";
import { HALLWAY_WALLS } from "../../lib/wallDefinitions";

const pianoModelPath = "/models/antique-wooden-piano-get3dmodels.glb";

export function HallwayWing() {
  const hallwayWall = useRoughMaterial("#202b31", "#0b1116", 0.84, "paint", {
    seed: "hallway-wall",
    repeat: [3, 4],
    grimeStrength: 1.25,
    stainStrength: 1.15,
    warpStrength: 0.8,
  });
  const wallFTop = hallwayWall.clone();
  wallFTop.roughness = 1;
  wallFTop.metalness = 0;
  const wallFMaterials = [
    hallwayWall,
    hallwayWall,
    wallFTop,
    hallwayWall,
    hallwayWall,
    hallwayWall,
  ];
  const hallwayCenterZ = -1.4;
  const depthCompression = 0.5;

  return (
    <group position={[0, 0, hallwayCenterZ]} scale={[1, 1, depthCompression]}>
      <group position={[0, 0, -hallwayCenterZ]}>
      <WallGroup
        walls={HALLWAY_WALLS}
        materialForWall={(wall) => (wall.id === "F" ? wallFMaterials : hallwayWall.clone())}
      />
      <RoomLabel name="Living Room" position={[-10.375, 1.2, 14.6]} />

      <rectAreaLight
        position={[-9.55, 3.95, -4.9]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={2.2}
        height={1.4}
        intensity={10.5}
        color="#dbe7ed"
      />
      <rectAreaLight
        position={[-7.2, 3.95, -1.35]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={3.2}
        height={1.4}
        intensity={7.8}
        color="#cbdde9"
      />
      <rectAreaLight
        position={[-8.1, 3.95, 1.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={2.4}
        height={1.4}
        intensity={6.8}
        color="#d8e4cd"
      />
      <rectAreaLight
        position={[-12.5, 3.95, 5.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={2.0}
        height={1.5}
        intensity={8.9}
        color="#dfe9d3"
      />
      <pointLight position={[-12.7, 2.5, 5.4]} intensity={1.5} color="#cfe6f5" distance={4.2} decay={2} />
      <rectAreaLight
        position={[-10.375, 3.95, 14.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={4.2}
        height={2.8}
        intensity={11}
        color="#f0e2c7"
      />
      <pointLight position={[-11.9, 2.4, 13.8]} intensity={2.1} color="#ffe2bc" distance={5.8} decay={2} />
      <pointLight position={[-8.9, 2.4, 15.3]} intensity={1.8} color="#c8def1" distance={5.8} decay={2} />
      <pointLight position={[-10.2, 1.2, -1.9]} intensity={0.9} color="#9ab69a" distance={2.2} decay={2.2} />

      <HallwayDetails />
      <BathroomFixtures />
      <LivingRoomFurniture />
      <Suspense fallback={null}>
        <LivingRoomPiano />
      </Suspense>
      <OfficeDoor />
      <BathroomDoor />
      <OfficeArea />
      <KitchenArea />
      </group>
    </group>
  );
}

function OfficeDoor() {
  const door = useRoughMaterial("#1b1714", "#080605", 0.88, "wood");
  const frame = useRoughMaterial("#14110f", "#060403", 0.82, "wood");
  const knob = useRoughMaterial("#1f2327", "#07090b", 0.54, "none");
  const leafRef = useRef<Group>(null);
  const [open, setOpen] = useState(false);

  useFrame(() => {
    if (!leafRef.current) return;
    const target = open ? MathUtils.degToRad(86) : MathUtils.degToRad(-18);
    leafRef.current.rotation.y = MathUtils.lerp(leafRef.current.rotation.y, target, 0.12);
  });

  return (
    <group position={[-11.19, 1.04, -4.6]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[-0.55, 0, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 2.2, 0.08]} />
        <primitive object={frame} attach="material" />
      </mesh>
      <mesh position={[0.55, 0, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 2.2, 0.08]} />
        <primitive object={frame.clone()} attach="material" />
      </mesh>
      <mesh position={[0, 1.11, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[1.16, 0.06, 0.08]} />
        <primitive object={frame.clone()} attach="material" />
      </mesh>

      <group
        ref={leafRef}
        position={[-0.5, -0.02, 0]}
        rotation={[0, -MathUtils.degToRad(18), 0]}
        onDoubleClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        <mesh position={[0.5, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 2.04, 0.07]} />
          <primitive object={door} attach="material" />
        </mesh>
        <mesh position={[0.82, 0.04, 0.06]} castShadow>
          <sphereGeometry args={[0.038, 12, 8]} />
          <primitive object={knob} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

function BathroomDoor() {
  const door = useRoughMaterial("#171311", "#060403", 0.9, "wood");
  const knob = useRoughMaterial("#1f2327", "#07090b", 0.54, "none");
  const leafRef = useRef<Group>(null);
  const [open, setOpen] = useState(false);

  useFrame(() => {
    if (!leafRef.current) return;
    const target = open ? MathUtils.degToRad(84) : MathUtils.degToRad(-12);
    leafRef.current.rotation.y = MathUtils.lerp(leafRef.current.rotation.y, target, 0.12);
  });

  return (
    <group position={[-11.19, 1.04, 5.2]} rotation={[0, Math.PI / 2, 0]}>
      <group
        ref={leafRef}
        position={[-0.5, -0.02, 0]}
        rotation={[0, -MathUtils.degToRad(12), 0]}
        onDoubleClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        <mesh position={[0.5, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 2.04, 0.07]} />
          <primitive object={door} attach="material" />
        </mesh>
        <mesh position={[0.82, 0.04, 0.06]} castShadow>
          <sphereGeometry args={[0.038, 12, 8]} />
          <primitive object={knob} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

function HallwayDetails() {
  const wood = useRoughMaterial("#3a2b21", "#110b08", 0.88, "wood", {
    seed: "hallway-wood",
    repeat: [2, 3],
    grimeStrength: 1,
  });
  const fabric = useRoughMaterial("#1e2b2e", "#080e10", 0.96, "fabric", {
    seed: "hallway-fabric",
    repeat: [3, 4],
    grimeStrength: 0.95,
  });
  const paper = useRoughMaterial("#bfb19b", "#5d5142", 0.9, "paper", {
    seed: "hallway-paper",
    repeat: [2, 2],
    grimeStrength: 0.85,
  });
  const dark = useRoughMaterial("#151a1d", "#050608", 0.62, "none");
  const brass = useRoughMaterial("#8e7242", "#322310", 0.42, "none");

  return (
    <>
      <mesh position={[-7.4, 0.035, -1.15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.8, 0.78, 4, 2]} />
        <primitive object={fabric} attach="material" />
      </mesh>

      <group position={[-8.72, 0.54, -2.35]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.86, 0.88, 0.34]} />
          <primitive object={wood} attach="material" />
        </mesh>
        <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.92, 0.08, 0.38]} />
          <primitive object={wood.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.2, 0.62, 0]} castShadow>
          <sphereGeometry args={[0.1, 14, 10]} />
          <primitive object={brass} attach="material" />
        </mesh>
        <mesh position={[0.2, 0.62, 0]} castShadow>
          <sphereGeometry args={[0.1, 14, 10]} />
          <primitive object={dark} attach="material" />
        </mesh>
      </group>

      <group position={[-10.74, 1.5, -1.2]} rotation={[0, Math.PI / 2, 0]}>
        {[0, 0.42, 0.84].map((y) => (
          <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.52, 0.08, 0.08]} />
            <primitive object={brass.clone()} attach="material" />
          </mesh>
        ))}
      </group>

      <Suspense fallback={null}>
        <PaperModel position={[-6.45, 0.03, 0.03]} rotation={[-Math.PI / 2, 0.1, -0.18]} scale={0.095} />
        <DebrisPapersModel position={[-7.82, 0.02, -2.78]} rotation={[-Math.PI / 2, 0.08, 0.06]} scale={0.11} />
        <TshirtModel position={[-8.28, 0.01, -1.74]} rotation={[0.08, 0.1, -0.2]} scale={0.13} />
      </Suspense>
    </>
  );
}

function BathroomFixtures() {
  const porcelain = useRoughMaterial("#ece8df", "#8b8578", 0.56, "concrete", {
    seed: "bathroom-porcelain",
    repeat: [2, 2],
    grimeStrength: 0.8,
  });
  const metal = useRoughMaterial("#aab2b6", "#3f484d", 0.24, "none");
  const glass = useRoughMaterial("#9ed0dc", "#3e6a75", 0.12, "none");
  const wood = useRoughMaterial("#584437", "#1b120d", 0.82, "wood", {
    seed: "bathroom-wood",
    repeat: [2, 3],
    grimeStrength: 0.9,
  });
  const towel = useRoughMaterial("#6d1f22", "#220708", 0.96, "fabric", {
    seed: "bathroom-towel",
    repeat: [2, 3],
    grimeStrength: 0.9,
  });

  return (
    <>
      <group position={[-12.95, 0.42, 6.75]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.24, 0.62, 0.48]} />
          <primitive object={porcelain} attach="material" />
        </mesh>
        <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.34, 0.08, 0.56]} />
          <primitive object={wood} attach="material" />
        </mesh>
        <mesh position={[0, 0.36, -0.02]} castShadow receiveShadow>
          <cylinderGeometry args={[0.18, 0.14, 0.08, 24]} />
          <primitive object={porcelain.clone()} attach="material" />
        </mesh>
        <mesh position={[0.28, 0.47, -0.04]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.22, 12]} />
          <primitive object={metal} attach="material" />
        </mesh>
      </group>

      <group position={[-12.95, 1.72, 7.02]} rotation={[0, 0, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.9, 0.72, 0.035]} />
          <primitive object={metal.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.025]} receiveShadow>
          <boxGeometry args={[0.76, 0.58, 0.012]} />
          <primitive object={glass} attach="material" />
        </mesh>
      </group>

      <group position={[-11.8, 0.45, 4.04]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.28, 0.22, 0.42, 24]} />
          <primitive object={porcelain.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 0.36, 0.03]} castShadow receiveShadow>
          <torusGeometry args={[0.25, 0.05, 12, 24]} />
          <primitive object={porcelain.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 0.75, -0.24]} castShadow receiveShadow>
          <boxGeometry args={[0.58, 0.55, 0.16]} />
          <primitive object={porcelain.clone()} attach="material" />
        </mesh>
      </group>

      <group position={[-13.15, 0.34, 4.25]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.92, 0.34, 1.64]} />
          <primitive object={porcelain.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.78, 0.06, 1.5]} />
          <primitive object={glass.clone()} attach="material" />
        </mesh>
      </group>

      <mesh position={[-11.48, 1.38, 6.4]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 0.52, 0.62]} />
        <primitive object={towel} attach="material" />
      </mesh>
    </>
  );
}

function LivingRoomFurniture() {
  const couch = useRoughMaterial("#273a36", "#0b1210", 0.96, "fabric", {
    seed: "living-room-couch",
    repeat: [4, 5],
    grimeStrength: 0.9,
  });
  const cushion = useRoughMaterial("#b7a486", "#594a35", 0.92, "fabric", {
    seed: "living-room-cushion",
    repeat: [3, 3],
    grimeStrength: 0.85,
  });
  const wood = useRoughMaterial("#4a3326", "#150d09", 0.84, "wood", {
    seed: "living-room-wood",
    repeat: [2, 3],
    grimeStrength: 0.95,
  });
  const dark = useRoughMaterial("#11161a", "#040506", 0.5, "none");
  const paper = useRoughMaterial("#bfb5a4", "#5e5549", 0.92, "paper", {
    seed: "living-room-paper",
    repeat: [3, 3],
    grimeStrength: 0.8,
  });
  const lampShade = useRoughMaterial("#d9c8a6", "#6c5a3d", 0.78, "fabric", {
    seed: "living-room-lamp",
    repeat: [2, 3],
    grimeStrength: 0.8,
  });

  return (
    <>
      <group position={[-10.4, 0.48, 16.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.7, 0.58, 0.72]} />
          <primitive object={couch} attach="material" />
        </mesh>
        <mesh position={[0, 0.42, 0.25]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.78, 0.18]} />
          <primitive object={couch.clone()} attach="material" />
        </mesh>
        {[-0.78, 0, 0.78].map((x) => (
          <mesh key={x} position={[x, 0.74, -0.1]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.18, 0.52]} />
            <primitive object={couch.clone()} attach="material" />
          </mesh>
        ))}
        <mesh position={[-1.02, 0.84, 0.12]} rotation={[0, 0, -0.12]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.3, 0.12]} />
          <primitive object={cushion} attach="material" />
        </mesh>
      </group>

      <group position={[-10.35, 0.34, 14.4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.42, 0.14, 0.72]} />
          <primitive object={wood} attach="material" />
        </mesh>
        <mesh position={[-0.5, -0.16, -0.22]} castShadow>
          <boxGeometry args={[0.08, 0.32, 0.08]} />
          <primitive object={dark} attach="material" />
        </mesh>
        <mesh position={[0.5, -0.16, -0.22]} castShadow>
          <boxGeometry args={[0.08, 0.32, 0.08]} />
          <primitive object={dark.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.5, -0.16, 0.22]} castShadow>
          <boxGeometry args={[0.08, 0.32, 0.08]} />
          <primitive object={dark.clone()} attach="material" />
        </mesh>
        <mesh position={[0.5, -0.16, 0.22]} castShadow>
          <boxGeometry args={[0.08, 0.32, 0.08]} />
          <primitive object={dark.clone()} attach="material" />
        </mesh>
        <mesh position={[0.18, 0.1, 0.02]} rotation={[-Math.PI / 2, 0, 0.18]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.28, 0.016]} />
          <primitive object={paper} attach="material" />
        </mesh>
      </group>

      <group position={[-8.28, 0.78, 14.8]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.32, 0.52, 0.28]} />
          <primitive object={wood.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 0.48, -0.09]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.62, 0.08]} />
          <primitive object={dark.clone()} attach="material" />
        </mesh>
      </group>

      <group position={[-12.25, 0.76, 13.1]}>
        <mesh position={[0, 0.64, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.28, 12]} />
          <primitive object={dark.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 1.28, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.3, 0.22, 0.42, 20]} />
          <primitive object={lampShade} attach="material" />
        </mesh>
        <pointLight position={[0, 1.18, 0]} intensity={1.8} color="#ffdba6" distance={3.2} decay={2} />
      </group>

      <Suspense fallback={null}>
        <DebrisPapersModel position={[-9.1, 0.02, 15.85]} rotation={[0.08, 0.14, 0.1]} scale={0.16} />
        <TshirtModel position={[-11.2, 0.01, 15.95]} rotation={[0.02, 0.08, -0.26]} scale={0.1} />
        <PaperModel position={[-8.7, 0.02, 14.28]} rotation={[0, -0.2, 0.04]} scale={0.085} />
      </Suspense>
    </>
  );
}

function LivingRoomPiano() {
  const { scene } = useGLTF(pianoModelPath);
  const sheet = useRoughMaterial("#d8cbb5", "#6d604c", 0.88, "paper");
  const brass = useRoughMaterial("#9a7b3f", "#35250e", 0.34, "none");
  const bench = useRoughMaterial("#211711", "#070403", 0.72, "wood");
  const piano = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });

    return clone;
  }, [scene]);

  return (
    <group position={[-12.34, 0, 15.18]} rotation={[0, Math.PI / 2, 0]}>
      <primitive object={piano} position={[0, 0.02, 0]} rotation={[0, Math.PI, 0]} scale={0.0085} />

      <group position={[0, 1.46, -0.26]} rotation={[-0.28, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.78, 0.46, 0.025]} />
          <primitive object={sheet} attach="material" />
        </mesh>
        <mesh position={[0, -0.02, 0.02]} castShadow>
          <boxGeometry args={[0.04, 0.42, 0.025]} />
          <primitive object={brass} attach="material" />
        </mesh>
      </group>

      <group position={[0, 0.34, -1.02]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.82, 0.12, 0.34]} />
          <primitive object={bench} attach="material" />
        </mesh>
        {[-0.3, 0.3].map((x) => (
          <mesh key={x} position={[x, -0.18, 0]} castShadow>
            <boxGeometry args={[0.07, 0.36, 0.07]} />
            <primitive object={bench.clone()} attach="material" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

useGLTF.preload(pianoModelPath);

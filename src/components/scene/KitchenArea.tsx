import { useRoughMaterial } from "./useRoughMaterial";
import { RoomLabel } from "./RoomLabel";
import { WallGroup } from "./WallGroup";
import { Suspense } from "react";
import { DebrisPapersModel, PaperModel, TshirtModel } from "./ImportedClutterModels";
import { KITCHEN_WALLS } from "../../lib/wallDefinitions";

export function KitchenArea() {
  const kitchenWall = useRoughMaterial("#202b31", "#0b1116", 0.82, "paint", {
    seed: "kitchen-wall",
    repeat: [3, 3],
    grimeStrength: 1.25,
    stainStrength: 1.2,
    warpStrength: 0.75,
  });
  const kitchenCabinet = useRoughMaterial("#dad4c8", "#5f5a50", 0.68, "wood", {
    seed: "kitchen-cabinet",
    repeat: [2, 3],
    grimeStrength: 1.05,
    edgeWear: 1.1,
  });
  const kitchenCounter = useRoughMaterial("#c6c1b5", "#6c6558", 0.6, "concrete", {
    seed: "kitchen-counter",
    repeat: [4, 4],
    grimeStrength: 1.1,
    stainStrength: 1.05,
  });
  const kitchenMetal = useRoughMaterial("#9ea6ad", "#394149", 0.34, "none");
  const kitchenDark = useRoughMaterial("#2a2f34", "#0a0d10", 0.5, "none");
  const kitchenWood = useRoughMaterial("#9a7f61", "#3e2c1e", 0.82, "wood", {
    seed: "kitchen-wood",
    repeat: [2, 3],
    grimeStrength: 0.95,
  });

  return (
    <>
      <WallGroup walls={KITCHEN_WALLS} materialForWall={() => kitchenWall.clone()} />
      <RoomLabel name="Kitchen" position={[-6.25, 1.2, 3.3]} />

      <group position={[-6.25, 0, 3.35]}>
        <mesh position={[0, 0.48, 3.1]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.96, 0.62]} />
          <primitive object={kitchenCabinet.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 1.02, 3.1]} castShadow receiveShadow>
          <boxGeometry args={[3.24, 0.12, 0.66]} />
          <primitive object={kitchenCounter.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.7, 0.96, 3.1]} castShadow receiveShadow>
          <boxGeometry args={[0.68, 0.06, 0.42]} />
          <primitive object={kitchenMetal.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.7, 0.94, 3.1]} castShadow receiveShadow>
          <boxGeometry args={[0.46, 0.05, 0.28]} />
          <primitive object={kitchenDark.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.7, 0.88, 3.1]} castShadow>
          <boxGeometry args={[0.08, 0.2, 0.08]} />
          <primitive object={kitchenMetal.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.32, 1.1, 3.02]} castShadow receiveShadow>
          <cylinderGeometry args={[0.045, 0.05, 0.14, 14]} />
          <primitive object={kitchenMetal.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.32, 1.11, 3.02]}>
          <cylinderGeometry args={[0.038, 0.043, 0.11, 14]} />
          <meshStandardMaterial color="#7fc0df" roughness={0.08} metalness={0} transparent opacity={0.45} />
        </mesh>

        <mesh position={[-1.35, 1.95, 3.16]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.68, 0.34]} />
          <primitive object={kitchenCabinet.clone()} attach="material" />
        </mesh>
        <mesh position={[0.25, 1.95, 3.16]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.68, 0.34]} />
          <primitive object={kitchenCabinet.clone()} attach="material" />
        </mesh>

        <mesh position={[2.2, 0.36, 3.1]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.72, 0.62]} />
          <primitive object={kitchenCabinet.clone()} attach="material" />
        </mesh>
        <mesh position={[2.2, 1.02, 3.1]} castShadow receiveShadow>
          <boxGeometry args={[0.94, 0.1, 0.66]} />
          <primitive object={kitchenCounter.clone()} attach="material" />
        </mesh>
        <mesh position={[2.2, 0.66, 3.1]} castShadow>
          <boxGeometry args={[0.56, 0.5, 0.04]} />
          <primitive object={kitchenDark.clone()} attach="material" />
        </mesh>
        <mesh position={[2.2, 0.94, 3.1]} castShadow>
          <boxGeometry args={[0.54, 0.04, 0.32]} />
          <primitive object={kitchenDark.clone()} attach="material" />
        </mesh>

        <mesh position={[0, 0.46, 0.5]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.1, 1.05]} />
          <primitive object={kitchenWood.clone()} attach="material" />
        </mesh>
        <mesh position={[0.84, 0.23, 0.13]} castShadow>
          <boxGeometry args={[0.09, 0.46, 0.09]} />
          <primitive object={kitchenDark.clone()} attach="material" />
        </mesh>
        <mesh position={[0.84, 0.23, 0.87]} castShadow>
          <boxGeometry args={[0.09, 0.46, 0.09]} />
          <primitive object={kitchenDark.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.84, 0.23, 0.13]} castShadow>
          <boxGeometry args={[0.09, 0.46, 0.09]} />
          <primitive object={kitchenDark.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.84, 0.23, 0.87]} castShadow>
          <boxGeometry args={[0.09, 0.46, 0.09]} />
          <primitive object={kitchenDark.clone()} attach="material" />
        </mesh>

        <mesh position={[-2.7, 1.2, 1.8]} castShadow receiveShadow>
          <boxGeometry args={[0.28, 2.4, 1.2]} />
          <primitive object={kitchenCabinet.clone()} attach="material" />
        </mesh>
        <mesh position={[-2.7, 0.78, 1.8]} castShadow>
          <boxGeometry args={[0.3, 0.04, 1.12]} />
          <primitive object={kitchenDark.clone()} attach="material" />
        </mesh>
        <mesh position={[-2.7, 1.38, 1.8]} castShadow>
          <boxGeometry args={[0.3, 0.04, 1.12]} />
          <primitive object={kitchenDark.clone()} attach="material" />
        </mesh>

        <KitchenChair position={[-0.62, 0, 1.14]} rotation={Math.PI} />
        <KitchenChair position={[0.62, 0, 1.14]} rotation={Math.PI} />
        <KitchenChair position={[-0.62, 0, -0.14]} rotation={0} />
        <KitchenChair position={[0.62, 0, -0.14]} rotation={0} />

        <KitchenAppliances />
        <KitchenCounterDetails />
        <KitchenClutter />
      </group>

      <rectAreaLight
        position={[-6.25, 3.65, 5.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={2.4}
        height={1.1}
        intensity={7.2}
        color="#ecf0dc"
      />
      <pointLight position={[-7.15, 1.45, 6.48]} intensity={0.95} color="#cddab9" distance={2.4} decay={2} />
      <pointLight position={[-4.8, 1.2, 2.4]} intensity={0.65} color="#8aa0a6" distance={2.2} decay={2.2} />
    </>
  );
}

function KitchenAppliances() {
  const fridge = useRoughMaterial("#dce3e6", "#7d8588", 0.3, "none");
  const dark = useRoughMaterial("#1c2022", "#060708", 0.58, "none");
  const metal = useRoughMaterial("#9fa8ad", "#3b4246", 0.28, "none");
  const tile = useRoughMaterial("#e2ddd1", "#69645c", 0.7, "concrete");

  return (
    <>
      <group position={[2.8, 1.05, 2.05]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.72, 2.1, 0.72]} />
          <primitive object={fridge} attach="material" />
        </mesh>
        <mesh position={[0.01, 0.28, -0.37]} castShadow>
          <boxGeometry args={[0.06, 1.18, 0.04]} />
          <primitive object={metal} attach="material" />
        </mesh>
        <mesh position={[0.01, -0.62, -0.37]} castShadow>
          <boxGeometry args={[0.06, 0.44, 0.04]} />
          <primitive object={metal.clone()} attach="material" />
        </mesh>
      </group>

      <group position={[1.35, 1.17, 3.45]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.72, 0.34, 0.28]} />
          <primitive object={dark} attach="material" />
        </mesh>
        <mesh position={[0, -0.03, -0.15]} castShadow>
          <boxGeometry args={[0.56, 0.17, 0.03]} />
          <primitive object={metal.clone()} attach="material" />
        </mesh>
      </group>

      <group position={[0.9, 1.12, 3.12]}>
        {[-0.16, 0.16].map((x) =>
          [-0.1, 0.14].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.02, z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.11, 0.011, 8, 20]} />
              <primitive object={dark.clone()} attach="material" />
            </mesh>
          )),
        )}
      </group>

      <group position={[-0.1, 1.36, 3.48]}>
        {[-1.08, -0.72, -0.36, 0, 0.36, 0.72, 1.08].map((x) => (
          <mesh key={x} position={[x, 0, 0]} receiveShadow>
            <boxGeometry args={[0.28, 0.32, 0.035]} />
            <primitive object={tile.clone()} attach="material" />
          </mesh>
        ))}
      </group>
    </>
  );
}

function KitchenCounterDetails() {
  const ceramic = useRoughMaterial("#e7e2d5", "#756f65", 0.72, "concrete", {
    seed: "kitchen-ceramic",
    repeat: [2, 2],
    grimeStrength: 0.9,
  });
  const glass = useRoughMaterial("#88b8c8", "#2e5965", 0.18, "none");
  const paper = useRoughMaterial("#d7cbb6", "#6f624f", 0.92, "paper", {
    seed: "kitchen-paper",
    repeat: [3, 3],
    grimeStrength: 0.85,
  });
  const dark = useRoughMaterial("#2a2f34", "#0a0d10", 0.46, "none");
  const wood = useRoughMaterial("#7d5f42", "#2f2014", 0.84, "wood", {
    seed: "kitchen-small-wood",
    repeat: [2, 3],
  });

  return (
    <>
      <group position={[-1.25, 1.1, 3.0]}>
        {[0, 0.06, 0.12].map((y) => (
          <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.025, 24]} />
            <primitive object={ceramic.clone()} attach="material" />
          </mesh>
        ))}
      </group>
      <mesh position={[-1.82, 1.17, 3.04]} rotation={[0.18, 0, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.03, 0.32]} />
        <primitive object={paper} attach="material" />
      </mesh>
      <mesh position={[-0.18, 1.18, 3.08]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.22, 18]} />
        <primitive object={glass} attach="material" />
      </mesh>
      <mesh position={[0.34, 0.56, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[0.52, 0.04, 0.34]} />
        <primitive object={dark} attach="material" />
      </mesh>
      <mesh position={[-0.88, 1.19, 3.06]} rotation={[0, 0.32, 0.18]} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.04, 0.28]} />
        <primitive object={wood} attach="material" />
      </mesh>
      <mesh position={[-0.64, 1.16, 3.07]} castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.18, 14]} />
        <primitive object={glass} attach="material" />
      </mesh>
      <mesh position={[0.72, 1.14, 2.98]} rotation={[0.18, 0.04, -0.14]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.16, 0.08]} />
        <primitive object={paper} attach="material" />
      </mesh>
    </>
  );
}

function KitchenClutter() {
  const wood = useRoughMaterial("#6d523c", "#281b12", 0.88, "wood", {
    seed: "kitchen-serving-board",
    repeat: [2, 3],
  });

  return (
    <>
      <mesh position={[-2.2, 1.06, 2.86]} rotation={[0.14, 0.12, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.36, 0.04, 0.24]} />
        <primitive object={wood} attach="material" />
      </mesh>
      <Suspense fallback={null}>
        <PaperModel position={[-2.12, 1.08, 3.0]} rotation={[0.1, 0.22, -0.04]} scale={0.075} />
        <TshirtModel position={[1.42, 0.02, 0.95]} rotation={[0.14, -0.24, -0.42]} scale={0.17} />
        <DebrisPapersModel position={[1.98, 0.01, 0.84]} rotation={[0.08, 0.15, 0.08]} scale={0.11} />
      </Suspense>
      <mesh position={[-0.42, 0.03, 2.9]} rotation={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[0.62, 0.02, 0.46]} />
        <primitive object={wood.clone()} attach="material" />
      </mesh>
    </>
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

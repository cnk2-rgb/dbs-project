import { useRoughMaterial } from "./useRoughMaterial";
import { DebugWallLabel } from "./DebugWallLabel";
import { RoomLabel } from "./RoomLabel";

export function KitchenArea() {
  const kitchenWall = useRoughMaterial("#202b31", "#0b1116", 0.76, "paint");
  const kitchenCabinet = useRoughMaterial("#dad4c8", "#5f5a50", 0.62, "wood");
  const kitchenCounter = useRoughMaterial("#c6c1b5", "#6c6558", 0.52, "concrete");
  const kitchenMetal = useRoughMaterial("#9ea6ad", "#394149", 0.28, "none");
  const kitchenDark = useRoughMaterial("#2a2f34", "#0a0d10", 0.46, "none");
  const kitchenWood = useRoughMaterial("#9a7f61", "#3e2c1e", 0.78, "wood");
  const kitchenFridge = useRoughMaterial("#e8ecef", "#8f989f", 0.24, "none");

  return (
    <>
      <mesh position={[-8.45, 2.1, 0.55]} receiveShadow>
        {/* Wall J */}
        <boxGeometry args={[2.1, 4.2, 0.14]} />
        <primitive object={kitchenWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel id="J" position={[-8.45, 2.1, 0.4]} oppositePosition={[-8.45, 2.1, 0.7]} rotationY={0} />
      <mesh position={[-4.9, 2.1, 0.55]} receiveShadow>
        {/* Wall K */}
        <boxGeometry args={[2.8, 4.2, 0.14]} />
        <primitive object={kitchenWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel id="K" position={[-4.9, 2.1, 0.4]} oppositePosition={[-4.9, 2.1, 0.7]} rotationY={0} />
      <mesh position={[-6.25, 2.1, 9.1]} receiveShadow>
        {/* Wall R */}
        <boxGeometry args={[6.5, 4.2, 0.14]} />
        <primitive object={kitchenWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel id="R" position={[-6.25, 2.1, 8.95]} oppositePosition={[-6.25, 2.1, 9.25]} rotationY={0} />
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
      </group>

      <rectAreaLight
        position={[-6.25, 3.65, 5.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={2.4}
        height={1.1}
        intensity={9}
        color="#fff2d1"
      />
      <pointLight position={[-7.15, 1.45, 6.48]} intensity={1.2} color="#ffe8ba" distance={2.4} decay={2} />
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
  const ceramic = useRoughMaterial("#e7e2d5", "#756f65", 0.66, "concrete");
  const glass = useRoughMaterial("#88b8c8", "#2e5965", 0.18, "none");
  const paper = useRoughMaterial("#d7cbb6", "#6f624f", 0.92, "paper");
  const dark = useRoughMaterial("#2a2f34", "#0a0d10", 0.46, "none");

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

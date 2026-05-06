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
      </group>
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

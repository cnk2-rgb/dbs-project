import { useRoughMaterial } from "./useRoughMaterial";

export function KitchenArea() {
  const kitchenCabinet = useRoughMaterial("#dad4c8", "#5f5a50", 0.62, "wood");
  const kitchenCounter = useRoughMaterial("#c6c1b5", "#6c6558", 0.52, "concrete");
  const kitchenMetal = useRoughMaterial("#9ea6ad", "#394149", 0.28, "none");
  const kitchenDark = useRoughMaterial("#2a2f34", "#0a0d10", 0.46, "none");
  const kitchenWood = useRoughMaterial("#9a7f61", "#3e2c1e", 0.78, "wood");

  return (
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

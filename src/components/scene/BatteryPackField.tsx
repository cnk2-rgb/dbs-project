import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, MathUtils, MeshStandardMaterial, Vector3 } from "three";
import { playPhonePickupClick } from "../../lib/audio";
import { useRoughMaterial } from "./useRoughMaterial";

type BatteryPackDefinition = {
  id: string;
  position: [number, number, number];
  rotationY: number;
};

const batteryPackDefinitions: BatteryPackDefinition[] = [
  { id: "pack-1", position: [-3.95, 0.48, -2.05], rotationY: 0.18 },
  { id: "pack-2", position: [-5.25, 0.48, -1.45], rotationY: -0.36 },
  { id: "pack-3", position: [-6.95, 0.48, 0.55], rotationY: 0.11 },
  { id: "pack-4", position: [-8.45, 0.48, 4.9], rotationY: -0.22 },
  { id: "pack-5", position: [-9.9, 0.48, 10.5], rotationY: 0.26 },
  { id: "pack-6", position: [-8.15, 0.48, 14.85], rotationY: -0.14 },
];

export function BatteryPackField({
  visible,
  collectedPackIds,
  onCollectPack,
}: {
  visible: boolean;
  collectedPackIds: string[];
  onCollectPack: (packId: string) => void;
}) {
  if (!visible) return null;

  return (
    <group>
      {batteryPackDefinitions.map((pack) => (
        <BatteryPack
          key={pack.id}
          position={pack.position}
          rotationY={pack.rotationY}
          collected={collectedPackIds.includes(pack.id)}
          onCollect={() => {
            playPhonePickupClick();
            onCollectPack(pack.id);
          }}
        />
      ))}
    </group>
  );
}

function BatteryPack({
  position,
  rotationY,
  collected,
  onCollect,
}: {
  position: [number, number, number];
  rotationY: number;
  collected: boolean;
  onCollect: () => void;
}) {
  const groupRef = useRef<Group>(null);
  const hovered = useRef(false);
  const baseY = position[1];
  const bodyMaterial = useRoughMaterial("#f4d84c", "#423a0c", 0.48, "none");
  const faceMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#fff9cf",
        emissive: "#8a7612",
        emissiveIntensity: 0.12,
        roughness: 0.18,
        metalness: 0.02,
      }),
    [],
  );

  useFrame(() => {
    if (!groupRef.current || collected) return;
    const now = performance.now() * 0.002;
    groupRef.current.position.y = baseY + Math.sin(now + rotationY) * 0.06;
    groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, rotationY + Math.sin(now * 0.4) * 0.08, 0.08);
    groupRef.current.scale.lerp(new Vector3(hovered.current ? 1.08 : 1, hovered.current ? 1.08 : 1, hovered.current ? 1.08 : 1), 0.12);
  });

  if (collected) {
    return null;
  }

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
      onPointerOver={(event) => {
        event.stopPropagation();
        hovered.current = true;
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        hovered.current = false;
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        if (!collected) {
          onCollect();
        }
      }}
    >
      {!collected && (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.14, 0.34]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>
      )}
      {!collected && (
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 0.08, 0.12]} />
          <primitive object={faceMaterial} attach="material" />
        </mesh>
      )}
      {!collected && (
        <pointLight position={[0, 0.18, 0]} intensity={0.5} color="#ffd84d" distance={1.15} decay={2} />
      )}
    </group>
  );
}

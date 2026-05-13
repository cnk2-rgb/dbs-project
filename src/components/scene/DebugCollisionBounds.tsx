import { Text } from "@react-three/drei";
import { WORLD_COLLISION_BOXES } from "../../lib/worldCollision";

const DEBUG_BOX_COLOR = "#ffd400";

export function DebugCollisionBounds() {
  if (!import.meta.env.DEV) return null;

  return (
    <group renderOrder={999}>
      {WORLD_COLLISION_BOXES.map((box) => {
        const width = box.maxX - box.minX;
        const depth = box.maxZ - box.minZ;
        const centerX = box.minX + width / 2;
        const centerZ = box.minZ + depth / 2;
        const height = 4.35;

        return (
          <group key={box.id}>
            <mesh position={[centerX, height / 2, centerZ]} renderOrder={999}>
              <boxGeometry args={[width, height, depth]} />
              <meshBasicMaterial
                color={DEBUG_BOX_COLOR}
                transparent
                opacity={0.08}
                depthWrite={false}
                wireframe={false}
              />
            </mesh>
            <mesh position={[centerX, height / 2, centerZ]} renderOrder={1000}>
              <boxGeometry args={[width, height, depth]} />
              <meshBasicMaterial
                color={DEBUG_BOX_COLOR}
                transparent
                opacity={0.34}
                depthWrite={false}
                wireframe
              />
            </mesh>
            <Text
              position={[centerX, height + 0.12, centerZ]}
              fontSize={0.2}
              color={DEBUG_BOX_COLOR}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.03}
              outlineColor="#2b2100"
              renderOrder={1001}
            >
              {box.id}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

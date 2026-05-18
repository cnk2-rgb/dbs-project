import { DebugWallLabel } from "./DebugWallLabel";
import type { WallDefinition } from "../../lib/wallDefinitions";
import type { Material } from "three";

export function WallGroup({
  walls,
  materialForWall,
}: {
  walls: WallDefinition[];
  materialForWall: (wall: WallDefinition) => Material | Material[];
}) {
  return (
    <>
      {walls.map((wall) => (
        <group key={wall.id}>
          <mesh
            position={wall.position}
            rotation={wall.rotationY ? [0, wall.rotationY, 0] : undefined}
            receiveShadow
          >
            <boxGeometry args={wall.size} />
            <primitive object={materialForWall(wall)} attach="material" />
          </mesh>
          {wall.label ? (
            <DebugWallLabel
              id={wall.id}
              position={wall.label.position}
              oppositePosition={wall.label.oppositePosition}
              rotationY={wall.label.rotationY}
              rotation={wall.label.rotation}
            />
          ) : null}
        </group>
      ))}
    </>
  );
}

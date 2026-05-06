import { Text } from "@react-three/drei";

export function DebugWallLabel({
  id,
  position,
  oppositePosition,
  rotationY = 0,
  rotation,
}: {
  id: string;
  position: [number, number, number];
  oppositePosition?: [number, number, number];
  rotationY?: number;
  rotation?: [number, number, number];
}) {
  if (!import.meta.env.DEV) return null;
  const textRotation = rotation ?? ([0, rotationY, 0] as [number, number, number]);

  return (
    <>
      <Text
        position={position}
        rotation={textRotation}
        fontSize={0.22}
        color="#ffd866"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#111111"
        renderOrder={999}
      >
        {id}
      </Text>
      {oppositePosition ? (
        <Text
          position={oppositePosition}
          rotation={textRotation}
          fontSize={0.22}
          color="#ffd866"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#111111"
          renderOrder={999}
        >
          {id}
        </Text>
      ) : null}
    </>
  );
}

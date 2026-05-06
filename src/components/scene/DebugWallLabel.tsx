import { Text } from "@react-three/drei";

export function DebugWallLabel({
  id,
  position,
}: {
  id: string;
  position: [number, number, number];
}) {
  if (!import.meta.env.DEV) return null;

  return (
    <Text
      position={position}
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
  );
}

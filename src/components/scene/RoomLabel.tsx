import { Text } from "@react-three/drei";

export function RoomLabel({
  name,
  position,
}: {
  name: string;
  position: [number, number, number];
}) {
  return (
    <Text
      position={position}
      fontSize={0.26}
      color="#d9e6ec"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.02}
      outlineColor="#0a0d10"
    >
      {name}
    </Text>
  );
}

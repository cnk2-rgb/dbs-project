import type { Vector3 } from "three";

export type CollisionBox = {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  ignoreWhenBedroomDoorOpen?: boolean;
};

const collisionPadding = 0.16;

export const WORLD_COLLISION_BOXES: CollisionBox[] = [
  // Bedroom
  // Wall A
  { id: "A", minX: -3.59, maxX: -3.41, minZ: -4.18, maxZ: -3.91 },
  // Wall B
  { id: "B", minX: -3.59, maxX: -3.41, minZ: -4.65, maxZ: -2.0 },
  // Wall C, with the bedroom door opening left passable when open
  { id: "C", minX: -3.59, maxX: -3.41, minZ: -2.0, maxZ: -0.8, ignoreWhenBedroomDoorOpen: true },
  // Wall D
  { id: "D", minX: -3.59, maxX: -3.41, minZ: -0.8, maxZ: 4.0 },
  // Wall E
  { id: "E", minX: 3.41, maxX: 3.59, minZ: -4.0, maxZ: 4.0 },
  // Bedroom back wall behind the bed
  { id: "BACK", minX: -3.5, maxX: 3.5, minZ: 4.0, maxZ: 4.18 },

  // Hallway
  // Wall F
  { id: "F", minX: -7.555, maxX: -3.495, minZ: -2.135, maxZ: -2.065 },
  // Wall I
  { id: "I", minX: -9.9975, maxX: -9.1525, minZ: -2.135, maxZ: -2.065 },
  // Wall Y
  { id: "Y", minX: -11.255, maxX: -10.005, minZ: -2.135, maxZ: -2.065 },
  // Wall Q
  // Removed: main hallway divider that blocked the hallway-to-kitchen path.
  // Wall N
  { id: "N", minX: -11.325, maxX: -11.175, minZ: -4.6375, maxZ: -1.8125 },
  // Wall O
  { id: "O", minX: -11.325, maxX: -11.175, minZ: -4.0375, maxZ: -1.2875 },
  // Wall P
  { id: "P", minX: -11.325, maxX: -11.175, minZ: -3.275, maxZ: -2.725 },
  // Wall T
  { id: "T", minX: -9.57, maxX: -9.43, minZ: -0.4125, maxZ: 5.3375 },
  // Wall S lower segment
  { id: "S-L", minX: -11.325, maxX: -11.175, minZ: -0.6125, maxZ: 1.6375 },
  // Wall S upper segment
  { id: "S-U", minX: -11.325, maxX: -11.175, minZ: 2.7625, maxZ: 3.6125 },
  // Wall S lintel over bathroom doorway
  { id: "S-LINTEL", minX: -11.325, maxX: -11.175, minZ: 1.625, maxZ: 2.175 },
  // Bathroom outer wall BA-L
  { id: "BA-L", minX: -13.87, maxX: -13.53, minZ: -0.25, maxZ: 4.05 },
  // Bathroom top wall BA-T
  { id: "BA-T", minX: -13.7, maxX: -11.0, minZ: 2.9, maxZ: 3.05 },
  // Bathroom bottom wall BA-B
  { id: "BA-B", minX: -13.7, maxX: -11.0, minZ: -0.05, maxZ: 0.1 },
  // Living room left wall LR-L
  { id: "LR-L", minX: -13.045, maxX: -12.705, minZ: 4.1, maxZ: 7.1 },
  // Living room right wall LR-R
  { id: "LR-R", minX: -8.045, maxX: -7.705, minZ: 4.1, maxZ: 7.1 },
  // Living room connector wall LR-C
  { id: "LR-C", minX: -9.5005, maxX: -7.8745, minZ: 5.315, maxZ: 5.385 },
  // Living room far wall LR-F
  { id: "LR-F", minX: -10.375, maxX: -5.375, minZ: 7.815, maxZ: 7.885 },

  // Kitchen
  // Wall J
  { id: "J", minX: -9.5, maxX: -7.4, minZ: 0.48, maxZ: 0.62 },
  // Wall K
  { id: "K", minX: -6.3, maxX: -3.5, minZ: 0.48, maxZ: 0.62 },
  // Wall R
  { id: "R", minX: -9.5, maxX: -3.0, minZ: 9.03, maxZ: 9.17 },

  // Office
  // Wall U
  { id: "U", minX: -14.9, maxX: -10.3, minZ: -3.17, maxZ: -3.03 },
  // Wall V
  { id: "V", minX: -14.92, maxX: -10.28, minZ: -8.17, maxZ: -8.03 },
  // Wall W
  { id: "W", minX: -14.97, maxX: -14.83, minZ: -6.85, maxZ: -4.35 },
];

export function isBlockedByWorldCollision(position: Vector3, bedroomDoorOpen: boolean) {
  return WORLD_COLLISION_BOXES.some((box) => {
    if (box.ignoreWhenBedroomDoorOpen && isBedroomDoorwayClear(position, bedroomDoorOpen)) return false;

    return (
      position.x >= box.minX - collisionPadding &&
      position.x <= box.maxX + collisionPadding &&
      position.z >= box.minZ - collisionPadding &&
      position.z <= box.maxZ + collisionPadding
    );
  });
}

function isBedroomDoorwayClear(position: Vector3, bedroomDoorOpen: boolean) {
  if (bedroomDoorOpen) return true;

  return position.x <= -3.22 && position.z > -2.15 && position.z < -0.55;
}

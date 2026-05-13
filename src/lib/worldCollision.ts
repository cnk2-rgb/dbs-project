import type { Vector3 } from "three";
import {
  BEDROOM_WALLS,
  BEDROOM_WORLD_TRANSFORM,
  HALLWAY_WALLS,
  HALLWAY_WORLD_TRANSFORM,
  OFFICE_WALLS,
  OFFICE_WORLD_TRANSFORM,
  KITCHEN_WALLS,
  KITCHEN_WORLD_TRANSFORM,
  wallsToWorldCollisionBoxes,
} from "./wallDefinitions";

export type CollisionBox = {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  ignoreWhenBedroomDoorOpen?: boolean;
};

const collisionPadding = 0;

export const WORLD_COLLISION_BOXES: CollisionBox[] = [
  ...wallsToWorldCollisionBoxes(BEDROOM_WALLS, BEDROOM_WORLD_TRANSFORM),
  ...wallsToWorldCollisionBoxes(HALLWAY_WALLS, HALLWAY_WORLD_TRANSFORM),
  ...wallsToWorldCollisionBoxes(OFFICE_WALLS, OFFICE_WORLD_TRANSFORM),
  ...wallsToWorldCollisionBoxes(KITCHEN_WALLS, KITCHEN_WORLD_TRANSFORM),
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

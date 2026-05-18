export type Vec3 = [number, number, number];

export type WallLabelDefinition = {
  position: Vec3;
  oppositePosition?: Vec3;
  rotationY?: number;
  rotation?: Vec3;
};

export type WallDefinition = {
  id: string;
  position: Vec3;
  size: Vec3;
  collisionPosition?: Vec3;
  collisionSize?: Vec3;
  rotationY?: number;
  collision?: boolean;
  ignoreWhenBedroomDoorOpen?: boolean;
  label?: WallLabelDefinition;
};

export type WorldTransform = {
  position: Vec3;
  scale: Vec3;
};

export const IDENTITY_WORLD_TRANSFORM: WorldTransform = {
  position: [0, 0, 0],
  scale: [1, 1, 1],
};

export const BEDROOM_WORLD_TRANSFORM: WorldTransform = IDENTITY_WORLD_TRANSFORM;
export const HALLWAY_WORLD_TRANSFORM: WorldTransform = {
  position: [0, 0, -0.7],
  scale: [1, 1, 0.5],
};
export const OFFICE_WORLD_TRANSFORM: WorldTransform = {
  position: [0, 0, -7.05],
  scale: [1, 1, 1],
};
export const KITCHEN_WORLD_TRANSFORM: WorldTransform = HALLWAY_WORLD_TRANSFORM;

export const BEDROOM_WALLS: WallDefinition[] = [
  {
    id: "A",
    position: [0, 2.25, -4],
    size: [7, 4.5, 0.18],
    label: {
      position: [0, 2.25, -3.86],
      oppositePosition: [0, 2.25, -4.14],
      rotationY: 0,
    },
  },
  {
    id: "B",
    position: [-3.5, 2.25, -3.325],
    size: [0.18, 4.5, 2.65],
    label: {
      position: [-3.36, 2.25, -3.325],
      oppositePosition: [-3.64, 2.25, -3.325],
      rotationY: Math.PI / 2,
    },
  },
  {
    id: "C",
    position: [-3.5, 2.25, 1.6],
    size: [0.18, 4.5, 4.8],
  },
  {
    id: "D",
    position: [-3.5, 3.35, -1.4],
    size: [0.18, 2.3, 1.2],
    collision: false,
    label: {
      position: [-3.36, 3.35, -1.4],
      oppositePosition: [-3.64, 3.35, -1.4],
      rotationY: Math.PI / 2,
    },
  },
  {
    id: "E",
    position: [3.5, 2.25, 0],
    size: [8, 4.5, 0.18],
    rotationY: Math.PI / 2,
    label: {
      position: [3.36, 2.25, 0],
      oppositePosition: [3.64, 2.25, 0],
      rotationY: Math.PI / 2,
    },
  },
  {
    id: "BACK",
    position: [0, 2.25, 4.09],
    size: [7, 4.5, 0.18],
  },
];

export const HALLWAY_WALLS: WallDefinition[] = [
  {
    id: "F",
    position: [-5.525, 2.1, -2.8],
    size: [4.05, 4.2, 0.14],
    label: {
      position: [-5.525, 2.1, -2.65],
      oppositePosition: [-5.525, 2.1, -2.95],
      rotationY: 0,
    },
  },
  {
    id: "I",
    position: [-9.575, 2.1, -2.8],
    size: [0.85, 4.2, 0.14],
    label: {
      position: [-9.575, 2.1, -2.65],
      oppositePosition: [-9.575, 2.1, -2.95],
      rotationY: 0,
    },
  },
  {
    id: "Y",
    position: [-10.625, 2.1, -2.8],
    size: [1.25, 4.2, 0.14],
    label: {
      position: [-10.625, 2.1, -2.65],
      oppositePosition: [-10.625, 2.1, -2.95],
      rotationY: 0,
    },
  },
  {
    id: "M",
    position: [-7.42, 2.1, -7.9],
    size: [7.66, 4.2, 0.14],
    label: {
      position: [-7.42, 2.1, -7.75],
      oppositePosition: [-7.42, 2.1, -8.05],
      rotationY: 0,
    },
  },
  {
    id: "N",
    position: [-11.25, 2.1, -6.525],
    size: [0.14, 4.2, 2.75],
    label: {
      position: [-11.08, 2.1, -6.525],
      oppositePosition: [-11.42, 2.1, -6.525],
      rotationY: Math.PI / 2,
    },
  },
  {
    id: "O",
    position: [-11.25, 2.1, -2.925],
    size: [0.14, 4.2, 2.25],
    label: {
      position: [-11.08, 2.1, -2.925],
      oppositePosition: [-11.42, 2.1, -2.925],
      rotationY: Math.PI / 2,
    },
  },
  {
    id: "P",
    position: [-11.25, 2.85, -4.6],
    size: [0.14, 1.4, 1.1],
    collision: false,
    label: {
      position: [-11.08, 2.85, -4.6],
      oppositePosition: [-11.42, 2.85, -4.6],
      rotationY: Math.PI / 2,
    },
  },
  {
    id: "T",
    position: [-9.5, 2.1, 6.325],
    size: [0.14, 4.2, 11.55],
    label: {
      position: [-9.33, 2.1, 6.325],
      oppositePosition: [-9.67, 2.1, 6.325],
      rotationY: Math.PI / 2,
    },
  },
  {
    id: "S-L",
    position: [-11.25, 2.1, 1.425],
    size: [0.14, 4.2, 6.45],
    label: {
      position: [-11.08, 2.1, 1.425],
      oppositePosition: [-11.42, 2.1, 1.425],
      rotationY: Math.PI / 2,
    },
  },
  {
    id: "S-U",
    position: [-11.25, 2.1, 7.775],
    size: [0.14, 4.2, 4.05],
  },
  {
    id: "S-LINTEL",
    position: [-11.25, 3.5, 5.2],
    size: [0.14, 1.4, 1.1],
    collision: false,
  },
  {
    id: "BA-L",
    position: [-13.7, 2.1, 5.2],
    size: [0.14, 4.2, 4.3],
    label: {
      position: [-13.53, 2.1, 5.2],
      oppositePosition: [-13.87, 2.1, 5.2],
      rotationY: Math.PI / 2,
    },
  },
  {
    id: "BA-T",
    position: [-12.475, 2.1, 7.35],
    size: [2.45, 4.2, 0.14],
    label: {
      position: [-12.475, 2.1, 7.2],
      oppositePosition: [-12.475, 2.1, 7.5],
      rotationY: 0,
    },
  },
  {
    id: "BA-B",
    position: [-12.475, 2.1, 3.05],
    size: [2.45, 4.2, 0.14],
    label: {
      position: [-12.475, 2.1, 2.9],
      oppositePosition: [-12.475, 2.1, 3.2],
      rotationY: 0,
    },
  },
  {
    id: "BA-Connector",
    position: [-12.475, 2.1, 9.725],
    size: [2.45, 4.2, 4.75],
  },
  {
    id: "LR-L",
    position: [-12.875, 2.1, 14.6],
    size: [0.14, 4.2, 5.0],
    label: {
      position: [-12.705, 2.1, 14.6],
      oppositePosition: [-13.045, 2.1, 14.6],
      rotationY: Math.PI / 2,
    },
  },
  {
    id: "LR-R",
    position: [-7.875, 2.1, 14.6],
    size: [0.14, 4.2, 5.0],
    label: {
      position: [-7.705, 2.1, 14.6],
      oppositePosition: [-8.045, 2.1, 14.6],
      rotationY: Math.PI / 2,
    },
  },
  {
    id: "LR-C",
    position: [-8.6875, 2.1, 12.1],
    size: [1.625, 4.2, 0.14],
    label: {
      position: [-8.6875, 2.1, 11.95],
      oppositePosition: [-8.6875, 2.1, 12.25],
      rotationY: 0,
    },
  },
  {
    id: "LR-F",
    position: [-10.375, 2.1, 17.1],
    size: [5.0, 4.2, 0.14],
    label: {
      position: [-10.375, 2.1, 16.95],
      oppositePosition: [-10.375, 2.1, 17.25],
      rotationY: 0,
    },
  },
];

export const KITCHEN_WALLS: WallDefinition[] = [
  {
    id: "J",
    position: [-8.45, 2.1, 0.55],
    size: [2.1, 4.2, 0.14],
    label: {
      position: [-8.45, 2.1, 0.4],
      oppositePosition: [-8.45, 2.1, 0.7],
      rotationY: 0,
    },
  },
  {
    id: "K",
    position: [-4.9, 2.1, 0.55],
    size: [2.8, 4.2, 0.14],
    label: {
      position: [-4.9, 2.1, 0.4],
      oppositePosition: [-4.9, 2.1, 0.7],
      rotationY: 0,
    },
  },
  {
    id: "R",
    position: [-6.25, 2.1, 9.1],
    size: [6.5, 4.2, 0.14],
    label: {
      position: [-6.25, 2.1, 8.95],
      oppositePosition: [-6.25, 2.1, 9.25],
      rotationY: 0,
    },
  },
];

export const OFFICE_WALLS: WallDefinition[] = [
  {
    id: "U",
    position: [-13.1, 2.1, 3.95],
    size: [3.6, 4.2, 0.14],
    collision: false,
    label: {
      position: [-13.1, 2.1, 3.8],
      oppositePosition: [-13.1, 2.1, 4.1],
      rotationY: 0,
    },
  },
  {
    id: "V",
    position: [-13.1, 2.1, -1.05],
    size: [3.84, 4.2, 0.14],
    collision: false,
    label: {
      position: [-13.1, 2.1, -0.9],
      oppositePosition: [-13.1, 2.1, -1.2],
      rotationY: 0,
    },
  },
  {
    id: "W",
    position: [-14.9, 2.1, 1.45],
    size: [0.14, 4.2, 5.0],
    collision: false,
    label: {
      position: [-14.74, 2.1, 1.45],
      oppositePosition: [-15.06, 2.1, 1.45],
      rotationY: Math.PI / 2,
    },
  },
];

export function wallToWorldCollisionBox(wall: WallDefinition, transform: WorldTransform) {
  if (wall.collision === false) return null;

  const rotationY = wall.rotationY ?? 0;
  const rotatedQuarterTurn = Math.abs(Math.abs(rotationY) - Math.PI / 2) < 1e-3;

  const [localX, , localZ] = wall.collisionPosition ?? wall.position;
  const [sizeX, , sizeZ] = wall.collisionSize ?? wall.size;
  const [scaleX, , scaleZ] = transform.scale;
  const [offsetX, , offsetZ] = transform.position;

  const worldCenterX = offsetX + localX * scaleX;
  const worldCenterZ = offsetZ + localZ * scaleZ;

  const halfX = (rotatedQuarterTurn ? sizeZ / 2 : sizeX / 2) * scaleX;
  const halfZ = (rotatedQuarterTurn ? sizeX / 2 : sizeZ / 2) * scaleZ;

  return {
    id: wall.id,
    minX: worldCenterX - halfX,
    maxX: worldCenterX + halfX,
    minZ: worldCenterZ - halfZ,
    maxZ: worldCenterZ + halfZ,
    ignoreWhenBedroomDoorOpen: wall.ignoreWhenBedroomDoorOpen,
  };
}

export function wallsToWorldCollisionBoxes(walls: WallDefinition[], transform: WorldTransform) {
  return walls.map((wall) => wallToWorldCollisionBox(wall, transform)).filter((box): box is NonNullable<typeof box> => box !== null);
}

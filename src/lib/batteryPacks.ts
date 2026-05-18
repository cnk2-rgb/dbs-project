import { Vector3 } from "three";
import { WORLD_COLLISION_BOXES, getWorldCollisionClearance, isBlockedByWorldCollision, isPointInsideCollisionBox } from "./worldCollision";

export type BatteryPackDefinition = {
  id: string;
  position: [number, number, number];
  rotationY: number;
};

export type BatteryPackValidationReport = {
  pack: BatteryPackDefinition;
  centerBlocked: boolean;
  centerBlockingBoxIds: string[];
  nearestFreeStandingPoint: Vector3 | null;
  nearestFreeStandingDistance: number | null;
  nearestFreeStandingClearance: number | null;
  reachableFromBedroomPath: boolean;
  tooTight: boolean;
};

export const BATTERY_PACK_DEFINITIONS: BatteryPackDefinition[] = [
  { id: "pack-1", position: [-3.18, 0.48, -2.58], rotationY: 0.18 },
  { id: "pack-2", position: [-13.1, 0.48, 2.2], rotationY: -0.36 },
  { id: "pack-3", position: [-7.85, 0.48, 2.2], rotationY: 0.11 },
  { id: "pack-4", position: [-10.05, 0.48, 6.85], rotationY: -0.22 },
  { id: "pack-5", position: [-10.28, 0.48, 14.55], rotationY: 0.26 },
  { id: "pack-6", position: [-10.18, 0.48, 16.55], rotationY: -0.14 },
];

const BATTERY_PACK_FOCUS_POINTS: Record<string, [number, number, number]> = {
  "pack-1": [-2.18, 1.64, -2.58],
  "pack-2": [-12.05, 1.64, 2.2],
  "pack-3": [-6.85, 1.64, 2.2],
  "pack-4": [-9.0, 1.64, 6.85],
  "pack-5": [-9.98, 1.64, 14.55],
  "pack-6": [-9.88, 1.64, 16.55],
};

export const BATTERY_PACK_HIT_BOX_SIZE: [number, number, number] = [0.88, 0.62, 0.98];
export const BATTERY_PACK_HIT_BOX_OFFSET: [number, number, number] = [0, 0.12, 0];
export const BATTERY_PACK_MIN_CLEARANCE = 0.24;

const bedroomAccessStart = new Vector3(-0.72, 1.64, 3.12);
const collisionSearchStep = 0.35;
const collisionSearchBounds = {
  minX: -14.7,
  maxX: 3.2,
  minZ: -4.25,
  maxZ: 17.8,
};

export const BATTERY_PACK_VALIDATION_REPORTS = validateBatteryPackDefinitions(BATTERY_PACK_DEFINITIONS);

export function validateBatteryPackDefinitions(definitions: BatteryPackDefinition[]) {
  return definitions.map((pack) => validateBatteryPackDefinition(pack));
}

export function validateBatteryPackDefinition(pack: BatteryPackDefinition): BatteryPackValidationReport {
  const packPosition = new Vector3(pack.position[0], pack.position[1], pack.position[2]);
  const centerBlockingBoxIds = WORLD_COLLISION_BOXES.filter((box) => isPointInsideCollisionBox(packPosition, box)).map(
    (box) => box.id,
  );
  const centerBlocked = centerBlockingBoxIds.length > 0;
  const nearestFreeStandingPoint = findNearestFreeStandingPoint(packPosition);
  const nearestFreeStandingDistance = nearestFreeStandingPoint
    ? Math.hypot(nearestFreeStandingPoint.x - packPosition.x, nearestFreeStandingPoint.z - packPosition.z)
    : null;
  const nearestFreeStandingClearance = nearestFreeStandingPoint
    ? getWorldCollisionClearance(nearestFreeStandingPoint)
    : null;
  const reachableFromBedroomPath = nearestFreeStandingPoint ? isReachableFromBedroomPath(nearestFreeStandingPoint) : false;
  const tooTight =
    nearestFreeStandingClearance !== null && nearestFreeStandingClearance < BATTERY_PACK_MIN_CLEARANCE;

  return {
    pack,
    centerBlocked,
    centerBlockingBoxIds,
    nearestFreeStandingPoint,
    nearestFreeStandingDistance,
    nearestFreeStandingClearance,
    reachableFromBedroomPath,
    tooTight,
  };
}

export function getBatteryPackDebugSummary(report: BatteryPackValidationReport) {
  const centerSummary = report.centerBlocked ? `blocked by ${report.centerBlockingBoxIds.join(",")}` : "clear";
  const standingSummary = report.nearestFreeStandingPoint
    ? `stand ${report.nearestFreeStandingDistance?.toFixed(2)}m, clearance ${report.nearestFreeStandingClearance?.toFixed(2)}m`
    : "no standing point";
  const pathSummary = report.reachableFromBedroomPath ? "reachable" : "unreachable";

  return [centerSummary, standingSummary, pathSummary].join(" | ");
}

export function getBatteryPackFocusPoint(pack: BatteryPackDefinition) {
  const directFocusPoint = BATTERY_PACK_FOCUS_POINTS[pack.id];
  if (directFocusPoint) {
    const directFocusVector = new Vector3(directFocusPoint[0], directFocusPoint[1], directFocusPoint[2]);
    if (!isBlockedByWorldCollision(directFocusVector, true)) {
      return directFocusVector;
    }
  }

  const report = validateBatteryPackDefinition(pack);
  return report.nearestFreeStandingPoint ?? new Vector3(pack.position[0], bedroomAccessStart.y, pack.position[2]);
}

function findNearestFreeStandingPoint(packPosition: Vector3) {
  const packHeight = bedroomAccessStart.y;
  const radiusSteps = Array.from({ length: 16 }, (_, index) => 0.3 + index * 0.1);
  const angleSteps = 16;

  for (const radius of radiusSteps) {
    for (let angleIndex = 0; angleIndex < angleSteps; angleIndex += 1) {
      const angle = (angleIndex / angleSteps) * Math.PI * 2;
      const candidate = new Vector3(
        packPosition.x + Math.cos(angle) * radius,
        packHeight,
        packPosition.z + Math.sin(angle) * radius,
      );

      if (isBlockedByWorldCollision(candidate, true)) continue;
      return candidate;
    }
  }

  return null;
}

function isReachableFromBedroomPath(target: Vector3) {
  const startX = snapToSearchGrid(bedroomAccessStart.x);
  const startZ = snapToSearchGrid(bedroomAccessStart.z);
  const targetX = snapToSearchGrid(target.x);
  const targetZ = snapToSearchGrid(target.z);
  const queue: Array<{ x: number; z: number }> = [{ x: startX, z: startZ }];
  const visited = new Set<string>([gridKey(startX, startZ)]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    const position = new Vector3(current.x, bedroomAccessStart.y, current.z);
    if (isBlockedByWorldCollision(position, true)) continue;

    if (Math.abs(current.x - targetX) <= collisionSearchStep / 2 && Math.abs(current.z - targetZ) <= collisionSearchStep / 2) {
      return true;
    }

    for (const [dx, dz] of [
      [collisionSearchStep, 0],
      [-collisionSearchStep, 0],
      [0, collisionSearchStep],
      [0, -collisionSearchStep],
    ]) {
      const nextX = snapToSearchGrid(current.x + dx);
      const nextZ = snapToSearchGrid(current.z + dz);
      if (nextX < collisionSearchBounds.minX || nextX > collisionSearchBounds.maxX) continue;
      if (nextZ < collisionSearchBounds.minZ || nextZ > collisionSearchBounds.maxZ) continue;

      const key = gridKey(nextX, nextZ);
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ x: nextX, z: nextZ });
    }
  }

  return false;
}

function snapToSearchGrid(value: number) {
  return Math.round(value / collisionSearchStep) * collisionSearchStep;
}

function gridKey(x: number, z: number) {
  return `${x.toFixed(2)}:${z.toFixed(2)}`;
}

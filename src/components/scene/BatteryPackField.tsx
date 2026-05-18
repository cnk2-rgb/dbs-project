import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Group, MathUtils, MeshBasicMaterial, MeshStandardMaterial, Vector3 } from "three";
import { playPhonePickupClick } from "../../lib/audio";
import {
  BATTERY_PACK_DEFINITIONS,
  BATTERY_PACK_HIT_BOX_OFFSET,
  BATTERY_PACK_HIT_BOX_SIZE,
  BATTERY_PACK_VALIDATION_REPORTS,
  getBatteryPackDebugSummary,
} from "../../lib/batteryPacks";
import { useRoughMaterial } from "./useRoughMaterial";

const validationByPackId = new Map(BATTERY_PACK_VALIDATION_REPORTS.map((report) => [report.pack.id, report]));

export function BatteryPackField({
  visible,
  visibleCount,
  collectedPackIds,
  debugMode,
  debugPackFocusId,
  onCollectPack,
}: {
  visible: boolean;
  visibleCount: number;
  collectedPackIds: string[];
  debugMode: boolean;
  debugPackFocusId: string | null;
  onCollectPack: (packId: string) => void;
}) {
  useEffect(() => {
    if (!debugMode) return;

    const failingReports = BATTERY_PACK_VALIDATION_REPORTS.filter(
      (report) => report.centerBlocked || !report.reachableFromBedroomPath || report.tooTight,
    );

    if (failingReports.length > 0) {
      console.warn(
        "Battery pack validation issues:",
        failingReports.map((report) => ({
          id: report.pack.id,
          centerBlocked: report.centerBlocked,
          blockingBoxes: report.centerBlockingBoxIds,
          standingDistance: report.nearestFreeStandingDistance,
          clearance: report.nearestFreeStandingClearance,
          reachableFromBedroomPath: report.reachableFromBedroomPath,
          tooTight: report.tooTight,
        })),
      );
    } else {
      console.info("Battery pack validation passed for all six packs.");
    }
  }, [debugMode]);

  if (!visible) return null;

  const packsToRender =
    debugMode && debugPackFocusId
      ? BATTERY_PACK_DEFINITIONS.filter((pack) => pack.id === debugPackFocusId).slice(0, visibleCount)
      : BATTERY_PACK_DEFINITIONS.slice(0, visibleCount);

  return (
    <group>
      {packsToRender.map((pack) => (
        <BatteryPack
          key={pack.id}
          packId={pack.id}
          position={pack.position}
          rotationY={pack.rotationY}
          collected={collectedPackIds.includes(pack.id)}
          debugMode={debugMode}
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
  packId,
  position,
  rotationY,
  collected,
  debugMode,
  onCollect,
}: {
  packId: string;
  position: [number, number, number];
  rotationY: number;
  collected: boolean;
  debugMode: boolean;
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
  const hitMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.02,
        depthWrite: false,
      }),
    [],
  );
  const validation = validationByPackId.get(packId);
  const statusColor = collected
    ? "#92a0a8"
    : validation?.centerBlocked || !validation?.reachableFromBedroomPath
      ? "#ff7c6f"
      : validation?.tooTight
        ? "#ffc96a"
        : "#95ffb0";

  useFrame(() => {
    if (!groupRef.current || collected) return;
    const now = performance.now() * 0.002;
    groupRef.current.position.y = baseY + Math.sin(now + rotationY) * 0.06;
    groupRef.current.rotation.y = MathUtils.lerp(
      groupRef.current.rotation.y,
      rotationY + Math.sin(now * 0.4) * 0.08,
      0.08,
    );
    groupRef.current.scale.lerp(new Vector3(hovered.current ? 1.08 : 1, hovered.current ? 1.08 : 1, hovered.current ? 1.08 : 1), 0.12);
  });

  if (collected && !debugMode) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      {!collected && (
        <>
          <mesh
            position={BATTERY_PACK_HIT_BOX_OFFSET}
            onPointerOver={(event) => {
              event.stopPropagation();
              hovered.current = true;
            }}
            onPointerOut={(event) => {
              event.stopPropagation();
              hovered.current = false;
            }}
            onClick={(event) => {
              event.stopPropagation();
              if (debugMode) {
                onCollect();
              }
            }}
            onDoubleClick={(event) => {
              event.stopPropagation();
              onCollect();
            }}
          >
            <boxGeometry args={BATTERY_PACK_HIT_BOX_SIZE} />
            <primitive object={hitMaterial} attach="material" />
          </mesh>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.24, 0.14, 0.34]} />
            <primitive object={bodyMaterial} attach="material" />
          </mesh>
          <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.16, 0.08, 0.12]} />
            <primitive object={faceMaterial} attach="material" />
          </mesh>
          <pointLight position={[0, 0.18, 0]} intensity={0.5} color="#ffd84d" distance={1.15} decay={2} />
        </>
      )}

      {debugMode && (
        <group position={[0, collected ? 0.38 : 0.56, 0]} renderOrder={999}>
          <group position={[0, 0.72, 0]}>
            <mesh position={[0, 0.22, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.18, 0.42, 5]} />
              <meshBasicMaterial color={statusColor} transparent opacity={0.96} depthWrite={false} />
            </mesh>
            <mesh position={[0, -0.02, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.42, 6]} />
              <meshBasicMaterial color={statusColor} transparent opacity={0.92} depthWrite={false} />
            </mesh>
            <mesh position={[0, -0.33, 0]}>
              <sphereGeometry args={[0.05, 10, 8]} />
              <meshBasicMaterial color={statusColor} transparent opacity={0.92} depthWrite={false} />
            </mesh>
          </group>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[BATTERY_PACK_HIT_BOX_SIZE[0] + 0.04, BATTERY_PACK_HIT_BOX_SIZE[1] + 0.04, BATTERY_PACK_HIT_BOX_SIZE[2] + 0.04]} />
            <meshBasicMaterial
              color={statusColor}
              transparent
              opacity={0.07}
              depthWrite={false}
              wireframe={false}
            />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[BATTERY_PACK_HIT_BOX_SIZE[0] + 0.04, BATTERY_PACK_HIT_BOX_SIZE[1] + 0.04, BATTERY_PACK_HIT_BOX_SIZE[2] + 0.04]} />
            <meshBasicMaterial
              color={statusColor}
              transparent
              opacity={0.32}
              depthWrite={false}
              wireframe
            />
          </mesh>
          <Text
            position={[0, 0.58, 0]}
            fontSize={0.16}
            color={statusColor}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#111111"
            renderOrder={1000}
          >
            {collected ? `${packId} collected` : packId}
          </Text>
          <Text
            position={[0, 0.4, 0]}
            fontSize={0.1}
            color={statusColor}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.015}
            outlineColor="#111111"
            renderOrder={1000}
          >
            {validation ? getBatteryPackDebugSummary(validation) : "no validation"}
          </Text>
        </group>
      )}
    </group>
  );
}

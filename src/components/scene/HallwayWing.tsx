import { KitchenArea } from "./KitchenArea";
import { OfficeArea } from "./OfficeArea";
import { DebugWallLabel } from "./DebugWallLabel";
import { RoomLabel } from "./RoomLabel";
import { useRoughMaterial } from "./useRoughMaterial";
import { MathUtils } from "three";

export function HallwayWing() {
  const hallwayWall = useRoughMaterial("#202b31", "#0b1116", 0.76, "paint");
  const wallFTop = hallwayWall.clone();
  wallFTop.roughness = 1;
  wallFTop.metalness = 0;
  const wallFMaterials = [
    hallwayWall,
    hallwayWall,
    wallFTop,
    hallwayWall,
    hallwayWall,
    hallwayWall,
  ];
  const hallwayCenterZ = -1.4;
  const depthCompression = 0.5;

  return (
    <group position={[0, 0, hallwayCenterZ]} scale={[1, 1, depthCompression]}>
      <group position={[0, 0, -hallwayCenterZ]}>
      <mesh position={[-5.525, 2.1, -2.8]} receiveShadow>
        {/* Wall F */}
        <boxGeometry args={[4.05, 4.2, 0.14]} />
        <primitive object={wallFMaterials} attach="material" />
      </mesh>
      <DebugWallLabel id="F" position={[-5.525, 2.1, -2.65]} oppositePosition={[-5.525, 2.1, -2.95]} rotationY={0} />
      <mesh position={[-9.575, 2.1, -2.8]} receiveShadow>
        {/* Wall I */}
        <boxGeometry args={[0.85, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel id="I" position={[-9.575, 2.1, -2.65]} oppositePosition={[-9.575, 2.1, -2.95]} rotationY={0} />
      <mesh position={[-10.625, 2.1, -2.8]} receiveShadow>
        {/* Wall Y (connects left edge of I to wall O) */}
        <boxGeometry args={[1.25, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel id="Y" position={[-10.625, 2.1, -2.65]} oppositePosition={[-10.625, 2.1, -2.95]} rotationY={0} />
      <mesh position={[-4.9, 2.1, -5.35]} receiveShadow>
        {/* Wall Q */}
        <boxGeometry args={[0.14, 4.2, 5.1]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel
        id="Q"
        position={[-4.73, 2.1, -5.35]}
        oppositePosition={[-5.07, 2.1, -5.35]}
        rotationY={Math.PI / 2}
      />

      <mesh position={[-7.42, 2.1, -7.9]} receiveShadow>
        {/* Wall M */}
        <boxGeometry args={[7.66, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel id="M" position={[-7.42, 2.1, -7.75]} oppositePosition={[-7.42, 2.1, -8.05]} rotationY={0} />
      <mesh position={[-11.25, 2.1, -6.525]} receiveShadow>
        {/* Wall N */}
        <boxGeometry args={[0.14, 4.2, 2.75]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel
        id="N"
        position={[-11.08, 2.1, -6.525]}
        oppositePosition={[-11.42, 2.1, -6.525]}
        rotationY={Math.PI / 2}
      />
      <mesh position={[-11.25, 2.1, -2.925]} receiveShadow>
        {/* Wall O */}
        <boxGeometry args={[0.14, 4.2, 2.25]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel
        id="O"
        position={[-11.08, 2.1, -2.925]}
        oppositePosition={[-11.42, 2.1, -2.925]}
        rotationY={Math.PI / 2}
      />
      <mesh position={[-11.25, 2.85, -4.6]} receiveShadow>
        {/* Wall P */}
        <boxGeometry args={[0.14, 1.4, 1.1]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel
        id="P"
        position={[-11.08, 2.85, -4.6]}
        oppositePosition={[-11.42, 2.85, -4.6]}
        rotationY={Math.PI / 2}
      />
      <mesh position={[-9.5, 2.1, 6.325]} receiveShadow>
        {/* Wall T (connects left edges of J and R) */}
        <boxGeometry args={[0.14, 4.2, 11.55]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel
        id="T"
        position={[-9.33, 2.1, 6.325]}
        oppositePosition={[-9.67, 2.1, 6.325]}
        rotationY={Math.PI / 2}
      />
      <mesh position={[-11.25, 2.1, 1.425]} receiveShadow>
        {/* Wall S (lower segment, with bathroom door opening above) */}
        <boxGeometry args={[0.14, 4.2, 6.45]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh position={[-11.25, 2.1, 7.775]} receiveShadow>
        {/* Wall S (upper segment) */}
        <boxGeometry args={[0.14, 4.2, 4.05]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh position={[-11.25, 3.5, 5.2]} receiveShadow>
        {/* Wall S lintel above bathroom door */}
        <boxGeometry args={[0.14, 1.4, 1.1]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel
        id="S"
        position={[-11.08, 2.1, 1.425]}
        oppositePosition={[-11.42, 2.1, 1.425]}
        rotationY={Math.PI / 2}
      />
      <mesh position={[-13.7, 2.1, 5.2]} receiveShadow>
        {/* Bathroom outer wall */}
        <boxGeometry args={[0.14, 4.2, 4.3]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel
        id="BA-L"
        position={[-13.53, 2.1, 5.2]}
        oppositePosition={[-13.87, 2.1, 5.2]}
        rotationY={Math.PI / 2}
      />
      <mesh position={[-12.475, 2.1, 7.35]} receiveShadow>
        {/* Bathroom top wall */}
        <boxGeometry args={[2.45, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel id="BA-T" position={[-12.475, 2.1, 7.2]} oppositePosition={[-12.475, 2.1, 7.5]} rotationY={0} />
      <mesh position={[-12.475, 2.1, 3.05]} receiveShadow>
        {/* Bathroom bottom wall */}
        <boxGeometry args={[2.45, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel id="BA-B" position={[-12.475, 2.1, 2.9]} oppositePosition={[-12.475, 2.1, 3.2]} rotationY={0} />
      <mesh position={[-12.875, 2.1, 14.6]} receiveShadow>
        {/* Living room left wall */}
        <boxGeometry args={[0.14, 4.2, 5.0]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel
        id="LR-L"
        position={[-12.705, 2.1, 14.6]}
        oppositePosition={[-13.045, 2.1, 14.6]}
        rotationY={Math.PI / 2}
      />
      <mesh position={[-7.875, 2.1, 14.6]} receiveShadow>
        {/* Living room right wall */}
        <boxGeometry args={[0.14, 4.2, 5.0]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel
        id="LR-R"
        position={[-7.705, 2.1, 14.6]}
        oppositePosition={[-8.045, 2.1, 14.6]}
        rotationY={Math.PI / 2}
      />
      <mesh position={[-8.6875, 2.1, 12.1]} receiveShadow>
        {/* Living room near-right connector wall (connects T to LR-R) */}
        <boxGeometry args={[1.625, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel
        id="LR-C"
        position={[-8.6875, 2.1, 11.95]}
        oppositePosition={[-8.6875, 2.1, 12.25]}
        rotationY={0}
      />
      <mesh position={[-10.375, 2.1, 17.1]} receiveShadow>
        {/* Living room far wall */}
        <boxGeometry args={[5.0, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel
        id="LR-F"
        position={[-10.375, 2.1, 16.95]}
        oppositePosition={[-10.375, 2.1, 17.25]}
        rotationY={0}
      />
      <RoomLabel name="Living Room" position={[-10.375, 1.2, 14.6]} />

      <rectAreaLight
        position={[-9.55, 3.95, -4.9]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={2.2}
        height={1.4}
        intensity={16.5}
        color="#edf4f9"
      />
      <rectAreaLight
        position={[-7.2, 3.95, -1.35]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={3.2}
        height={1.4}
        intensity={11}
        color="#d6e9f5"
      />
      <rectAreaLight
        position={[-8.1, 3.95, 1.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={2.4}
        height={1.4}
        intensity={10.5}
        color="#d3e6f2"
      />
      <rectAreaLight
        position={[-12.5, 3.95, 5.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={2.0}
        height={1.5}
        intensity={15}
        color="#eef6fb"
      />
      <pointLight position={[-12.7, 2.5, 5.4]} intensity={2.4} color="#cfe6f5" distance={4.2} decay={2} />
      <rectAreaLight
        position={[-10.375, 3.95, 14.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={4.2}
        height={2.8}
        intensity={18}
        color="#f4f6f8"
      />
      <pointLight position={[-11.9, 2.4, 13.8]} intensity={2.8} color="#ffe2bc" distance={5.8} decay={2} />
      <pointLight position={[-8.9, 2.4, 15.3]} intensity={2.8} color="#c8def1" distance={5.8} decay={2} />

      <OfficeDoor />
      <BathroomDoor />
      <OfficeArea />
      <KitchenArea />
      </group>
    </group>
  );
}

function OfficeDoor() {
  const door = useRoughMaterial("#1b1714", "#080605", 0.88, "wood");
  const frame = useRoughMaterial("#14110f", "#060403", 0.82, "wood");
  const knob = useRoughMaterial("#1f2327", "#07090b", 0.54, "none");

  return (
    <group position={[-11.19, 1.04, -4.6]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[-0.55, 0, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 2.2, 0.08]} />
        <primitive object={frame} attach="material" />
      </mesh>
      <mesh position={[0.55, 0, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 2.2, 0.08]} />
        <primitive object={frame.clone()} attach="material" />
      </mesh>
      <mesh position={[0, 1.11, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[1.16, 0.06, 0.08]} />
        <primitive object={frame.clone()} attach="material" />
      </mesh>

      <group position={[-0.5, -0.02, 0]} rotation={[0, -MathUtils.degToRad(18), 0]}>
        <mesh position={[0.5, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 2.04, 0.07]} />
          <primitive object={door} attach="material" />
        </mesh>
        <mesh position={[0.82, 0.04, 0.06]} castShadow>
          <sphereGeometry args={[0.038, 12, 8]} />
          <primitive object={knob} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

function BathroomDoor() {
  const door = useRoughMaterial("#171311", "#060403", 0.9, "wood");
  const knob = useRoughMaterial("#1f2327", "#07090b", 0.54, "none");

  return (
    <group position={[-11.19, 1.04, 5.2]} rotation={[0, Math.PI / 2, 0]}>
      <group position={[-0.5, -0.02, 0]} rotation={[0, -MathUtils.degToRad(12), 0]}>
        <mesh position={[0.5, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 2.04, 0.07]} />
          <primitive object={door} attach="material" />
        </mesh>
        <mesh position={[0.82, 0.04, 0.06]} castShadow>
          <sphereGeometry args={[0.038, 12, 8]} />
          <primitive object={knob} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

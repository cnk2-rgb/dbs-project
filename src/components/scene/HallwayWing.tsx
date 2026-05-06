import { KitchenArea } from "./KitchenArea";
import { OfficeArea } from "./OfficeArea";
import { DebugWallLabel } from "./DebugWallLabel";
import { useRoughMaterial } from "./useRoughMaterial";
import { MathUtils } from "three";

export function HallwayWing() {
  const hallwayWall = useRoughMaterial("#202b31", "#0b1116", 0.76, "paint");
  const hallwayCenterZ = -1.4;
  const depthCompression = 0.5;

  return (
    <group position={[0, 0, hallwayCenterZ]} scale={[1, 1, depthCompression]}>
      <group position={[0, 0, -hallwayCenterZ]}>
      <mesh position={[-5.525, 2.1, -2.6]} receiveShadow>
        {/* Wall F */}
        <boxGeometry args={[4.05, 4.2, 0.14]} />
        <primitive object={hallwayWall} attach="material" />
      </mesh>
      <DebugWallLabel id="F" position={[-5.525, 2.1, -2.45]} oppositePosition={[-5.525, 2.1, -2.75]} rotationY={0} />
      <mesh position={[-5.2, 3.4, -2.6]} receiveShadow>
        {/* Wall H */}
        <boxGeometry args={[1.0, 1.6, 0.14]} />
        <primitive object={hallwayWall} attach="material" />
      </mesh>
      <DebugWallLabel id="H" position={[-5.2, 3.4, -2.45]} oppositePosition={[-5.2, 3.4, -2.75]} rotationY={0} />
      <mesh position={[-9.575, 2.1, -2.6]} receiveShadow>
        {/* Wall I */}
        <boxGeometry args={[0.85, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel id="I" position={[-9.575, 2.1, -2.45]} oppositePosition={[-9.575, 2.1, -2.75]} rotationY={0} />

      <mesh position={[-8.95, 2.1, 0.55]} receiveShadow>
        {/* Wall J */}
        <boxGeometry args={[2.1, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel id="J" position={[-8.95, 2.1, 0.4]} oppositePosition={[-8.95, 2.1, 0.7]} rotationY={0} />
      <mesh position={[-4.9, 2.1, 0.55]} receiveShadow>
        {/* Wall K */}
        <boxGeometry args={[2.8, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel id="K" position={[-4.9, 2.1, 0.4]} oppositePosition={[-4.9, 2.1, 0.7]} rotationY={0} />

      <mesh position={[-14.88, 2.1, -1.4]} receiveShadow>
        {/* Wall L */}
        <boxGeometry args={[0.14, 4.2, 2.4]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel
        id="L"
        position={[-14.72, 2.1, -1.4]}
        oppositePosition={[-15.04, 2.1, -1.4]}
        rotationY={Math.PI / 2}
      />

      <mesh position={[-8.35, 2.1, -6.9-1]} receiveShadow>
        {/* Wall M */}
        <boxGeometry args={[5.8, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel id="M" position={[-8.35, 2.1, -6.75-1]} oppositePosition={[-8.35, 2.1, -7.05-1]} rotationY={0} />
      <mesh position={[-11.25, 2.1, -6.275]} receiveShadow>
        {/* Wall N */}
        <boxGeometry args={[0.14, 4.2, 2.25]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel
        id="N"
        position={[-11.08, 2.1, -6.275]}
        oppositePosition={[-11.42, 2.1, -6.275]}
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
      <mesh position={[-11.25, 3.5, -4.6]} receiveShadow>
        {/* Wall P */}
        <boxGeometry args={[0.14, 1.4, 1.1]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel
        id="P"
        position={[-11.08, 3.5, -4.6]}
        oppositePosition={[-11.42, 3.5, -4.6]}
        rotationY={Math.PI / 2}
      />
      <mesh position={[-8.35, 2.1, 4.1]} receiveShadow>
        {/* Wall R */}
        <boxGeometry args={[5.8, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel id="R" position={[-8.35, 2.1, 3.95]} oppositePosition={[-8.35, 2.1, 4.25]} rotationY={0} />
      <mesh position={[-11.25, 2.1, 1.3]} receiveShadow>
        {/* Wall S */}
        <boxGeometry args={[0.14, 4.2, 5.6]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel
        id="S"
        position={[-11.08, 2.1, 1.3]}
        oppositePosition={[-11.42, 2.1, 1.3]}
        rotationY={Math.PI / 2}
      />

      <pointLight position={[-6.5, 2.35, -1.35]} intensity={0.88} color="#86adc0" distance={8.6} decay={2} />
      <pointLight position={[-8.45, 2.1, -4.05]} intensity={0.56} color="#78a0bb" distance={5.5} decay={2} />
      <pointLight position={[-8.45, 2.1, 1.35]} intensity={0.56} color="#78a0bb" distance={5.5} decay={2} />
      <pointLight position={[-7.2, 2.05, -1.35]} intensity={0.46} color="#6b90a7" distance={6.8} decay={2} />
      <pointLight position={[-8.25, 2.55, 1.45]} intensity={1.65} color="#ffe3ba" distance={7.2} decay={1.8} />
      <pointLight position={[-8.35, 2.9, 1.4]} intensity={7.5} color="#fff6de" distance={11} decay={1.35} />
      <pointLight position={[-8.35, 1.1, 1.2]} intensity={3.6} color="#fff0cf" distance={8.5} decay={1.2} />
      <rectAreaLight
        position={[-8.35, 3.85, 1.25]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={2.6}
        height={1.8}
        intensity={18}
        color="#fff8e6"
      />

      <OfficeDoor />
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

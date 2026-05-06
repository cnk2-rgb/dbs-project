import { useRoughMaterial } from "./useRoughMaterial";
import { DebugWallLabel } from "./DebugWallLabel";

export function OfficeArea() {
  const wall = useRoughMaterial("#263238", "#0a1014", 0.8, "paint");
  const deskWood = useRoughMaterial("#7f6650", "#24180f", 0.78, "wood");
  const deskDark = useRoughMaterial("#2a3035", "#090d11", 0.56, "none");
  const metal = useRoughMaterial("#8a96a1", "#2a333d", 0.34, "none");
  const monitorBody = useRoughMaterial("#1a1f25", "#05070a", 0.52, "none");
  const monitorScreen = useRoughMaterial("#9fcbe0", "#5f9ebf", 0.26, "none");
  const laptopBody = useRoughMaterial("#222930", "#070b0f", 0.46, "none");
  const shelf = useRoughMaterial("#5b6870", "#1b232a", 0.74, "wood");

  return (
    <group position={[0, 0, -7.05]}>
      <mesh position={[-13.1, 2.1, 3.95]} receiveShadow>
        {/* Wall U */}
        <boxGeometry args={[3.6, 4.2, 0.14]} />
        <primitive object={wall} attach="material" />
      </mesh>
      <DebugWallLabel id="U" position={[-13.1, 2.1, 3.8]} oppositePosition={[-13.1, 2.1, 4.1]} rotationY={0} />
      <mesh position={[-13.1, 2.1, -1.05]} receiveShadow>
        {/* Wall V */}
        <boxGeometry args={[3.84, 4.2, 0.14]} />
        <primitive object={wall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel id="V" position={[-13.1, 2.1, -0.9]} oppositePosition={[-13.1, 2.1, -1.2]} rotationY={0} />
      <mesh position={[-14.9, 2.1, 1.45]} receiveShadow>
        {/* Wall W */}
        <boxGeometry args={[0.14, 4.2, 5.0]} />
        <primitive object={wall.clone()} attach="material" />
      </mesh>
      <DebugWallLabel
        id="W"
        position={[-14.74, 2.1, 1.45]}
        oppositePosition={[-15.06, 2.1, 1.45]}
        rotationY={Math.PI / 2}
      />
      <group position={[-12.65, 0, 3.25]}>
        <mesh position={[-0.3, 0.74, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.05, 0.09, 0.82]} />
          <primitive object={deskWood} attach="material" />
        </mesh>
        <mesh position={[-1.18, 0.36, -0.31]} castShadow>
          <boxGeometry args={[0.08, 0.72, 0.08]} />
          <primitive object={deskDark} attach="material" />
        </mesh>
        <mesh position={[-1.18, 0.36, 0.31]} castShadow>
          <boxGeometry args={[0.08, 0.72, 0.08]} />
          <primitive object={deskDark.clone()} attach="material" />
        </mesh>
        <mesh position={[0.58, 0.36, -0.31]} castShadow>
          <boxGeometry args={[0.08, 0.72, 0.08]} />
          <primitive object={deskDark.clone()} attach="material" />
        </mesh>
        <mesh position={[0.58, 0.36, 0.31]} castShadow>
          <boxGeometry args={[0.08, 0.72, 0.08]} />
          <primitive object={deskDark.clone()} attach="material" />
        </mesh>

        <group position={[-0.78, 0.86, -0.1]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.62, 0.38, 0.05]} />
            <primitive object={monitorBody} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.028]}>
            <boxGeometry args={[0.54, 0.3, 0.02]} />
            <primitive object={monitorScreen} attach="material" />
          </mesh>
          <mesh position={[0, -0.24, -0.02]} castShadow>
            <boxGeometry args={[0.05, 0.21, 0.05]} />
            <primitive object={metal} attach="material" />
          </mesh>
        </group>

        <group position={[-0.08, 0.9, -0.08]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.62, 0.38, 0.05]} />
            <primitive object={monitorBody.clone()} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.028]}>
            <boxGeometry args={[0.54, 0.3, 0.02]} />
            <primitive object={monitorScreen.clone()} attach="material" />
          </mesh>
          <mesh position={[0, -0.24, -0.02]} castShadow>
            <boxGeometry args={[0.05, 0.21, 0.05]} />
            <primitive object={metal.clone()} attach="material" />
          </mesh>
        </group>

        <group position={[0.5, 0.78, 0.08]} rotation={[0, -0.22, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.56, 0.03, 0.36]} />
            <primitive object={laptopBody} attach="material" />
          </mesh>
          <mesh position={[0, 0.16, -0.16]} rotation={[1.16, 0, 0]} castShadow>
            <boxGeometry args={[0.56, 0.02, 0.34]} />
            <primitive object={monitorScreen.clone()} attach="material" />
          </mesh>
        </group>

        <group position={[0.64, 0.78, -0.2]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.04, 0.44, 0.04]} />
            <primitive object={metal.clone()} attach="material" />
          </mesh>
          <mesh position={[0.16, 0.42, 0]} rotation={[0, 0, -0.65]} castShadow>
            <boxGeometry args={[0.33, 0.03, 0.03]} />
            <primitive object={metal.clone()} attach="material" />
          </mesh>
          <mesh position={[0.28, 0.34, 0]} castShadow>
            <sphereGeometry args={[0.07, 12, 10]} />
            <primitive object={deskDark.clone()} attach="material" />
          </mesh>
        </group>
      </group>

      <group position={[-12.15, 0, 1.66]}>
        <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.46, 0.06, 0.46]} />
          <primitive object={deskDark.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 0.56, -0.18]} castShadow receiveShadow>
          <boxGeometry args={[0.46, 0.58, 0.06]} />
          <primitive object={deskDark.clone()} attach="material" />
        </mesh>
        <mesh position={[0.17, 0.13, 0.17]} castShadow>
          <boxGeometry args={[0.06, 0.26, 0.06]} />
          <primitive object={metal.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.17, 0.13, 0.17]} castShadow>
          <boxGeometry args={[0.06, 0.26, 0.06]} />
          <primitive object={metal.clone()} attach="material" />
        </mesh>
        <mesh position={[0.17, 0.13, -0.17]} castShadow>
          <boxGeometry args={[0.06, 0.26, 0.06]} />
          <primitive object={metal.clone()} attach="material" />
        </mesh>
        <mesh position={[-0.17, 0.13, -0.17]} castShadow>
          <boxGeometry args={[0.06, 0.26, 0.06]} />
          <primitive object={metal.clone()} attach="material" />
        </mesh>
      </group>

      <group position={[-14.35, 0.3, 3.5]}>
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.16, 2.4, 0.58]} />
          <primitive object={shelf} attach="material" />
        </mesh>
        <mesh position={[0, 0.56, 0]} castShadow>
          <boxGeometry args={[0.18, 0.04, 0.54]} />
          <primitive object={deskDark.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 1.16, 0]} castShadow>
          <boxGeometry args={[0.18, 0.04, 0.54]} />
          <primitive object={deskDark.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 1.76, 0]} castShadow>
          <boxGeometry args={[0.18, 0.04, 0.54]} />
          <primitive object={deskDark.clone()} attach="material" />
        </mesh>
      </group>

      <rectAreaLight
        position={[-13.08, 3.95, 2.46]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={2.4}
        height={1.7}
        intensity={10}
        color="#d9edf8"
      />
    </group>
  );
}

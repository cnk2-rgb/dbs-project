import { useRoughMaterial } from "./useRoughMaterial";
import { usePolyHavenMaterial } from "./usePolyHavenMaterial";
import { DebugWallLabel } from "./DebugWallLabel";
import { useGLTF } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import { Mesh } from "three";

const desktopComputerModelPath = "/models/stylized-computer-set-get3dmodels.glb";

export function OfficeArea() {
  const wall = usePolyHavenMaterial(
    "/textures/polyhaven/decrepit_wallpaper/diffuse.jpg",
    "/textures/polyhaven/decrepit_wallpaper/roughness.jpg",
    "/textures/polyhaven/decrepit_wallpaper/normal.jpg",
    {
      baseColor: "#e0d7c6",
      repeat: [2.4, 1.4],
      roughness: 0.96,
      normalScale: 0.95,
    },
  );
  const deskWood = useRoughMaterial("#7f6650", "#24180f", 0.82, "wood", {
    seed: "office-desk-wood",
    repeat: [2, 3],
    grimeStrength: 0.9,
  });
  const deskDark = useRoughMaterial("#2a3035", "#090d11", 0.56, "none");
  const metal = useRoughMaterial("#8a96a1", "#2a333d", 0.34, "none");
  const shelf = useRoughMaterial("#5b6870", "#1b232a", 0.78, "wood", {
    seed: "office-shelf",
    repeat: [2, 3],
    grimeStrength: 0.92,
  });

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

        <Suspense fallback={null}>
          <DesktopComputerModel />
        </Suspense>

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

      <OfficeDetails />
      <OfficeChair />

      <rectAreaLight
        position={[-13.08, 3.95, 2.46]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={2.4}
        height={1.7}
        intensity={7.4}
        color="#cfe3f4"
      />
      <pointLight position={[-12.0, 1.36, 3.02]} intensity={0.95} color="#86bfd9" distance={2.6} decay={2} />
      <pointLight position={[-14.05, 1.1, 2.3]} intensity={0.7} color="#d8b887" distance={1.9} decay={2} />
    </group>
  );
}

function DesktopComputerModel() {
  const { scene } = useGLTF(desktopComputerModelPath);
  const computer = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });

    return clone;
  }, [scene]);

  return <primitive object={computer} position={[-0.16, 0.76, -0.04]} rotation={[0, Math.PI, 0]} scale={0.0017} />;
}

function OfficeDetails() {
  const fabric = useRoughMaterial("#23302f", "#0b1110", 0.94, "fabric", {
    seed: "office-fabric",
    repeat: [4, 4],
    grimeStrength: 0.88,
  });
  const paper = useRoughMaterial("#cfc2a9", "#6f624d", 0.92, "paper", {
    seed: "office-paper",
    repeat: [3, 3],
    grimeStrength: 0.9,
  });
  const box = useRoughMaterial("#80694f", "#2d2118", 0.86, "paper", {
    seed: "office-box",
    repeat: [2, 2],
    grimeStrength: 0.85,
  });
  const metal = useRoughMaterial("#7d8790", "#283039", 0.38, "none");
  const dark = useRoughMaterial("#171c20", "#05070a", 0.62, "none");
  const cork = useRoughMaterial("#7c6040", "#2b1d12", 0.92, "wood", {
    seed: "office-cork",
    repeat: [2, 2],
    grimeStrength: 0.9,
  });

  return (
    <>
      <mesh position={[-13.2, 0.035, 1.55]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.45, 2.1, 4, 4]} />
        <primitive object={fabric} attach="material" />
      </mesh>

      <group position={[-14.25, 0.48, 0.08]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.52, 0.96, 0.64]} />
          <primitive object={metal} attach="material" />
        </mesh>
        {[-0.18, 0.08, 0.34].map((y) => (
          <mesh key={y} position={[0, y, -0.33]} castShadow>
            <boxGeometry args={[0.34, 0.03, 0.035]} />
            <primitive object={dark.clone()} attach="material" />
          </mesh>
        ))}
      </group>

      <group position={[-14.42, 1.88, 1.2]} rotation={[0, Math.PI / 2, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[1.15, 0.72, 0.045]} />
          <primitive object={cork} attach="material" />
        </mesh>
        {[
          [-0.28, 0.12, 0.03],
          [0.12, -0.06, 0.035],
          [0.34, 0.16, 0.04],
        ].map(([x, y, z]) => (
          <mesh key={`${x}-${y}`} position={[x, y, z]} rotation={[0, 0, 0.08]} receiveShadow>
            <boxGeometry args={[0.25, 0.18, 0.01]} />
            <primitive object={paper.clone()} attach="material" />
          </mesh>
        ))}
      </group>

      <group position={[-13.98, 0.18, 3.08]} rotation={[0, -0.14, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.58, 0.36, 0.46]} />
          <primitive object={box} attach="material" />
        </mesh>
        <mesh position={[0, 0.2, -0.02]} castShadow receiveShadow>
          <boxGeometry args={[0.62, 0.04, 0.5]} />
          <primitive object={paper.clone()} attach="material" />
        </mesh>
      </group>

      <mesh position={[-13.5, 1.09, 3.25]} rotation={[-Math.PI / 2, 0, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.62, 0.018]} />
        <primitive object={paper.clone()} attach="material" />
      </mesh>

      <group position={[-12.28, 0.08, 2.9]} rotation={[0, -0.18, 0]}>
        <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.54, 0.08, 0.34]} />
          <primitive object={metal.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 0.34, -0.04]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.54, 0.08]} />
          <primitive object={fabric.clone()} attach="material" />
        </mesh>
        <mesh position={[0, 0.62, -0.1]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.14, 0.1]} />
          <primitive object={fabric.clone()} attach="material" />
        </mesh>
      </group>
      <mesh position={[-13.75, 0.06, 3.1]} rotation={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.08, 0.22]} />
        <primitive object={box.clone()} attach="material" />
      </mesh>
      <mesh position={[-13.62, 0.16, 3.08]} rotation={[0.02, 0.1, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.16, 0.02]} />
        <primitive object={paper.clone()} attach="material" />
      </mesh>
    </>
  );
}

function OfficeChair() {
  const frame = useRoughMaterial("#23292f", "#080c10", 0.52, "none");
  const seat = useRoughMaterial("#192221", "#06090a", 0.96, "fabric", {
    seed: "office-chair-seat",
    repeat: [2, 2],
    grimeStrength: 0.82,
  });
  const back = useRoughMaterial("#1a2120", "#05080a", 0.96, "fabric", {
    seed: "office-chair-back",
    repeat: [2, 3],
    grimeStrength: 0.82,
  });

  return (
    <group position={[-12.88, 0, 2.65]} rotation={[0, -0.48, 0]}>
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.16, 16]} />
        <primitive object={frame} attach="material" />
      </mesh>
      <mesh position={[0, 0.42, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.56, 0.08, 0.48]} />
        <primitive object={seat} attach="material" />
      </mesh>
      <mesh position={[0, 0.84, -0.16]} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.82, 0.06]} />
        <primitive object={back} attach="material" />
      </mesh>
      {[
        [-0.18, 0, -0.18],
        [0.18, 0, -0.18],
        [-0.18, 0, 0.18],
        [0.18, 0, 0.18],
      ].map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.08, z]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
          <primitive object={frame.clone()} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

useGLTF.preload(desktopComputerModelPath);

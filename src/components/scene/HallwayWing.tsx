import { KitchenArea } from "./KitchenArea";
import { useRoughMaterial } from "./useRoughMaterial";

export function HallwayWing() {
  const hallwaySurface = useRoughMaterial("#1c2429", "#0a0f13", 0.84, "concrete");
  const hallwayWall = useRoughMaterial("#202b31", "#0b1116", 0.76, "paint");
  const hallwayCeiling = useRoughMaterial("#1a2329", "#090e12", 0.74, "paint");

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-9.2, 0.01, -1.4]} receiveShadow>
        <planeGeometry args={[11.4, 2.4, 20, 4]} />
        <primitive object={hallwaySurface} attach="material" />
      </mesh>

      <mesh position={[-5.525, 2.1, -2.6]} receiveShadow>
        <boxGeometry args={[4.05, 4.2, 0.14]} />
        <primitive object={hallwayWall} attach="material" />
      </mesh>
      <mesh position={[-9.575, 2.1, -2.6]} receiveShadow>
        <boxGeometry args={[0.85, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>

      <mesh position={[-8.95, 2.1, -0.2]} receiveShadow>
        <boxGeometry args={[2.1, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh position={[-4.9, 2.1, -0.2]} receiveShadow>
        <boxGeometry args={[2.8, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>

      <mesh position={[-14.88, 2.1, -1.4]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 2.4]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>

      <mesh position={[-9.98, 2.1, -1.4]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 2.4]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-9.2, 4.2, -1.4]} receiveShadow>
        <planeGeometry args={[11.4, 2.4, 10, 2]} />
        <primitive object={hallwayCeiling} attach="material" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8.35, 0.01, -4.1]} receiveShadow>
        <planeGeometry args={[5.8, 5.6, 12, 12]} />
        <primitive object={hallwaySurface.clone()} attach="material" />
      </mesh>
      <mesh position={[-8.35, 2.1, -6.9]} receiveShadow>
        <boxGeometry args={[5.8, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh position={[-11.25, 2.1, -4.1]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 5.6]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh position={[-5.45, 2.1, -4.1]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 5.6]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-8.35, 4.2, -4.1]} receiveShadow>
        <planeGeometry args={[5.8, 5.6, 8, 8]} />
        <primitive object={hallwayCeiling.clone()} attach="material" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8.35, 0.01, 1.3]} receiveShadow>
        <planeGeometry args={[5.8, 5.6, 12, 12]} />
        <primitive object={hallwaySurface.clone()} attach="material" />
      </mesh>
      <mesh position={[-8.35, 2.1, 4.1]} receiveShadow>
        <boxGeometry args={[5.8, 4.2, 0.14]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh position={[-11.25, 2.1, 1.3]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 5.6]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh position={[-5.45, 2.1, 1.3]} receiveShadow>
        <boxGeometry args={[0.14, 4.2, 5.6]} />
        <primitive object={hallwayWall.clone()} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-8.35, 4.2, 1.3]} receiveShadow>
        <planeGeometry args={[5.8, 5.6, 8, 8]} />
        <primitive object={hallwayCeiling.clone()} attach="material" />
      </mesh>

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

      <KitchenArea />
    </group>
  );
}

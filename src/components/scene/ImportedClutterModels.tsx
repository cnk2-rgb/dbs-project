import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Box3, Group, Mesh, Vector3 } from "three";

const debrisPapersModelPath = "/models/debris-papers-poly-pizza.glb";
const paperModelPath = "/models/paper-poly-pizza.glb";
const tshirtModelPath = "/models/tshirt-poly-pizza.glb";

type ImportedModelProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
};

function ImportedModel({
  path,
  position,
  rotation,
  scale,
}: ImportedModelProps & {
  path: string;
}) {
  const { scene } = useGLTF(path);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const bounds = new Box3().setFromObject(clone);
    const size = new Vector3();
    const center = new Vector3();

    clone.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });

    bounds.getSize(size);
    bounds.getCenter(center);

    const normalizedRoot = new Group();
    normalizedRoot.add(clone);
    normalizedRoot.position.set(-center.x, -bounds.min.y, -center.z);
    normalizedRoot.scale.setScalar(1 / Math.max(size.x, size.y, size.z, 1));

    return normalizedRoot;
  }, [scene]);

  return <primitive object={model} position={position} rotation={rotation} scale={scale} />;
}

export function DebrisPapersModel(props: ImportedModelProps) {
  return <ImportedModel path={debrisPapersModelPath} {...props} />;
}

export function PaperModel(props: ImportedModelProps) {
  return <ImportedModel path={paperModelPath} {...props} />;
}

export function TshirtModel(props: ImportedModelProps) {
  return <ImportedModel path={tshirtModelPath} {...props} />;
}

useGLTF.preload(debrisPapersModelPath);
useGLTF.preload(paperModelPath);
useGLTF.preload(tshirtModelPath);

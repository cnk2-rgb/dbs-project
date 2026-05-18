import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import { MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, TextureLoader } from "three";

type PolyHavenMaterialOptions = {
  baseColor?: string;
  repeat?: [number, number];
  roughness?: number;
  metalness?: number;
};

export function usePolyHavenMaterial(
  diffuseUrl: string,
  roughnessUrl: string,
  options: PolyHavenMaterialOptions = {},
) {
  const [diffuseMap, roughnessMap] = useLoader(TextureLoader, [diffuseUrl, roughnessUrl]);

  return useMemo(() => {
    const [repeatX, repeatY] = options.repeat ?? [1, 1];

    diffuseMap.wrapS = RepeatWrapping;
    diffuseMap.wrapT = RepeatWrapping;
    diffuseMap.repeat.set(repeatX, repeatY);
    diffuseMap.colorSpace = SRGBColorSpace;
    diffuseMap.needsUpdate = true;

    roughnessMap.wrapS = RepeatWrapping;
    roughnessMap.wrapT = RepeatWrapping;
    roughnessMap.repeat.set(repeatX, repeatY);
    roughnessMap.needsUpdate = true;

    return new MeshStandardMaterial({
      color: options.baseColor ?? "#ffffff",
      map: diffuseMap,
      roughnessMap,
      roughness: options.roughness ?? 0.92,
      metalness: options.metalness ?? 0,
    });
  }, [diffuseMap, options.baseColor, options.metalness, options.repeat, options.roughness, roughnessMap]);
}

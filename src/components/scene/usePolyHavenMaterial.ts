import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import { MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, TextureLoader, Vector2 } from "three";

type PolyHavenMaterialOptions = {
  baseColor?: string;
  repeat?: [number, number];
  roughness?: number;
  metalness?: number;
  normalScale?: number;
};

export function usePolyHavenMaterial(
  diffuseUrl: string,
  roughnessUrl: string,
  normalUrlOrOptions?: string | PolyHavenMaterialOptions,
  options: PolyHavenMaterialOptions = {},
) {
  const normalUrl = typeof normalUrlOrOptions === "string" ? normalUrlOrOptions : undefined;
  const resolvedOptions = typeof normalUrlOrOptions === "string" ? options : normalUrlOrOptions ?? {};
  const textureUrls = normalUrl ? [diffuseUrl, roughnessUrl, normalUrl] : [diffuseUrl, roughnessUrl];
  const textures = useLoader(TextureLoader, textureUrls);
  const [diffuseMap, roughnessMap, normalMap] = textures;

  return useMemo(() => {
    const [repeatX, repeatY] = resolvedOptions.repeat ?? [1, 1];

    diffuseMap.wrapS = RepeatWrapping;
    diffuseMap.wrapT = RepeatWrapping;
    diffuseMap.repeat.set(repeatX, repeatY);
    diffuseMap.colorSpace = SRGBColorSpace;
    diffuseMap.needsUpdate = true;

    roughnessMap.wrapS = RepeatWrapping;
    roughnessMap.wrapT = RepeatWrapping;
    roughnessMap.repeat.set(repeatX, repeatY);
    roughnessMap.needsUpdate = true;

    if (normalMap) {
      normalMap.wrapS = RepeatWrapping;
      normalMap.wrapT = RepeatWrapping;
      normalMap.repeat.set(repeatX, repeatY);
      normalMap.needsUpdate = true;
    }

    return new MeshStandardMaterial({
      color: resolvedOptions.baseColor ?? "#ffffff",
      map: diffuseMap,
      roughnessMap,
      normalMap,
      normalScale: normalMap ? new Vector2(resolvedOptions.normalScale ?? 0.85, resolvedOptions.normalScale ?? 0.85) : undefined,
      roughness: resolvedOptions.roughness ?? 0.92,
      metalness: resolvedOptions.metalness ?? 0,
    });
  }, [
    diffuseMap,
    normalMap,
    resolvedOptions.baseColor,
    resolvedOptions.metalness,
    resolvedOptions.normalScale,
    resolvedOptions.repeat,
    resolvedOptions.roughness,
    roughnessMap,
  ]);
}

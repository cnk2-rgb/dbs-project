import { useMemo } from "react";
import { CanvasTexture, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace } from "three";

export type TextureStyle = "concrete" | "fabric" | "paint" | "paper" | "wood" | "none";

export type SurfaceTextureOptions = {
  seed?: string | number;
  repeat?: [number, number];
  grimeStrength?: number;
  stainStrength?: number;
  warpStrength?: number;
  edgeWear?: number;
};

export function useRoughMaterial(
  color: string,
  emissive = "#000000",
  roughness = 0.95,
  textureStyle: TextureStyle = "concrete",
  options: SurfaceTextureOptions = {},
) {
  return useMemo(() => {
    const texture =
      textureStyle === "none" ? null : createSurfaceTexture(color, textureStyle, options, createSeededRandom(hashSeed({
        color,
        emissive,
        roughness,
        textureStyle,
        seed: options.seed ?? `${color}:${textureStyle}:${roughness}`,
      })));
    const material = new MeshStandardMaterial({
      color: texture ? "#ffffff" : color,
      map: texture ?? undefined,
      roughness,
      metalness: 0.01,
      emissive,
      emissiveIntensity: 0.06,
    });

    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          #include <begin_vertex>
          float warp = sin(position.x * 9.0 + position.y * 3.0) * ${0.003 + (options.warpStrength ?? 1) * 0.0045};
          transformed += normal * warp;
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
          #include <color_fragment>
          float dirt = fract(sin(dot(vViewPosition.xy, vec2(12.9898,78.233))) * 43758.5453);
          diffuseColor.rgb *= 0.84 + dirt * ${0.05 + (options.grimeStrength ?? 1) * 0.04};
        `,
      );
    };

    return material;
  }, [
    color,
    emissive,
    options.edgeWear,
    options.grimeStrength,
    options.repeat,
    options.seed,
    options.stainStrength,
    options.warpStrength,
    roughness,
    textureStyle,
  ]);
}

function createSurfaceTexture(
  baseColor: string,
  style: TextureStyle,
  options: SurfaceTextureOptions,
  random: () => number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  if (!context) return null;

  context.fillStyle = baseColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const lightOpacity = style === "fabric" ? 0.012 : 0.018;
  const darkOpacity = style === "wood" ? 0.08 : 0.035;
  const markCount = style === "wood" ? 80 : style === "fabric" ? 120 : 170;
  const stainStrength = options.stainStrength ?? 1;
  const grimeStrength = options.grimeStrength ?? 1;
  const edgeWear = options.edgeWear ?? 1;

  for (let index = 0; index < markCount; index += 1) {
    const value = random() > 0.52 ? 255 : 0;
    const opacity = value === 255 ? lightOpacity : darkOpacity;
    context.fillStyle = `rgba(${value}, ${value}, ${value}, ${opacity * grimeStrength})`;
    context.fillRect(
      random() * 256,
      random() * 256,
      random() * 24 + 6,
      random() * 18 + 5,
    );
  }

  if (style === "wood") {
    for (let y = 0; y < 256; y += 12) {
      context.strokeStyle = "rgba(0, 0, 0, 0.16)";
      context.beginPath();
      context.moveTo(0, y + Math.sin(y) * 2);
      context.bezierCurveTo(64, y + 4, 160, y - 6, 256, y + 2 + random() * 2 - 1);
      context.stroke();
    }
  }

  if (style === "fabric") {
    context.strokeStyle = "rgba(255, 255, 255, 0.035)";
    for (let x = 0; x < 256; x += 8) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x + 20, 256);
      context.stroke();
    }
    context.strokeStyle = "rgba(0, 0, 0, 0.06)";
    for (let y = 0; y < 256; y += 9) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(256, y + 8);
      context.stroke();
    }
  }

  if (style === "paint" || style === "concrete") {
    context.strokeStyle = "rgba(255, 255, 255, 0.025)";
    for (let line = 0; line < 16; line += 1) {
      const y = random() * 256;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(256, y + random() * 18 - 9);
      context.stroke();
    }
  }

  // Corner grime and damp patches so the surface does not read as flat noise.
  for (let patch = 0; patch < 7; patch += 1) {
    const x = random() * 256;
    const y = random() * 256;
    const radius = 18 + random() * 42;
    const gradient = context.createRadialGradient(x, y, 2, x, y, radius);
    gradient.addColorStop(0, `rgba(12, 12, 12, ${0.18 * stainStrength})`);
    gradient.addColorStop(0.55, `rgba(25, 23, 20, ${0.09 * stainStrength})`);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  if (style !== "paper") {
    context.fillStyle = `rgba(0, 0, 0, ${0.045 * edgeWear})`;
    context.fillRect(0, 0, 256, 5);
    context.fillRect(0, 251, 256, 5);
    context.fillRect(0, 0, 5, 256);
    context.fillRect(251, 0, 5, 256);
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  const [repeatX, repeatY] = options.repeat ?? [style === "wood" ? 2 : 3, style === "fabric" ? 4 : 3];
  texture.repeat.set(repeatX, repeatY);
  texture.offset.set(random() * 0.2, random() * 0.2);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

function hashSeed(value: Record<string, unknown>) {
  const text = JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seedValue: number) {
  let seed = seedValue || 1;

  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}

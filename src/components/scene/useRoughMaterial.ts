import { useMemo } from "react";
import { CanvasTexture, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace } from "three";

export type TextureStyle = "concrete" | "fabric" | "paint" | "paper" | "wood" | "none";

export function useRoughMaterial(
  color: string,
  emissive = "#000000",
  roughness = 0.95,
  textureStyle: TextureStyle = "concrete",
) {
  return useMemo(() => {
    const texture = textureStyle === "none" ? null : createSurfaceTexture(color, textureStyle);
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
          float warp = sin(position.x * 9.0 + position.y * 3.0) * 0.006;
          transformed += normal * warp;
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
          #include <color_fragment>
          float dirt = fract(sin(dot(vViewPosition.xy, vec2(12.9898,78.233))) * 43758.5453);
          diffuseColor.rgb *= 0.86 + dirt * 0.09;
        `,
      );
    };

    return material;
  }, [color, emissive, roughness, textureStyle]);
}

function createSurfaceTexture(baseColor: string, style: TextureStyle) {
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

  for (let index = 0; index < markCount; index += 1) {
    const value = Math.random() > 0.52 ? 255 : 0;
    const opacity = value === 255 ? lightOpacity : darkOpacity;
    context.fillStyle = `rgba(${value}, ${value}, ${value}, ${opacity})`;
    context.fillRect(
      Math.random() * 256,
      Math.random() * 256,
      Math.random() * 24 + 6,
      Math.random() * 18 + 5,
    );
  }

  if (style === "wood") {
    for (let y = 0; y < 256; y += 12) {
      context.strokeStyle = "rgba(0, 0, 0, 0.16)";
      context.beginPath();
      context.moveTo(0, y + Math.sin(y) * 2);
      context.bezierCurveTo(64, y + 4, 160, y - 6, 256, y + 2);
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
      const y = Math.random() * 256;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(256, y + Math.random() * 18 - 9);
      context.stroke();
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(style === "wood" ? 2 : 3, style === "fabric" ? 4 : 3);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

# Blender Model Pipeline

This project can use real Blender models.

Recommended workflow:

1. Model or edit the asset in Blender.
2. Keep scale in meters. A typical room wall is roughly 2.4-3 meters high.
3. Apply transforms before export.
4. Export as `glTF 2.0` using the `.glb` format.
5. Put exported files in this folder, for example `public/models/bedroom-bed.glb`.
6. Load them in React Three Fiber with `useGLTF("/models/bedroom-bed.glb")` from `@react-three/drei`.

For v1, keep models low-to-medium poly and prefer rough PBR materials. Avoid glossy materials unless an object is supposed to be reflective, such as a phone screen, mirror, TV, or window.

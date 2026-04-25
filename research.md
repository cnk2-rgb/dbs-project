# Horror Game Tech Stack Research

## Project Context

`Hello Clarice` is planned as a first-person psychological horror browser game. The v1 goal is a playable bedroom scene with WASD movement, mouse look, object interaction, a phone-screen reflection scare, atmospheric audio, and a deployable web build.

Because the game is browser-first and scoped around a strong vertical slice, the best stack is a web-native 3D stack rather than a full desktop game engine.

## Recommended Stack

- **App/build:** Vite + React + TypeScript for the core game. Next.js is useful only if the project needs a larger website shell with routes, essays, devlogs, or account features.
- **3D rendering:** Three.js through `@react-three/fiber`.
- **Controls/helpers:** `@react-three/drei`, especially `PointerLockControls` for first-person mouse look.
- **Physics/collision:** Rapier through `@react-three/rapier`, preferred over Cannon for current browser/WebAssembly support.
- **Game state:** Zustand for inventory, puzzle flags, room state, life count, and scare triggers.
- **Audio:** Howler.js for ambient loops, stingers, fades, and spatial audio.
- **Postprocessing:** `@react-three/postprocessing` for vignette, noise, chromatic aberration, bloom, glitch, and screen/reflection distortion.
- **UI overlays:** Tailwind CSS for menus, HUD, subtitles, phone UI, interaction prompts, and fail-state overlays.
- **Assets:** Blender, GLB/glTF models, ambientCG textures, Sketchfab models with license checks, Mixamo animations, and Freesound audio with attribution tracking.
- **Testing:** Playwright for basic browser checks such as load, movement, interaction, and scare trigger states.
- **Deployment:** Vercel for a live web demo; itch.io HTML5 zip for indie-game distribution.

## Why This Stack Fits

React Three Fiber is a React renderer for Three.js, so scene pieces can be built as reusable components while still using the underlying Three.js ecosystem. This matches the room-based structure of the game: bedroom, kitchen, hallway, reflective surfaces, interactable props, and scripted horror beats can each become isolated components.

Three.js includes `PointerLockControls`, which its docs describe as a strong fit for first-person 3D games. That directly supports the planned WASD + mouse-look control scheme.

Rapier is a modern 2D/3D physics engine with JavaScript/WebAssembly support. For this project, it should be used mainly for simple collision, triggers, raycasting, and locked-room boundaries rather than complex simulation.

Howler.js is a good match because horror depends heavily on audio timing. Its support for looping, fading, sprites, and spatial audio is useful for room tone, phone sounds, reflection stingers, and off-screen movement cues.

## Engine Alternatives

### Unity

Unity is viable for a 3D horror game and has a large asset ecosystem, but it is heavier than needed for this v1. Unity Web builds depend on browser WebGL2, HTML5, 64-bit browsers, and WebAssembly support. It may make sense later if the project pivots toward desktop/mobile releases or more complex authored scenes.

### Godot

Godot is a good open-source alternative if an editor-first workflow feels more comfortable. However, Godot 4 web export has important caveats: it targets WebGL2 for web, has rendering limitations on web, and has web audio limitations. It is reasonable for a downloadable version, but less direct for a browser-first class demo.

### Unreal

Unreal is not recommended for this project version. It is powerful for high-fidelity horror, but it is too heavy for the planned web-first vertical slice. Browser delivery generally involves Pixel Streaming or nonstandard workflows rather than a simple static web deployment.

## Scope Recommendation

For v1, avoid building a full monster AI system. Build a tight proof of concept:

1. One bedroom scene.
2. First-person movement and collision.
3. One interactable phone.
4. One distorted reflection scare.
5. Atmospheric audio and one strong stinger.
6. Basic postprocessing for unease.
7. A deployed web build.

If the bedroom scene feels scary, the core stack is working. Additional rooms, puzzles, lives, failure cutscenes, and more reflective surfaces can be added after that.

## Sources

- React Three Fiber docs: https://r3f.docs.pmnd.rs/getting-started/introduction
- Three.js `PointerLockControls`: https://threejs.org/docs/pages/PointerLockControls.html
- Rapier physics engine: https://rapier.rs/
- Howler.js: https://howlerjs.com/
- Next.js static export docs: https://nextjs.org/docs/app/guides/static-exports
- Vite static deployment docs: https://vite.dev/guide/static-deploy.html
- itch.io HTML5 upload docs: https://itch.io/docs/creators/html5.amp
- Godot 4.5 web export docs: https://docs.godotengine.org/en/4.5/tutorials/export/exporting_for_web.html
- Unity Web browser compatibility docs: https://docs.unity3d.com/Manual/webgl-browsercompatibility.html
- Unreal Engine licensing: https://www.unrealengine.com/license
- Unreal Engine Pixel Streaming overview: https://dev.epicgames.com/documentation/en-us/unreal-engine/pixel-streaming-overview

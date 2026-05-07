# Project Proposal: Hello Clarice

## One-Line Description
A first-person psychological horror browser game where the monster hunting you is a grotesque reflection of yourself, born from the ugliness of phone addiction.

## The Problem
We've all had that moment — catching your reflection hunched over your phone in a dark screen and feeling a jolt of unease. "Hello Clarice" turns that discomfort into a full horror experience. Inspired the horror games Eyes, Granny, and the Room, this game explores what happens when screens consume your identity — literally. It's a horror game with something to say: the scariest monster is what you're becoming.

## Target User
Horror game fans who play browser-based or indie games. People who resonate with the theme of screen addiction. Fellow students, indie game communities (itch.io), and anyone who's looked at their phone's screen time report and felt dread.

## Core Features (v1)
1. **First-person exploration** — WASD movement, mouse look, click to interact with objects, double-click to zoom in
2. **The Bedroom** — a fully realized opening room where you wake up, grab your phone, and see your grotesque reflection in the black screen for the first time
3. **Reflective surface horror** — mirrors, windows, the fridge, any reflective surface can show the distorted you; the environment looks normal at first but reflections are wrong
4. **Room-based timed puzzles** — solve escape puzzles (e.g., complete a recipe in the kitchen) before time runs out; failure means getting pulled into the reflective surface and a special cutscene. Success means you learn more about yourself outside the screen. 
5. **Atmospheric audio** — ambient sound design, subtle wrongness, escalating tension (leveraging existing sound design skills)

## Tech Stack
- **Frontend:** Next.js (app shell, routing between game states/menus) + Three.js (game engine — PointerLockControls for first-person, raycasting for interactions)
- **Styling:** Tailwind (for menus, UI overlays, and HUD elements outside the 3D canvas)
- **Physics:** Cannon-es (lightweight physics and collision detection)
- **Audio:** Howler.js (spatial audio, positional sound — critical for horror atmosphere)
- **Save System:** localStorage for v1 (room progress, lives remaining); Supabase as a stretch goal for cross-device persistence
- **Auth:** None for v1 (single-player browser game)
- **APIs:** None required for core gameplay
- **3D Assets:** Sketchfab (CC-licensed horror models), ambientCG (PBR textures), Mixamo (character animations), Freesound.org (sound effects), Blender for tweaks
- **Deployment:** Vercel (static site / Next.js deployment)
- **MCP Servers:** Playwright MCP (automated browser testing of game states and interactions)

## Stretch Goals
- **Multiple rooms** — kitchen (recipe puzzle + fridge reflection), living room (TV screen), hallway (window reflections), music room (piano puzzle), room with computer servers — each with unique puzzles and escalating distortion
- **Progressive environmental distortion** — the apartment warps more with each room; walls shift, lighting changes, textures degrade. Reflection may also degreade. 
- **The Inversion ending** — fail state cutscene where the opening scene replays, but the grotesque version is the lock screen photo and you are the trapped reflection
- **Bonus redemption level** — get sucked into the digital world and fight your way back to reality
- **5-life system** — each death pulls you into a reflective surface with a unique animation per room
- **Cross-device save** with Supabase backend
- **Leaderboard** — time-based scoring for speedrun community
- **Mobile touch controls** — tap to interact, swipe to look
- **Publish on itch.io** for the indie horror community (or comparable site)

## Biggest Risk
**Making it actually scary.** Horror is one of the hardest genres to pull off — bad horror is funny, not frightening. The game lives or dies on atmosphere: lighting, audio timing, the uncanny valley of the grotesque reflection. Getting the reflection mechanic to feel creepy rather than goofy in Three.js will require iteration on shaders, post-processing effects, and timing. The second risk is scope — room-based puzzles are design-intensive, and each room needs its own assets, puzzle logic, and horror beats. Keeping v1 tight (one room, one scare) and expanding from there is the mitigation strategy. Hopefully, the creation of the game with AI will contribute to the overall uncanniness. 

## Week 5 Goal
A playable bedroom scene deployed on Vercel: the player wakes up, moves in first-person, picks up their phone, sees the grotesque reflection in the black screen, and experiences atmospheric audio and visual tension. One reflective surface (the phone screen) demonstrates the core horror mechanic. Basic interaction system (click to pick up objects) is functional. The room feels unsettling to be in. This proves the concept — if one room is creepy, the rest of the game is just more rooms.

## Additional Inspirations
The games Granny, Eyes the Horror Game, and The Room were cited as inspirations. The following are also inspirations:
- The title, "Hello Clarice", is a reference to the horror film "Silence of the Lambs". The line is said by Hannibal the cannibal. This inspires the final failed cutscene, which may be some sort of consumption of the player by the grotesque reflection, and a replay of the first scene but reversing the positions of the player and the grotesque reflection. 
- The problem: I've wanted to create a horror game for a while but don't possess the coding skillset.
- The Picture of Dorian Gray By Oscar Wilde, and the corresponding painting by Ivan Albright
- Digital necromancy and the idea of reanimating a person from their digital footprint

PROJECT_PROPOSAL.md
Displaying PROJECT_PROPOSAL.md.
assignment
Project Proposal
André Marques
•
Apr 7
Due Apr 14, 5:30 PM
Please download this prompt, give it to Claude to work through, and then upload your plan to Google Classroom as a .md file.
project-proposal-prompt.md
Text

Class comments
# Hello Clarice

A first-person psychological horror browser game prototype built with React, Vite, Three.js, and Playwright.

The current prototype centers on a dark bedroom scene and the opening beats of the game: waking up, interacting with the phone, and building tension around reflective surfaces and audio cues.

## Tech Stack

- React 19
- Vite
- TypeScript
- React Three Fiber / Three.js
- Playwright for end-to-end tests

## Prerequisites

- Node.js installed
- npm installed

A current Node.js LTS release is recommended.

## Local Setup

1. Install dependencies:

```sh
npm install
```

2. Start the local dev server:

```sh
npm run dev
```

3. Open the app in your browser:

```txt
http://localhost:5173/
```

The Vite dev server is configured to listen on `0.0.0.0`, so it can also be reached from other devices on your network if needed.

## Available Scripts

```sh
npm run dev      # Start the Vite dev server
npm run build    # Type-check and build production assets
npm run preview  # Preview the production build locally
npm run test:e2e # Run Playwright end-to-end tests
```

## End-to-End Tests

The Playwright config starts the dev server automatically during test runs.

```sh
npm run test:e2e
```

Tests live in [`tests/e2e/`](tests/e2e/), and the default base URL is `http://127.0.0.1:5173`.

Some tests use the `/?e2e=1` query parameter to expose helper controls and deterministic gameplay states.

## Repository Structure

```txt
.
├── src/                    # Application source code
│   ├── components/         # UI and scene components
│   │   └── scene/          # Bedroom / hallway / room pieces for the 3D scene
│   ├── lib/                # Shared gameplay and audio helpers
│   ├── styles.css          # Global styling
│   ├── main.tsx            # React entry point
│   └── App.tsx             # Main game state and scene orchestration
├── public/                 # Static assets served as-is
│   ├── models/             # GLB assets and model notes
│   ├── monsters/           # Monster assets
│   ├── reflections/        # Reflection-related reference images
│   └── social-samples/     # Image samples for social/UI content
├── tests/e2e/              # Playwright tests
├── markdown-files/         # Project planning and design docs
├── inspiration/            # Reference imagery and layout inspiration
├── gameplay.md             # Gameplay notes
├── gameplay-state-machine.md
├── playwright.config.ts    # Playwright test config
├── vite.config.ts          # Vite config and local SMS webhook handler
└── package.json
```

## Project Docs

The planning and design docs live under [`markdown-files/`](markdown-files/):

- [`PROJECT_PROPOSAL.md`](markdown-files/PROJECT_PROPOSAL.md) - project vision and scope
- [`research.md`](markdown-files/research.md) - stack research and recommendations
- [`README.md`](markdown-files/README.md) - notes for the current prototype and commands
- [`ROOMS_MAP_DIRECTIONS_WALL_LABELS.md`](markdown-files/ROOMS_MAP_DIRECTIONS_WALL_LABELS.md) - room layout reference

## Asset Notes

3D model guidance lives in [`markdown-files/public/models/README.md`](markdown-files/public/models/README.md).

Place exported `.glb` files in `public/models/` and load them in React Three Fiber with `useGLTF("/models/your-model.glb")`.

## Environment Variables

The prototype can optionally send SMS/inventory webhook requests in some flows.

Commonly used Vite env vars:

```sh
VITE_SMS_WEBHOOK_URL=
VITE_TWILIO_FROM_NUMBER=
VITE_INVENTORY_WEBHOOK_URL=
```

If these are unset, the related webhook actions are skipped.

For local SMS testing, `vite.config.ts` also exposes a development-only `/api/send-sms` handler that expects Twilio server credentials in the environment:

```sh
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

## Notes

- The app is a browser-based prototype and does not require a separate backend for core gameplay.
- The repo includes inspiration/reference art in `inspiration/` and `monsters/` for room and creature development.
- If you add new assets, keep large binaries in the appropriate `public/` subfolder and document them alongside the existing model notes.

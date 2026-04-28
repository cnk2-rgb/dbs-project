# Save System Plan (v1)

For v1, use a hybrid save system built on `localStorage`.

## 1. Save Triggers
- Autosave every few seconds.
- Autosave on important gameplay events:
  - puzzle step completed
  - room entered
  - life lost
  - item picked up
- Autosave when the page is hidden or about to unload:
  - `visibilitychange`
  - `beforeunload`
- Provide a manual `Save & Quit` button in the pause menu.

## 2. What to Save
Use a checkpoint model (state data), not full world snapshots.

- `currentRoom`
- `puzzleStates` (per puzzle ID)
- `inventory`
- `livesRemaining`
- `elapsedTime`
- `flags` (cutscenes seen, scares triggered)

## 3. Storage Strategy
Store one serialized save object in `localStorage`.

- Key: `hello-clarice-save-v1`
- Fields should include:
  - `version`
  - `updatedAt`
- Parse defensively:
  - wrap `JSON.parse` in `try/catch`
  - if corrupted, fail safely (ignore bad save and start clean)

## 4. Startup / Resume Flow
On game boot:

- Check whether save data exists.
- If it exists, show:
  - `Continue`
  - `New Game`
- Validate save schema before loading to avoid runtime issues.

## 5. Suggested Save Shape
```ts
type SaveData = {
  version: 1;
  updatedAt: number;
  currentRoom: "bedroom" | "kitchen" | "hallway";
  livesRemaining: number;
  elapsedTimeMs: number;
  inventory: string[];
  puzzleStates: Record<string, { solved: boolean; step?: number }>;
  flags: Record<string, boolean>;
};
```

## 6. Next Implementation Step
Create a `SaveManager` module with:

- `save(data: SaveData): void`
- `load(): SaveData | null`
- `clear(): void`
- autosave timer + event hooks

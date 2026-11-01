# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Adventure Lev is a retro 2D platformer (four-level campaign ending in a boss fight) built with Phaser 3 and Vite, in plain ES-module JavaScript. There is no TypeScript, no test framework, and no linter.

## Commands

```bash
npm install
npm run dev      # Vite dev server on http://localhost:3000 (opens a browser)
npm run build    # production build to dist/ — the only automated check
npm run preview  # serve the built dist/
```

CI (`.github/workflows/build.yml`) runs only `npm install && npm run build` on Node 20. Because there are no tests, verify gameplay changes manually in the browser against `SMOKE_TEST_CHECKLIST.md`.

`main` is protected by a ruleset: changes land only through PRs, and the `build` check must pass. Kodus AI reviews every PR. On each push to `main`, `.github/workflows/deploy.yml` publishes the build to GitHub Pages (https://lord-helicon.github.io/adventure-lev/). The Vite `base: './'` keeps asset paths relative for that sub-path. Don't name a new CI job `build`, because that name is the required check.

## Architecture

**No asset files.** Every texture is drawn onto canvases at startup by `createAssets` in `src/utils/assetGenerator.js` (called from `PreloadScene` with the scene as `this`) and registered with `this.textures.addCanvas(key, …)`. Animated sprites use numbered keys (`lev_run_0..n`, `enemy_<type>_<i>`, `coin_<i>`, `boss_guardian_<i>`). A new entity type needs its texture added here first. All sound and music are synthesized with the Web Audio API in `src/utils/AudioManager.js`.

**Logical resolution is 320×180**, scaled with `Phaser.Scale.FIT` (`src/main.js`). All scene and UI coordinates use that space; HUD and overlay elements use `setScrollFactor(0)`. Arcade physics, gravity `y: 600`.

**Scene flow:** `Boot → Preload → Menu → Game → LevelSummary → Game … → campaign complete`, with `GameOver` on zero lives. `PauseScene` and `SettingsScene` are overlays: the caller does `this.scene.pause()` + `this.scene.launch(...)`, and the overlay does `scene.stop()` + `scene.resume(parent)`. `SettingsScene` receives `{ parentScene }` so it knows whom to resume. `GameScene` listens for `resume` to re-read the keyboard layout after settings change.

**State lives outside scenes:**
- `src/utils/runState.js` is a module-level singleton for the current run (score, lives, level index). Every mutator (`addScore`, `loseLife`, `advanceLevel`, …) persists immediately. `GameScene.init({ levelIndex })` sets the level and pulls score and lives from here; scenes should not keep their own copies as the source of truth.
- `src/utils/storage.js` owns the single localStorage key `adventure-lev.save` (versioned with `STORAGE_VERSION`; versions listed in `MIGRATABLE_VERSIONS` are upgraded on read, and any other version resets to defaults). It holds `bestScore`, `settings` (mute, volume, keyboardLayout), and `run`. All reads are sanitized. If you add persisted fields, update `defaultData` and the matching `sanitize*` function.
- `AudioManager` is created per scene (`new AudioManager(this)`), but they all share one `AudioContext`/master gain through the static `AudioManager.shared`. It handles browser autoplay unlock (pointer/keydown) and visibility/focus resume. Call `syncSettings()` after changing audio settings.

**Levels are data.** `src/data/levelData.js` exports `campaignLevels`, and each level is validated at import time by `validateLevelData`, so a malformed level throws on startup. Platform `x`/`y` are in pixels, and `width` is in 16px tiles. Allowed `type` values are the `PLATFORM_TYPES`, `ENEMY_TYPES`, and `POWERUP_TYPES` sets at the top of the file. A new type must be added there, in the validator if it has new fields, in `GameScene`'s `create*` methods, and in `assetGenerator`. Optional `boss`, `secrets`, `spikes` and `theme` fields drive the finale, the hidden-route bonuses, lethal spike strips and per-level background tints, and a `falling` platform type crumbles after being stood on. Keep each level's first enemy patrol clear of `playerStart`. While a boss is alive, the goal stays locked (`goalLocked`).

**`GameScene` (~1,500 lines) is the hub.** It builds the level from data, wires all colliders and overlaps (`setupCollisions`), owns touch controls, and runs the update loop. Entities (`Player`, `Enemy`, `Boss`) are plain classes that wrap a physics sprite (`this.sprite`) rather than subclasses of `Phaser.Sprite`. They are driven by `update(…, dt)` with `dt` in seconds. Input is merged into a single `{ left, right, space }` `isDown` state in `getPlayerInputState()` from cursor keys, the selected layout (`src/utils/inputConfig.js`: arrows / WASD / ZQSD), on-screen touch buttons, and the gamepad. Fire input is read separately in `shouldFire()`. `Player.update` consumes that merged state; it never reads keys directly.

**Cleanup convention:** scenes and helpers register teardown with `this.events.once('shutdown', …)` to remove input listeners, timers, and touch buttons. Follow the same pattern for any new global or input listener, because scenes are restarted often (respawn, level transitions).

**Other modules:** `src/utils/gamepadInput.js` (`createGamepadInput(scene, handlers)`; per-scene polled pad state with edge-triggered presses, used by gameplay and every menu), `src/entities/FireballManager.js` (fire power-up projectiles), `src/utils/rank.js` (level/campaign rank and par time). Run stats (coins, deaths, time, secrets) live in `runState` and are persisted. Music is per context through `AudioManager.playMusic('menu' | 'level' | 'boss')`.

## Phaser gotchas (each has caused a real bug here)

- **Overlaps set `body.touching`.** In Phaser 3.90, `physics.add.overlap` also sets `touching.down`/`up`, so never use `touching.down` for "on the ground". Use `Player.isOnGround()`: static ground sets `blocked.down`, and dynamic platforms (moving or falling) call `player.markPlatformContact()` from their collide callback.
- **Scene instances are reused.** `scene.start` reruns `init`/`create` on the same object, so every field that is only created conditionally (boss HUD, touch hint, banners) must be reset in `init`, and monkey-patched methods survive restarts.
- **Groups may already be destroyed at `shutdown`.** Guard any manual `group.clear()` in shutdown handlers.
- **Physics groups default to gravity on.** Pass `{ allowGravity: false }` for floating pickups.

## Testing

There are no automated tests. Besides `npm run build`, verify gameplay in the browser. The game instance isn't global, so get it with `Phaser.Display.Canvas.CanvasPool.pool.map(c => c.parent).find(p => p?.loop && p.scene)`. For deterministic checks, call `game.loop.sleep()` and step it manually with `game.loop.step(t += 16.667)`; this also works when the browser tab is hidden and animation frames are throttled.

## Planning docs

`ROADMAP.md` (phased product plan) and `BACKLOG.md` (issue-sized items derived from it) describe the intended direction. They were written when the game had a single level, so some "missing" items have since been built. Check the code before assuming a feature doesn't exist.

# Adventure Lev

Adventure Lev is a retro-inspired 2D platformer built with Phaser and Vite. The current game is a short three-level campaign with generated pixel-art assets, procedural audio, and a full menu-to-completion loop.

## Current Scope

- Three campaign levels with escalating layout complexity
- Local save-backed continue flow and best-score tracking
- Tight platforming movement with coyote time and jump buffering
- Coins, checkpoints, power-ups, springs, breakable blocks, and moving platforms
- Ground, flying, hopper, and swooper enemies with stomp interactions
- Final boss encounter that unlocks the last goal in the finale level
- Hidden secret routes in later levels with discovery bonuses
- Touch gameplay controls and tap-friendly menu/overlay navigation
- Persisted alternate keyboard layouts: `Arrows`, `WASD`, and `ZQSD`
- Shared audio manager with browser resume handling for mobile/Safari-style unlock rules
- Runtime cleanup for lower-powered devices: capped particles and reduced per-frame allocations
- Menu, pause, level-complete, and game-over flow
- Persisted audio settings for mute and volume
- Dedicated between-level summary screen and settings overlay
- Runtime-generated art and Web Audio sound/music

## Controls

| Key | Action |
| --- | --- |
| `Left` / `Right` | Move |
| `Space` | Jump |
| `Enter` | Confirm / restart |
| `Esc` / `P` | Pause |
| `M` | Return to menu from pause or game over |

## Development

### Requirements

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Vite is configured to run on `http://localhost:3000`.

### Build

```bash
npm run build
```

This is the main built-in verification step for the repo.

## Project Structure

```text
src/
  data/levelData.js        Level layout and content data
  entities/Player.js       Player movement and power-up state
  entities/Enemy.js        Enemy behaviors
  scenes/GameScene.js      Main gameplay scene
  scenes/MenuScene.js      Main menu
  scenes/PauseScene.js     Pause overlay
  scenes/GameOverScene.js  Game-over flow
  utils/assetGenerator.js  Runtime-generated art
  utils/AudioManager.js    Procedural audio and music
  utils/ParticleSystem.js  Gameplay effects
```

## Documentation

- `ROADMAP.md`: phased product and technical roadmap
- `BACKLOG.md`: issue-sized backlog derived from the roadmap
- `SMOKE_TEST_CHECKLIST.md`: manual regression checklist
- `AGENTS.md`: repo-specific working notes for coding agents

## Browser Support

- Chrome / Edge
- Firefox
- Safari

Mobile browser support is planned, but dedicated touch controls are not implemented yet.

## License

This project is licensed under the MIT License. See `LICENSE`.

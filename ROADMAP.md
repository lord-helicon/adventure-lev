# Adventure Lev Roadmap

## 1. Executive Summary

`Adventure Lev` is currently a polished vertical slice: a single-level 2D platformer with strong movement feel, generated pixel-art assets, procedural audio, basic UI flow, and a complete start-to-finish loop.

The next professional step is not to add random features. It is to turn the current prototype into a small, shippable game with:

- reliable core gameplay
- multiple levels and a real progression arc
- save and score retention
- stronger usability and accessibility
- production-ready release, QA, and post-launch support practices

This roadmap is designed for the current codebase, where gameplay is centered in `src/scenes/GameScene.js`, level content is defined in `src/data/levelData.js`, player feel lives in `src/entities/Player.js`, enemy behavior lives in `src/entities/Enemy.js`, and most visuals/audio are generated at runtime.

## 2. Current Product Snapshot

### What is already working

- Main menu, gameplay, pause, and game-over flow
- One complete playable level with a goal state
- Core platforming controls with coyote time and jump buffering
- Coins, power-ups, checkpoints, moving platforms, springs, and breakable blocks
- Ground and flying enemies with stomp interaction
- Parallax background, particles, HUD, and procedural music/sound

### What is missing for a commercial-quality release

- Multiple levels and a full difficulty curve
- Save/load and progression tracking
- High-score and replayability systems
- Touch/mobile input support
- Accessibility and settings depth
- Structured balancing, QA, and release readiness
- Basic production guardrails such as CI, regression checks, and issue tracking discipline

## 3. Product Vision

Build `Adventure Lev` into a compact premium-style retro platformer that can be completed in 20 to 45 minutes, feels crisp on the first run, and encourages replay through score, secrets, and cleaner runs.

## 4. Product Pillars

### 1. Tight Platforming Feel

Movement quality remains the primary differentiator. Player responsiveness must stay strong as new hazards, enemies, and level complexity are added.

### 2. Readable Retro Presentation

The game should keep its generated pixel-art identity, but improve clarity, visual hierarchy, and theme variety across levels.

### 3. Short but Memorable Progression

The game should evolve across a small campaign rather than repeating one level pattern. Each stage should add a mechanic, enemy, or traversal twist.

### 4. Replayable Score-Chasing

The first completion matters, but replay value should come from cleaner runs, hidden pickups, fewer deaths, and better scores.

### 5. Lightweight Production Discipline

Because the project is intentionally small, the roadmap prioritizes simple processes that meaningfully reduce breakage instead of heavyweight studio overhead.

## 5. Strategic Goals

### Product goals

- Expand from one vertical slice into a short complete game
- Improve onboarding, retention, and replayability
- Support both desktop and mobile web play

### Technical goals

- Reduce gameplay regression risk as content grows
- Separate content scaling from hardcoded scene logic where practical
- Make builds, balancing, and future iteration easier

### Release goals

- Ship a stable public web build
- Support at least one post-launch content or polish update

## 6. Success Metrics

Use these as working targets once analytics or playtest logging exists:

- `>75%` of new players complete level 1
- `>50%` of players who finish level 1 start level 2
- Average full-run completion rate of `25%+` during external playtests
- Session length target: `15-30 minutes` for first-time players before final content is complete, `20-45 minutes` at launch
- Crash/blocker rate near zero in final test passes
- Stable frame rate on modern desktop browsers and acceptable performance on mid-range mobile browsers

## 7. Roadmap Principles

- Preserve the strong movement feel before adding content volume
- Prefer small, complete milestones over partially finished systems
- Build around the repo's generated-asset workflow rather than introducing a heavy art pipeline too early
- Add only the minimum architecture needed to support more levels, states, and release quality
- Treat documentation, QA, and release prep as first-class work, not end-of-project cleanup

## 8. Delivery Phases

## Phase 0: Foundation Hardening
Timeline: 2 to 3 weeks
Goal: make the current vertical slice safer to iterate on

### Product

- Audit the existing level for friction spikes, unfair enemy placement, and dead time
- Clean up onboarding text so controls and objectives are obvious immediately
- Define a target audience and target session length in the README and roadmap docs

### Engineering

- Break high-risk `GameScene` responsibilities into clearer sections or lightweight helpers only where it reduces change risk
- Introduce simple validation for `levelData` so future content errors are caught earlier
- Add a basic CI build job running `npm install` and `npm run build`
- Normalize repo documentation so the real dev port and actual tooling are documented consistently

### QA

- Create a manual smoke-test checklist for menu flow, pause flow, win flow, respawn, audio toggle, and mobile browser launch
- Run balancing passes on movement constants and enemy pacing

### Exit criteria

- Current build is stable
- Docs reflect reality
- New level content can be added with lower risk

## Phase 1: Vertical Slice to Mini-Campaign
Timeline: 4 to 6 weeks
Goal: turn the prototype into a short game with meaningful progression

### Product

- Expand from one level to three themed levels
- Give each level a distinct mechanic emphasis:
- Level 1: onboarding, readability, forgiving challenge
- Level 2: moving platforms, checkpoints, denser enemy pressure
- Level 3: advanced traversal, tighter hazards, finale setup
- Add level intro/outro transitions and a simple campaign completion screen

### Content

- Refactor `levelData` from a single-level export into a multi-level structure
- Add per-level backgrounds, color tuning, and collectible distribution
- Introduce at least one new traversal pattern per stage

### Engineering

- Add level progression flow between scenes without duplicating state logic
- Persist run state across levels: score, lives, checkpoint strategy where applicable
- Ensure procedural asset generation supports theme variation cleanly

### QA

- Perform full-run playtests focused on difficulty ramp and pacing
- Track average deaths per level and adjust accordingly

### Exit criteria

- Three levels are playable start to finish
- Progression between levels feels intentional
- The game can now be described as a complete small campaign

## Phase 2: Retention and Player Systems
Timeline: 3 to 4 weeks
Goal: increase completion rate and replay value

### Product

- Add save/load for campaign progress using browser storage
- Add local high scores or best-run tracking
- Add optional hidden collectibles or completion medals
- Expand settings with music volume, SFX volume, and display options where feasible

### UX

- Improve game-over and level-complete feedback so players understand what they achieved
- Add a lightweight progress summary after each level
- Add clearer checkpoint and power-up messaging

### Engineering

- Introduce a simple persistence layer for save data and settings
- Centralize run state so menu, gameplay, and game-over scenes share one model
- Add versioning for saved data to avoid future breakage

### Exit criteria

- Players can return to progress later
- Score-chasing becomes a real reason to replay
- Core settings survive refresh/reopen

## Phase 3: Feature Depth and Variety
Timeline: 4 to 5 weeks
Goal: make the game feel richer without losing focus

### Product

- Add 2 to 3 new enemy variants with clear readable behaviors
- Add one boss or finale encounter
- Add one advanced power-up or temporary ability that changes traversal
- Add secret routes or challenge rooms for optional mastery

### Design guardrails

- New enemy types must teach one behavior at a time
- The boss should use existing movement verbs where possible instead of introducing a disconnected combat system
- Optional content must reward mastery, not block campaign completion

### Engineering

- Extend `Enemy.js` carefully so behaviors remain readable and testable
- Keep boss logic isolated from regular enemy logic unless reuse is obvious
- Add event hooks for score bonuses, completion medals, or secret discovery

### Exit criteria

- The game has at least one headline feature beyond basic platforming
- Enemy variety supports a more memorable late game

## Phase 4: Platform Readiness and Accessibility
Timeline: 3 to 4 weeks
Goal: make the game easier to ship and easier to play

### Platform work

- Add touch controls for mobile web
- Improve canvas scaling and HUD readability on smaller screens
- Test Safari and mobile browser audio resume flow thoroughly

### Accessibility

- Add rebinding support or alternate keyboard layouts at minimum
- Improve contrast and text legibility where needed
- Reduce flashing intensity for effects that may be uncomfortable
- Add pause-menu access to settings instead of menu-only control

### Performance

- Profile particle, audio, and moving-platform cost on lower-powered devices
- Reduce unnecessary per-frame work in `GameScene.update()` if needed

### Exit criteria

- The game is playable on desktop and mobile browsers
- Accessibility and readability issues are no longer major blockers

## Phase 5: Release Candidate and Launch
Timeline: 2 to 3 weeks
Goal: ship a stable public build

### Release prep

- Freeze new features and focus on bug fixing, balance, and polish
- Create store/page assets and final project description
- Finalize license choice and contributor guidance
- Prepare a changelog and release notes

### QA

- Run full browser matrix checks
- Run progression tests across new save files and old save versions
- Validate that all scenes recover correctly from refresh, mute state, pause, and restart flows

### Launch output

- Public web build
- Updated README with accurate features and controls
- Tagged release and post-launch backlog

## 9. Suggested Release Cadence

- Internal prototype milestone: end of Phase 0
- Closed playtest milestone: end of Phase 1
- Public demo or soft launch: end of Phase 2 or early Phase 3
- Launch candidate: end of Phase 5

## 10. Prioritized Feature Backlog

### Must-have before launch

- Multi-level progression
- Save/load
- High-score or best-run tracking
- Mobile/touch controls
- Settings expansion
- Browser compatibility pass
- CI build check and smoke-test checklist

### Should-have before launch

- Additional enemy types
- Finale or boss encounter
- Secrets or completion medals
- Better end-of-level summaries

### Nice-to-have after launch

- Time-trial mode
- Leaderboards
- Additional level pack
- In-browser analytics dashboard or richer telemetry
- Level editor

## 11. Production Risks and Mitigations

### Risk: content expansion makes `GameScene` harder to maintain

Mitigation: keep refactors targeted around run state, level loading, and shared systems rather than large rewrites.

### Risk: generated assets slow down theme variety

Mitigation: extend the generator with palette/theme parameters instead of switching to a full manual asset pipeline too early.

### Risk: mobile web support introduces input and audio issues late

Mitigation: start browser/device testing in Phase 1, not Phase 4.

### Risk: replay systems create state bugs across scenes

Mitigation: establish a single source of truth for score, lives, settings, and save data before layering more screens.

### Risk: difficulty curve becomes inconsistent across levels

Mitigation: track deaths, retries, and playtest notes by level and rebalance every milestone.

## 12. Recommended Immediate Next Steps

If work starts now, the best first sprint is:

1. Correct repo docs and add CI build verification.
2. Restructure level content to support multiple stages.
3. Define the three-level campaign and difficulty curve on paper.
4. Implement level progression and shared run state.
5. Begin external playtests before adding boss content.

## 13. Roadmap Summary

The professional path for `Adventure Lev` is to evolve the current strong prototype into a small, complete platformer rather than a feature pile. The roadmap should prioritize foundation stability, multi-level progression, save and replay systems, platform readiness, and disciplined release prep. If executed in order, the game can move from polished demo to credible public release with a manageable scope.

See `BACKLOG.md` for the issue-sized implementation backlog organized by phase.

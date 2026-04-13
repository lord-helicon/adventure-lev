# Adventure Lev Backlog

This backlog translates `ROADMAP.md` into issue-sized work items. Each entry is written in a GitHub-issue-friendly format and grouped by delivery phase.

Suggested default labels:

- `phase:0-foundation`
- `phase:1-campaign`
- `phase:2-retention`
- `phase:3-variety`
- `phase:4-platform`
- `phase:5-launch`
- `type:feature`
- `type:tech`
- `type:design`
- `type:qa`
- `type:docs`
- `priority:p0`
- `priority:p1`
- `priority:p2`

## Phase 0: Foundation Hardening

### Issue 1: Audit current level balance and friction
Labels: `phase:0-foundation`, `type:design`, `priority:p0`

Description:
Review the existing level for difficulty spikes, unclear jumps, enemy placement issues, and pacing problems. Record a short list of recommended adjustments before additional content work begins.

Acceptance criteria:

- A written playtest summary exists
- Known unfair sections are identified
- Recommended changes are prioritized

### Issue 2: Improve onboarding copy and first-minute clarity
Labels: `phase:0-foundation`, `type:feature`, `priority:p0`

Description:
Improve the first player experience so controls, goal, and basic interactions are obvious without external explanation.

Acceptance criteria:

- Start flow communicates movement, jump, pause, and objective clearly
- New players can understand the goal without reading the README
- Menu and in-game copy stay visually consistent with the current style

### Issue 3: Refactor high-risk `GameScene` responsibilities
Labels: `phase:0-foundation`, `type:tech`, `priority:p0`

Description:
Reduce change risk in `src/scenes/GameScene.js` by extracting only the most error-prone responsibilities into clearer internal helpers or lightweight modules.

Acceptance criteria:

- Scene behavior remains unchanged from a player perspective
- Level creation, collision setup, and run-state flow are easier to reason about
- No broad architectural rewrite is introduced

### Issue 4: Add validation for level data structure
Labels: `phase:0-foundation`, `type:tech`, `priority:p0`

Description:
Add lightweight validation so malformed level content is caught early during development.

Acceptance criteria:

- Invalid level entries fail fast with actionable errors
- Validation covers platforms, enemies, collectibles, checkpoints, and goal data
- Validation is easy to extend for future multi-level content

### Issue 5: Add CI build verification
Labels: `phase:0-foundation`, `type:tech`, `priority:p0`

Description:
Add a minimal CI workflow that installs dependencies and runs the production build on pushes and pull requests.

Acceptance criteria:

- A CI workflow exists in the repo
- CI runs `npm install` and `npm run build`
- Build failures are visible before merge

### Issue 6: Normalize project documentation
Labels: `phase:0-foundation`, `type:docs`, `priority:p1`

Description:
Align the README and supporting docs with the actual project behavior, scripts, port, and roadmap.

Acceptance criteria:

- Docs match repo reality
- Outdated setup and tooling statements are removed or corrected
- Roadmap and backlog documents are discoverable from the README

### Issue 7: Create a manual smoke-test checklist
Labels: `phase:0-foundation`, `type:qa`, `priority:p1`

Description:
Create a repeatable manual test checklist covering the major gameplay and scene transitions.

Acceptance criteria:

- Checklist covers menu, gameplay, pause, win, game over, respawn, and audio toggle
- Checklist is stored in the repo
- Checklist is short enough to run before every release candidate

## Phase 1: Vertical Slice to Mini-Campaign

### Issue 8: Convert single-level data into multi-level campaign data
Labels: `phase:1-campaign`, `type:tech`, `priority:p0`

Description:
Refactor `src/data/levelData.js` into a structure that supports multiple levels with per-level content and metadata.

Acceptance criteria:

- Content model supports at least three levels
- Existing level still loads correctly after refactor
- New structure is readable and maintainable

### Issue 9: Introduce shared run state across scenes
Labels: `phase:1-campaign`, `type:tech`, `priority:p0`

Description:
Create a single source of truth for campaign progression, score, lives, and level transitions.

Acceptance criteria:

- Score and lives persist correctly between levels
- Menu, gameplay, and game-over flow use the same run-state model
- Restart and new-run behavior are clearly separated

### Issue 10: Build level 1 onboarding pass
Labels: `phase:1-campaign`, `type:design`, `priority:p1`

Description:
Tune level 1 as a true introduction to the game’s mechanics, emphasizing clarity and forgiving challenge.

Acceptance criteria:

- Core movement, coins, enemies, and checkpoints are taught progressively
- Difficulty spike in the opening minute is low
- First completion feels achievable for new players

### Issue 11: Build level 2 mechanic escalation
Labels: `phase:1-campaign`, `type:design`, `priority:p1`

Description:
Create a second level focused on moving platforms, denser enemy placement, and stronger pacing.

Acceptance criteria:

- Level 2 is visually distinct from level 1
- Challenge increases without relying on unfair jumps
- Checkpoints are placed intentionally

### Issue 12: Build level 3 finale stage
Labels: `phase:1-campaign`, `type:design`, `priority:p1`

Description:
Create a final campaign stage with advanced traversal and stronger endgame tension.

Acceptance criteria:

- Level 3 feels like a finale, not another remix
- Traversal combines previously learned mechanics
- Completion provides a satisfying endpoint before later boss work

### Issue 13: Add level transition flow and campaign completion screen
Labels: `phase:1-campaign`, `type:feature`, `priority:p1`

Description:
Add scene flow for completing a level, moving to the next stage, and finishing the campaign.

Acceptance criteria:

- Players transition cleanly between levels
- Campaign completion has a dedicated end state
- Replay/restart behavior is clear

### Issue 14: Add level themes to generated visuals
Labels: `phase:1-campaign`, `type:feature`, `priority:p2`

Description:
Extend generated art so each level can have a distinct palette or theme without abandoning the runtime asset pipeline.

Acceptance criteria:

- At least three levels have visibly different themes
- Theme changes do not break existing texture generation
- Visual readability remains strong

## Phase 2: Retention and Player Systems

### Issue 15: Add save/load for campaign progress
Labels: `phase:2-retention`, `type:feature`, `priority:p0`

Description:
Add browser-based save/load so players can continue progress between sessions.

Acceptance criteria:

- Campaign progress survives page refresh and browser restart
- New game and continue game flows are both supported
- Corrupt or missing save data is handled safely

### Issue 16: Version saved data structure
Labels: `phase:2-retention`, `type:tech`, `priority:p1`

Description:
Add a save-data versioning strategy to support future updates without breaking player progress.

Acceptance criteria:

- Save data contains a version field
- Older or invalid saves fail gracefully
- Migration path is documented, even if minimal

### Issue 17: Add local high scores or best-run tracking
Labels: `phase:2-retention`, `type:feature`, `priority:p0`

Description:
Track player performance locally to encourage replay and score chasing.

Acceptance criteria:

- Best score or best run is stored locally
- Results are visible from menu or end screens
- Restarting a run does not accidentally wipe unrelated records

### Issue 18: Add post-level progress summary screen
Labels: `phase:2-retention`, `type:feature`, `priority:p1`

Description:
Improve player feedback with a summary screen after each level showing score and progression status.

Acceptance criteria:

- Summary appears consistently after each level
- Players can understand what they achieved and what comes next
- Flow into the next level remains fast

### Issue 19: Add hidden collectibles or completion medals
Labels: `phase:2-retention`, `type:feature`, `priority:p2`

Description:
Introduce optional mastery goals to increase replay value without blocking campaign completion.

Acceptance criteria:

- Optional rewards exist in at least one level
- Rewards are readable and motivating
- Campaign completion remains possible without full mastery

### Issue 20: Expand settings and persist preferences
Labels: `phase:2-retention`, `type:feature`, `priority:p1`

Description:
Expand settings beyond mute toggle, including volume controls and other practical player options.

Acceptance criteria:

- Music and SFX settings can be adjusted independently if implemented
- Settings persist across sessions
- Settings can be accessed from a sensible place in the UI

## Phase 3: Feature Depth and Variety

### Issue 21: Add one new ground enemy variant
Labels: `phase:3-variety`, `type:feature`, `priority:p1`

Description:
Add a new ground enemy with a distinct behavior pattern that is easy for players to read and learn.

Acceptance criteria:

- Behavior differs meaningfully from current patrol enemy
- Attack or movement pattern is visually readable
- Enemy integrates cleanly with existing stomp/combat rules

### Issue 22: Add one new airborne or hazard enemy variant
Labels: `phase:3-variety`, `type:feature`, `priority:p1`

Description:
Add a second enemy or hazard pattern that expands traversal pressure in later levels.

Acceptance criteria:

- New behavior creates a different decision pattern for the player
- Difficulty increase is fair
- Existing enemy code remains understandable

### Issue 23: Add a finale or boss encounter
Labels: `phase:3-variety`, `type:feature`, `priority:p1`

Description:
Create a memorable final encounter that builds on platforming skills instead of replacing them with an unrelated combat mode.

Acceptance criteria:

- Encounter is winnable using established movement verbs
- Telegraphing and vulnerability windows are readable
- The finale feels distinct from standard level content

### Issue 24: Add an advanced traversal power-up
Labels: `phase:3-variety`, `type:feature`, `priority:p2`

Description:
Add one new power-up that meaningfully changes how players move or approach a section.

Acceptance criteria:

- Power-up use case is obvious
- Effect is strong enough to feel interesting without trivializing the game
- Expiration or duration rules are clear

### Issue 25: Add secret routes or challenge rooms
Labels: `phase:3-variety`, `type:design`, `priority:p2`

Description:
Add optional paths or challenge spaces for stronger replay value and mastery.

Acceptance criteria:

- Optional routes exist in at least one late-game level
- Rewards justify the challenge
- Main campaign path remains clear

## Phase 4: Platform Readiness and Accessibility

### Issue 26: Add touch controls for mobile web
Labels: `phase:4-platform`, `type:feature`, `priority:p0`

Description:
Implement touch controls suitable for mobile browsers without degrading desktop input.

Acceptance criteria:

- Core actions are playable on touch devices
- Touch controls do not block or conflict with keyboard support
- Touch UI is readable on small screens

### Issue 27: Improve responsive scaling and HUD readability
Labels: `phase:4-platform`, `type:feature`, `priority:p1`

Description:
Adjust layout, canvas scaling, and UI readability for smaller screens and varied aspect ratios.

Acceptance criteria:

- HUD remains readable on mobile-sized viewports
- Core gameplay area remains visible and useful
- No major clipping or overlap occurs on common screen sizes

### Issue 28: Improve browser audio compatibility
Labels: `phase:4-platform`, `type:tech`, `priority:p1`

Description:
Harden audio resume and playback behavior across Safari and mobile browsers.

Acceptance criteria:

- Music and SFX reliably resume after required user interaction
- Audio state is consistent after pause, restart, and scene transitions
- Known browser-specific failures are documented or resolved

### Issue 29: Add alternate keyboard layouts or rebinding support
Labels: `phase:4-platform`, `type:feature`, `priority:p1`

Description:
Improve accessibility by supporting alternate input schemes at minimum, and full rebinding if scope allows.

Acceptance criteria:

- Players can use at least one alternate layout beyond the current default
- Input configuration is clear in UI
- Chosen input options persist if settings persistence exists

### Issue 30: Reduce visual discomfort risks
Labels: `phase:4-platform`, `type:feature`, `priority:p2`

Description:
Review flashing, contrast, and effect intensity to reduce discomfort for sensitive players.

Acceptance criteria:

- High-intensity visual effects are reduced or made configurable
- Critical UI text remains legible against backgrounds
- Changes do not compromise gameplay readability

### Issue 31: Profile and optimize lower-powered devices
Labels: `phase:4-platform`, `type:tech`, `priority:p1`

Description:
Profile the game on lower-powered devices and optimize the main hotspots.

Acceptance criteria:

- A short performance report exists
- Top frame-time hotspots are identified
- At least the highest-value optimization fixes are implemented

## Phase 5: Release Candidate and Launch

### Issue 32: Create release checklist and freeze policy
Labels: `phase:5-launch`, `type:qa`, `priority:p0`

Description:
Create a release process that defines feature freeze, smoke testing, browser coverage, and launch signoff.

Acceptance criteria:

- Release checklist exists in the repo
- Freeze policy is documented
- Required browser coverage is listed

### Issue 33: Run final cross-browser QA pass
Labels: `phase:5-launch`, `type:qa`, `priority:p0`

Description:
Execute final regression testing across supported desktop and mobile browsers.

Acceptance criteria:

- Test results are recorded
- Launch-blocking issues are identified or cleared
- Final signoff is based on documented checks

### Issue 34: Finalize README, license, and release notes
Labels: `phase:5-launch`, `type:docs`, `priority:p1`

Description:
Prepare the repo for a public-facing release with accurate documentation and final metadata.

Acceptance criteria:

- README reflects released feature set
- License decision is finalized in the repo
- Release notes summarize what shipped

### Issue 35: Prepare launch build and version tag
Labels: `phase:5-launch`, `type:tech`, `priority:p1`

Description:
Prepare the public build, final version number, and release tag.

Acceptance criteria:

- Production build succeeds cleanly
- Release version is recorded
- Launch artifact/tagging process is complete

## Suggested Execution Order

Follow this order for the highest leverage path:

1. Issue 5: Add CI build verification
2. Issue 6: Normalize project documentation
3. Issue 3: Refactor high-risk `GameScene` responsibilities
4. Issue 4: Add validation for level data structure
5. Issue 8: Convert single-level data into multi-level campaign data
6. Issue 9: Introduce shared run state across scenes
7. Issues 10 to 13: Build the three-level campaign and transitions
8. Issues 15, 17, and 20: Add save, score, and settings persistence
9. Issues 21 to 25: Add variety and finale content
10. Issues 26 to 31: Ship platform and accessibility readiness
11. Issues 32 to 35: Final release prep

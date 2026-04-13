# Smoke Test Checklist

Run this checklist before release candidates and after gameplay flow changes.

## Environment

- Install dependencies with `npm install`
- Start local dev server with `npm run dev`
- Verify the game opens on `http://localhost:3000`
- Run a production check with `npm run build`

## Menu Flow

- Title screen loads without console-breaking errors
- `START GAME` begins a run
- Music toggle updates label and changes audio state
- Keyboard navigation works with arrow keys and `ENTER`

## Gameplay Flow

- Player can move left and right
- Jump works, including short and held jumps
- Coins increase score
- Ground and flying enemies interact correctly
- Stomping an enemy defeats it
- Taking damage removes a life
- Falling off the map triggers death or respawn

## Level Systems

- Moving platforms move and remain collidable
- Breakable blocks can be destroyed
- Springs launch the player upward
- Power-ups activate their intended effects
- Checkpoints activate and become the next respawn point
- Reaching the flag completes the level

## Scene Transitions

- `ESC` or `P` pauses gameplay
- Pause scene can resume the game
- Pause scene can return to the menu
- Game over screen appears when lives reach zero
- `ENTER` restarts from game over
- Campaign end or level-complete overlay does not soft-lock input

## Audio

- Music starts after user interaction where browser rules require it
- Mute state affects both menu and gameplay
- Jump, coin, death, checkpoint, and completion sounds play
- Audio still works after pause/resume and restart

## Browser Pass

- Chrome or Edge desktop pass
- Firefox desktop pass
- Safari desktop pass
- Mobile browser smoke test on at least one touch device

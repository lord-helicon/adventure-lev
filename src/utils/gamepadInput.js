// Standard-mapping button indices (Xbox layout; Cross/Square/Circle on PlayStation pads)
const BUTTON = { A: 0, B: 1, X: 2, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
const STICK_DEADZONE = 0.35;
// Menu navigation repeats while held, but slowly enough to be controllable
const REPEAT_DELAY_MS = 350;
const REPEAT_INTERVAL_MS = 140;
const DIRECTIONS = ['left', 'right', 'up', 'down'];
const PRESS_KEYS = ['jump', 'fire', 'pause', 'confirm', 'back', 'left', 'right', 'up', 'down'];

function findPad(scene) {
  const pads = scene.input?.gamepad?.gamepads;

  if (!pads) {
    return null;
  }

  for (let i = 0; i < pads.length; i++) {
    if (pads[i] && pads[i].connected !== false) {
      return pads[i];
    }
  }

  return null;
}

function isButtonDown(pad, index) {
  return Boolean(pad.buttons?.[index]?.pressed);
}

function readAxis(pad, index) {
  const axis = pad.axes?.[index];
  return axis ? axis.getValue() : 0;
}

function readRawState(pad) {
  if (!pad) {
    return null;
  }

  const stickX = readAxis(pad, 0);
  const stickY = readAxis(pad, 1);
  const a = isButtonDown(pad, BUTTON.A);
  const b = isButtonDown(pad, BUTTON.B);

  return {
    left: isButtonDown(pad, BUTTON.LEFT) || stickX < -STICK_DEADZONE,
    right: isButtonDown(pad, BUTTON.RIGHT) || stickX > STICK_DEADZONE,
    up: isButtonDown(pad, BUTTON.UP) || stickY < -STICK_DEADZONE,
    down: isButtonDown(pad, BUTTON.DOWN) || stickY > STICK_DEADZONE,
    jump: a,
    // B doubles as fire in gameplay; it is only "back" in menus, so there is no clash
    fire: isButtonDown(pad, BUTTON.X) || b,
    pause: isButtonDown(pad, BUTTON.START),
    confirm: a,
    back: b,
  };
}

/**
 * Per-scene gamepad reader. Polls the first connected pad once per frame (from the
 * scene's 'update' event, which fires before Scene.update) and exposes:
 *   held:    left, right, up, down, jump, fire
 *   presses: jumpPressed, firePressed, pausePressed, confirmPressed, backPressed,
 *            leftPressed, rightPressed, upPressed, downPressed (one frame each;
 *            directions auto-repeat while held)
 * Optional handlers ({ jump, fire, pause, confirm, back, left, right, up, down }) are
 * called on each press and can be reassigned later through `pad.handlers`.
 * Everything is removed again on scene shutdown.
 */
export function createGamepadInput(scene, handlers = {}) {
  const pad = {
    handlers,
    connected: false,
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    fire: false,
    jumpPressed: false,
    firePressed: false,
    pausePressed: false,
    confirmPressed: false,
    backPressed: false,
    leftPressed: false,
    rightPressed: false,
    upPressed: false,
    downPressed: false,
    destroy: () => {},
  };

  let previous = null;
  let activePad = null;
  const nextRepeatAt = {};

  const clearPresses = () => {
    PRESS_KEYS.forEach(key => {
      pad[`${key}Pressed`] = false;
    });
  };

  // Treat whatever is held right now as already handled, so a button that was held
  // while a scene opened or resumed (e.g. the A that closed a menu) doesn't fire again.
  const prime = () => {
    previous = null;
  };

  const poll = (time) => {
    const current = readRawState(findPad(scene));
    const rawPad = current ? findPad(scene) : null;
    clearPresses();

    if (rawPad !== activePad) {
      activePad = rawPad;
      prime();
    }

    pad.connected = Boolean(current);

    if (!current) {
      DIRECTIONS.forEach(key => {
        pad[key] = false;
      });
      pad.jump = false;
      pad.fire = false;
      previous = null;
      return;
    }

    pad.left = current.left;
    pad.right = current.right;
    pad.up = current.up;
    pad.down = current.down;
    pad.jump = current.jump;
    pad.fire = current.fire;

    if (!previous) {
      previous = current;
      return;
    }

    ['jump', 'fire', 'pause', 'confirm', 'back'].forEach(key => {
      if (current[key] && !previous[key]) {
        pad[`${key}Pressed`] = true;
      }
    });

    DIRECTIONS.forEach(key => {
      if (!current[key]) {
        nextRepeatAt[key] = 0;
      } else if (!previous[key]) {
        pad[`${key}Pressed`] = true;
        nextRepeatAt[key] = time + REPEAT_DELAY_MS;
      } else if (time >= nextRepeatAt[key]) {
        pad[`${key}Pressed`] = true;
        nextRepeatAt[key] = time + REPEAT_INTERVAL_MS;
      }
    });

    previous = current;

    PRESS_KEYS.forEach(key => {
      if (pad[`${key}Pressed`]) {
        pad.handlers[key]?.();
      }
    });
  };

  scene.events.on('update', poll);
  scene.events.on('resume', prime);

  pad.destroy = () => {
    scene.events.off('update', poll);
    scene.events.off('resume', prime);
  };
  scene.events.once('shutdown', pad.destroy);

  return pad;
}

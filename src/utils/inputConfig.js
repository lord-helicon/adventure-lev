export const DEFAULT_KEYBOARD_LAYOUT = 'arrows';

const KEYBOARD_LAYOUTS = {
  arrows: {
    id: 'arrows',
    label: 'ARROWS',
    bindings: {},
  },
  wasd: {
    id: 'wasd',
    label: 'WASD',
    bindings: {
      left: 'A',
      right: 'D',
      jump: 'W',
    },
  },
  zqsd: {
    id: 'zqsd',
    label: 'ZQSD',
    bindings: {
      left: 'Q',
      right: 'D',
      jump: 'Z',
    },
  },
};

const KEYBOARD_LAYOUT_ORDER = Object.keys(KEYBOARD_LAYOUTS);

export function normalizeKeyboardLayout(layout) {
  return KEYBOARD_LAYOUTS[layout] ? layout : DEFAULT_KEYBOARD_LAYOUT;
}

export function getKeyboardLayoutBindings(layout) {
  const normalized = normalizeKeyboardLayout(layout);
  return KEYBOARD_LAYOUTS[normalized].bindings;
}

export function getKeyboardLayoutLabel(layout) {
  const normalized = normalizeKeyboardLayout(layout);
  return KEYBOARD_LAYOUTS[normalized].label;
}

export function getNextKeyboardLayout(layout, direction = 1) {
  const normalized = normalizeKeyboardLayout(layout);
  const currentIndex = KEYBOARD_LAYOUT_ORDER.indexOf(normalized);
  const nextIndex = (currentIndex + direction + KEYBOARD_LAYOUT_ORDER.length) % KEYBOARD_LAYOUT_ORDER.length;
  return KEYBOARD_LAYOUT_ORDER[nextIndex];
}

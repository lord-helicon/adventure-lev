import { DEFAULT_KEYBOARD_LAYOUT, normalizeKeyboardLayout } from './inputConfig.js';

const STORAGE_KEY = 'adventure-lev.save';
const STORAGE_VERSION = 1;

const defaultData = {
  version: STORAGE_VERSION,
  bestScore: 0,
    settings: {
      isMuted: false,
      volume: 0.5,
      keyboardLayout: DEFAULT_KEYBOARD_LAYOUT,
    },
  run: null,
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function sanitizeSettings(settings = {}) {
  const volume = typeof settings.volume === 'number' && Number.isFinite(settings.volume)
    ? Math.max(0, Math.min(1, settings.volume))
    : defaultData.settings.volume;

  return {
    isMuted: Boolean(settings.isMuted),
    volume,
    keyboardLayout: normalizeKeyboardLayout(settings.keyboardLayout),
  };
}

function sanitizeRun(run) {
  if (!run || typeof run !== 'object') {
    return null;
  }

  const currentLevelIndex = Number.isInteger(run.currentLevelIndex) ? run.currentLevelIndex : 0;
  const score = typeof run.score === 'number' && Number.isFinite(run.score) ? Math.max(0, run.score) : 0;
  const lives = typeof run.lives === 'number' && Number.isFinite(run.lives) ? Math.max(0, run.lives) : 0;

  return {
    active: Boolean(run.active),
    currentLevelIndex,
    score,
    lives,
  };
}

function sanitizeData(data) {
  if (!data || typeof data !== 'object' || data.version !== STORAGE_VERSION) {
    return { ...defaultData, settings: { ...defaultData.settings } };
  }

  return {
    version: STORAGE_VERSION,
    bestScore: typeof data.bestScore === 'number' && Number.isFinite(data.bestScore)
      ? Math.max(0, data.bestScore)
      : defaultData.bestScore,
    settings: sanitizeSettings(data.settings),
    run: sanitizeRun(data.run),
  };
}

function readData() {
  if (!canUseStorage()) {
    return { ...defaultData, settings: { ...defaultData.settings } };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return { ...defaultData, settings: { ...defaultData.settings } };
    }

    return sanitizeData(JSON.parse(raw));
  } catch {
    return { ...defaultData, settings: { ...defaultData.settings } };
  }
}

function writeData(data) {
  if (!canUseStorage()) {
    return;
  }

  const normalized = sanitizeData(data);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}

export function loadSettings() {
  return readData().settings;
}

export function saveSettings(settings) {
  const data = readData();
  data.settings = sanitizeSettings({ ...data.settings, ...settings });
  writeData(data);
  return data.settings;
}

export function loadRunProgress() {
  const run = readData().run;
  return run && run.active ? run : null;
}

export function saveRunProgress(run) {
  const data = readData();
  data.run = sanitizeRun(run);
  writeData(data);
  return data.run;
}

export function clearRunProgress() {
  const data = readData();
  data.run = null;
  writeData(data);
}

export function hasRunProgress() {
  return loadRunProgress() !== null;
}

export function getBestScore() {
  return readData().bestScore;
}

export function recordBestScore(score) {
  const data = readData();
  const nextBest = Math.max(data.bestScore, Math.max(0, score));
  data.bestScore = nextBest;
  writeData(data);
  return nextBest;
}

export function getStorageVersion() {
  return STORAGE_VERSION;
}

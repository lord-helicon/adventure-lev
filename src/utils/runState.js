import { getLevelCount } from '../data/levelData.js';
import {
  clearRunProgress,
  loadRunProgress,
  recordBestScore,
  saveRunProgress,
} from './storage.js';

const DEFAULT_LIVES = 3;

function createDefaultRunState() {
  return {
    active: false,
    score: 0,
    lives: DEFAULT_LIVES,
    currentLevelIndex: 0,
  };
}

function normalizeSavedRun(savedRun) {
  if (!savedRun) {
    return createDefaultRunState();
  }

  const maxLevelIndex = getLevelCount() - 1;
  const score = typeof savedRun.score === 'number' && Number.isFinite(savedRun.score)
    ? Math.max(0, savedRun.score)
    : 0;
  const lives = typeof savedRun.lives === 'number' && Number.isFinite(savedRun.lives)
    ? Math.max(0, savedRun.lives)
    : DEFAULT_LIVES;
  const currentLevelIndex = Number.isInteger(savedRun.currentLevelIndex)
    ? Math.min(Math.max(savedRun.currentLevelIndex, 0), maxLevelIndex)
    : 0;

  return {
    active: Boolean(savedRun.active),
    score,
    lives,
    currentLevelIndex,
  };
}

const runState = normalizeSavedRun(loadRunProgress());

function syncRunState() {
  if (runState.active) {
    saveRunProgress(runState);
    return;
  }

  clearRunProgress();
}

export function getRunState() {
  return { ...runState };
}

export function startNewRun() {
  runState.active = true;
  runState.score = 0;
  runState.lives = DEFAULT_LIVES;
  runState.currentLevelIndex = 0;
  syncRunState();
  return getRunState();
}

export function abandonRun() {
  runState.active = false;
  runState.score = 0;
  runState.lives = DEFAULT_LIVES;
  runState.currentLevelIndex = 0;
  syncRunState();
}

export function restoreSavedRun() {
  const savedRun = loadRunProgress();

  if (!savedRun) {
    return null;
  }

  Object.assign(runState, normalizeSavedRun(savedRun), { active: true });
  syncRunState();
  return getRunState();
}

export function ensureRunStarted() {
  if (!runState.active) {
    startNewRun();
  }

  return getRunState();
}

export function setCurrentLevelIndex(levelIndex) {
  if (!Number.isInteger(levelIndex) || levelIndex < 0 || levelIndex >= getLevelCount()) {
    throw new Error(`Invalid level index: ${levelIndex}.`);
  }

  runState.active = true;
  runState.currentLevelIndex = levelIndex;
  syncRunState();
  return runState.currentLevelIndex;
}

export function addScore(points) {
  runState.score += points;
  recordBestScore(runState.score);
  syncRunState();
  return runState.score;
}

export function addLife(amount = 1) {
  runState.lives += amount;
  syncRunState();
  return runState.lives;
}

export function loseLife(amount = 1) {
  runState.lives = Math.max(0, runState.lives - amount);
  syncRunState();
  return runState.lives;
}

export function hasNextLevel() {
  return runState.currentLevelIndex < getLevelCount() - 1;
}

export function advanceLevel() {
  if (!hasNextLevel()) {
    return null;
  }

  runState.currentLevelIndex += 1;
  syncRunState();
  return runState.currentLevelIndex;
}

// Level and campaign ranking. One formula serves both: pass a single level's numbers or the run totals.
//
// Points out of 100:
//   coins    40  * found / total              (no coins in level -> full)
//   secrets  10  * found / total              (no secrets        -> full)
//   deaths   30  * max(0, 1 - deaths / 3)     (0 deaths = 30, 3 or more = 0)
//   time     20  * clamp(1 - (time - par) / (2 * par), 0, 1)   (at or under par = 20, 3x par = 0)
// Rank: S >= 92, A >= 75, B >= 50, otherwise C. S effectively requires a death-free run.

const PAR_PIXELS_PER_SECOND = 15;

// Par time in seconds, derived from level width so new levels need no extra data
export function getParTime(levelData) {
  return levelData.width / PAR_PIXELS_PER_SECOND;
}

function ratio(found, total) {
  return total > 0 ? Math.min(1, found / total) : 1;
}

export function computeRankPoints({ coins, totalCoins, secrets, totalSecrets, deaths, time, parTime }) {
  const timeScore = parTime > 0
    ? Math.min(1, Math.max(0, 1 - (time - parTime) / (2 * parTime)))
    : 1;

  return 40 * ratio(coins, totalCoins)
    + 10 * ratio(secrets, totalSecrets)
    + 30 * Math.max(0, 1 - deaths / 3)
    + 20 * timeScore;
}

export function computeRank(stats) {
  const points = computeRankPoints(stats);

  if (points >= 92) return 'S';
  if (points >= 75) return 'A';
  if (points >= 50) return 'B';
  return 'C';
}

export function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, '0')}`;
}

export const RANK_COLORS = {
  S: '#FFD700',
  A: '#66FF66',
  B: '#66CCFF',
  C: '#CCCCCC',
};

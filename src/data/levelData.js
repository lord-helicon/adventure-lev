/**
 * Campaign level data.
 */
const PLATFORM_TYPES = new Set(['grass', 'dirt', 'moving', 'breakable']);
const ENEMY_TYPES = new Set(['ground', 'flying', 'hopper', 'swooper']);
const POWERUP_TYPES = new Set(['star', 'speed', 'life']);

const campaignLevels = [
  {
    id: 'meadow-run',
    name: 'Meadow Run',
    width: 1200,
    height: 180,
    playerStart: { x: 50, y: 100 },
    platforms: [
      { x: 0, y: 160, width: 15, type: 'grass' },
      { x: 280, y: 160, width: 10, type: 'grass' },
      { x: 500, y: 160, width: 15, type: 'grass' },
      { x: 800, y: 160, width: 25, type: 'grass' },
      { x: 180, y: 130, width: 6, type: 'grass' },
      { x: 320, y: 100, width: 5, type: 'grass' },
      { x: 450, y: 80, width: 4, type: 'grass' },
      { x: 580, y: 110, width: 6, type: 'grass' },
      { x: 720, y: 90, width: 5, type: 'grass' },
      { x: 900, y: 120, width: 6, type: 'grass' },
      { x: 1050, y: 100, width: 4, type: 'grass' },
      { x: 850, y: 60, width: 4, type: 'grass' },
      { x: 400, y: 130, width: 3, type: 'moving', moveY: -50, speed: 30 },
      { x: 650, y: 140, width: 3, type: 'moving', moveX: 80, speed: 40 },
      { x: 380, y: 70, width: 1, type: 'breakable' },
      { x: 400, y: 70, width: 1, type: 'breakable' },
      { x: 420, y: 70, width: 1, type: 'breakable' },
      { x: 0, y: 176, width: 75, type: 'dirt' },
    ],
    coins: [
      { x: 200, y: 110 },
      { x: 220, y: 110 },
      { x: 340, y: 80 },
      { x: 360, y: 80 },
      { x: 390, y: 50 },
      { x: 470, y: 60 },
      { x: 480, y: 60 },
      { x: 600, y: 90 },
      { x: 620, y: 90 },
      { x: 640, y: 90 },
      { x: 740, y: 70 },
      { x: 760, y: 70 },
      { x: 870, y: 40 },
      { x: 890, y: 40 },
      { x: 920, y: 100 },
      { x: 940, y: 100 },
      { x: 960, y: 100 },
      { x: 1070, y: 80 },
      { x: 1090, y: 80 },
    ],
    enemies: [
      { x: 150, y: 148, type: 'ground', patrolDistance: 50 },
      { x: 340, y: 88, type: 'ground', patrolDistance: 40 },
      { x: 550, y: 148, type: 'ground', patrolDistance: 60 },
      { x: 620, y: 98, type: 'ground', patrolDistance: 40 },
      { x: 840, y: 148, type: 'ground', patrolDistance: 50 },
      { x: 250, y: 80, type: 'flying', patrolDistance: 60 },
      { x: 700, y: 70, type: 'flying', patrolDistance: 50 },
      { x: 950, y: 90, type: 'flying', patrolDistance: 60 },
    ],
    springs: [
      { x: 260, y: 148 },
      { x: 830, y: 148 },
    ],
    powerups: [
      { x: 410, y: 40, type: 'star' },
      { x: 880, y: 40, type: 'speed' },
      { x: 1100, y: 80, type: 'life' },
    ],
    checkpoints: [
      { x: 300, y: 144 },
      { x: 750, y: 144 },
    ],
    goal: { x: 1150, y: 128 },
  },
  {
    id: 'sky-bridges',
    name: 'Sky Bridges',
    width: 1380,
    height: 180,
    playerStart: { x: 40, y: 100 },
    platforms: [
      { x: 0, y: 160, width: 10, type: 'grass' },
      { x: 220, y: 160, width: 8, type: 'grass' },
      { x: 420, y: 160, width: 6, type: 'grass' },
      { x: 640, y: 160, width: 10, type: 'grass' },
      { x: 920, y: 160, width: 8, type: 'grass' },
      { x: 1160, y: 160, width: 12, type: 'grass' },
      { x: 130, y: 128, width: 4, type: 'grass' },
      { x: 300, y: 102, width: 4, type: 'grass' },
      { x: 470, y: 82, width: 3, type: 'grass' },
      { x: 740, y: 108, width: 5, type: 'grass' },
      { x: 1010, y: 92, width: 4, type: 'grass' },
      { x: 1180, y: 70, width: 4, type: 'grass' },
      { x: 1040, y: 38, width: 3, type: 'grass' },
      { x: 1120, y: 24, width: 3, type: 'grass' },
      { x: 1215, y: 26, width: 4, type: 'grass' },
      { x: 180, y: 142, width: 3, type: 'moving', moveX: 70, speed: 45 },
      { x: 540, y: 126, width: 3, type: 'moving', moveY: -48, speed: 35 },
      { x: 860, y: 124, width: 3, type: 'moving', moveX: 90, speed: 50 },
      { x: 1110, y: 120, width: 2, type: 'moving', moveY: -44, speed: 40 },
      { x: 498, y: 52, width: 1, type: 'breakable' },
      { x: 514, y: 52, width: 1, type: 'breakable' },
      { x: 0, y: 176, width: 87, type: 'dirt' },
    ],
    coins: [
      { x: 146, y: 100 },
      { x: 162, y: 100 },
      { x: 316, y: 74 },
      { x: 332, y: 74 },
      { x: 486, y: 52 },
      { x: 548, y: 98 },
      { x: 564, y: 82 },
      { x: 756, y: 80 },
      { x: 772, y: 80 },
      { x: 788, y: 80 },
      { x: 878, y: 94 },
      { x: 894, y: 94 },
      { x: 1026, y: 64 },
      { x: 1042, y: 64 },
      { x: 1056, y: 10 },
      { x: 1072, y: 10 },
      { x: 1136, y: 0 },
      { x: 1152, y: 0 },
      { x: 1232, y: 2 },
      { x: 1248, y: 2 },
      { x: 1196, y: 42 },
      { x: 1212, y: 42 },
      { x: 1236, y: 42 },
      { x: 1310, y: 130 },
      { x: 1330, y: 130 },
    ],
    enemies: [
      { x: 78, y: 148, type: 'ground', patrolDistance: 45 },
      { x: 278, y: 148, type: 'ground', patrolDistance: 45 },
      { x: 470, y: 146, type: 'hopper', patrolDistance: 35 },
      { x: 744, y: 96, type: 'ground', patrolDistance: 45 },
      { x: 1006, y: 146, type: 'hopper', patrolDistance: 40 },
      { x: 240, y: 72, type: 'flying', patrolDistance: 70 },
      { x: 650, y: 86, type: 'flying', patrolDistance: 80 },
      { x: 920, y: 72, type: 'swooper', patrolDistance: 60 },
      { x: 1244, y: 48, type: 'flying', patrolDistance: 50 },
    ],
    springs: [
      { x: 390, y: 148 },
      { x: 980, y: 148 },
    ],
    powerups: [
      { x: 505, y: 24, type: 'star' },
      { x: 1080, y: 60, type: 'speed' },
      { x: 1272, y: 38, type: 'life' },
    ],
    checkpoints: [
      { x: 430, y: 144 },
      { x: 930, y: 144 },
    ],
    secrets: [
      { x: 1048, y: 18, width: 88, height: 32, label: 'SKY CACHE' },
    ],
    goal: { x: 1340, y: 128 },
  },
  {
    id: 'fortress-climb',
    name: 'Fortress Climb',
    width: 1520,
    height: 180,
    playerStart: { x: 48, y: 100 },
    platforms: [
      { x: 0, y: 160, width: 8, type: 'grass' },
      { x: 180, y: 160, width: 8, type: 'grass' },
      { x: 360, y: 160, width: 6, type: 'grass' },
      { x: 540, y: 160, width: 9, type: 'grass' },
      { x: 790, y: 160, width: 7, type: 'grass' },
      { x: 980, y: 160, width: 7, type: 'grass' },
      { x: 1180, y: 160, width: 8, type: 'grass' },
      { x: 1380, y: 160, width: 12, type: 'grass' },
      { x: 120, y: 126, width: 3, type: 'grass' },
      { x: 250, y: 96, width: 3, type: 'grass' },
      { x: 420, y: 68, width: 3, type: 'grass' },
      { x: 620, y: 110, width: 4, type: 'grass' },
      { x: 860, y: 84, width: 3, type: 'grass' },
      { x: 1090, y: 60, width: 4, type: 'grass' },
      { x: 1260, y: 92, width: 4, type: 'grass' },
      { x: 1360, y: 62, width: 4, type: 'grass' },
      { x: 1120, y: 18, width: 3, type: 'grass' },
      { x: 1200, y: 18, width: 2, type: 'grass' },
      { x: 1270, y: 26, width: 3, type: 'grass' },
      { x: 155, y: 140, width: 2, type: 'moving', moveY: -48, speed: 42 },
      { x: 492, y: 134, width: 2, type: 'moving', moveX: 85, speed: 55 },
      { x: 735, y: 122, width: 3, type: 'moving', moveY: -52, speed: 38 },
      { x: 948, y: 118, width: 2, type: 'moving', moveX: 70, speed: 48 },
      { x: 1180, y: 116, width: 3, type: 'moving', moveY: -54, speed: 44 },
      { x: 1040, y: 32, width: 1, type: 'breakable' },
      { x: 1056, y: 32, width: 1, type: 'breakable' },
      { x: 1072, y: 32, width: 1, type: 'breakable' },
      { x: 0, y: 176, width: 95, type: 'dirt' },
    ],
    coins: [
      { x: 136, y: 98 },
      { x: 266, y: 68 },
      { x: 282, y: 68 },
      { x: 436, y: 40 },
      { x: 452, y: 40 },
      { x: 508, y: 110 },
      { x: 524, y: 110 },
      { x: 640, y: 82 },
      { x: 656, y: 82 },
      { x: 872, y: 56 },
      { x: 888, y: 56 },
      { x: 960, y: 90 },
      { x: 1106, y: 32 },
      { x: 1122, y: 32 },
      { x: 1136, y: 2 },
      { x: 1152, y: 2 },
      { x: 1216, y: 2 },
      { x: 1286, y: 10 },
      { x: 1302, y: 10 },
      { x: 1276, y: 64 },
      { x: 1292, y: 64 },
      { x: 1376, y: 34 },
      { x: 1392, y: 34 },
      { x: 1480, y: 130 },
    ],
    enemies: [
      { x: 70, y: 148, type: 'ground', patrolDistance: 35 },
      { x: 220, y: 148, type: 'ground', patrolDistance: 35 },
      { x: 564, y: 146, type: 'hopper', patrolDistance: 45 },
      { x: 816, y: 148, type: 'ground', patrolDistance: 35 },
      { x: 1006, y: 148, type: 'ground', patrolDistance: 35 },
      { x: 1420, y: 146, type: 'hopper', patrolDistance: 45 },
      { x: 340, y: 60, type: 'flying', patrolDistance: 70 },
      { x: 734, y: 74, type: 'swooper', patrolDistance: 75 },
      { x: 1180, y: 54, type: 'flying', patrolDistance: 60 },
      { x: 1450, y: 44, type: 'swooper', patrolDistance: 55 },
    ],
    springs: [
      { x: 332, y: 148 },
      { x: 910, y: 148 },
      { x: 1330, y: 148 },
    ],
    powerups: [
      { x: 448, y: 26, type: 'star' },
      { x: 1064, y: 8, type: 'speed' },
      { x: 1408, y: 34, type: 'life' },
    ],
    checkpoints: [
      { x: 590, y: 144 },
      { x: 1160, y: 144 },
    ],
    secrets: [
      { x: 1128, y: 6, width: 110, height: 28, label: 'RUIN VAULT' },
    ],
    boss: { x: 1360, y: 140, health: 3, patrolDistance: 68, speed: 44 },
    goal: { x: 1488, y: 128 },
  },
];

function assertNumber(value, label) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Invalid level data: ${label} must be a number.`);
  }
}

function assertPosition(entry, label) {
  if (!entry || typeof entry !== 'object') {
    throw new Error(`Invalid level data: ${label} must be an object.`);
  }

  assertNumber(entry.x, `${label}.x`);
  assertNumber(entry.y, `${label}.y`);
}

function assertArray(entries, label) {
  if (!Array.isArray(entries)) {
    throw new Error(`Invalid level data: ${label} must be an array.`);
  }
}

function assertEnum(value, allowedValues, label) {
  if (!allowedValues.has(value)) {
    throw new Error(
      `Invalid level data: ${label} must be one of ${Array.from(allowedValues).join(', ')}.`
    );
  }
}

export function validateLevelData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid level data: root value must be an object.');
  }

  if (typeof data.id !== 'string' || data.id.length === 0) {
    throw new Error('Invalid level data: id must be a non-empty string.');
  }

  if (typeof data.name !== 'string' || data.name.length === 0) {
    throw new Error('Invalid level data: name must be a non-empty string.');
  }

  assertNumber(data.width, 'width');
  assertNumber(data.height, 'height');
  assertPosition(data.playerStart, 'playerStart');
  assertPosition(data.goal, 'goal');

  if (data.boss !== undefined) {
    assertPosition(data.boss, 'boss');
    assertNumber(data.boss.health, 'boss.health');

    if (data.boss.patrolDistance !== undefined) {
      assertNumber(data.boss.patrolDistance, 'boss.patrolDistance');
    }

    if (data.boss.speed !== undefined) {
      assertNumber(data.boss.speed, 'boss.speed');
    }
  }

  if (data.secrets !== undefined) {
    assertArray(data.secrets, 'secrets');
    data.secrets.forEach((secret, index) => {
      assertPosition(secret, `secrets[${index}]`);
      assertNumber(secret.width, `secrets[${index}].width`);
      assertNumber(secret.height, `secrets[${index}].height`);

      if (typeof secret.label !== 'string' || secret.label.length === 0) {
        throw new Error(`Invalid level data: secrets[${index}].label must be a non-empty string.`);
      }
    });
  }

  assertArray(data.platforms, 'platforms');
  data.platforms.forEach((platform, index) => {
    assertPosition(platform, `platforms[${index}]`);
    assertNumber(platform.width, `platforms[${index}].width`);
    assertEnum(platform.type, PLATFORM_TYPES, `platforms[${index}].type`);

    if (platform.moveX !== undefined) {
      assertNumber(platform.moveX, `platforms[${index}].moveX`);
    }

    if (platform.moveY !== undefined) {
      assertNumber(platform.moveY, `platforms[${index}].moveY`);
    }

    if (platform.speed !== undefined) {
      assertNumber(platform.speed, `platforms[${index}].speed`);
    }
  });

  assertArray(data.coins, 'coins');
  data.coins.forEach((coin, index) => {
    assertPosition(coin, `coins[${index}]`);
  });

  assertArray(data.enemies, 'enemies');
  data.enemies.forEach((enemy, index) => {
    assertPosition(enemy, `enemies[${index}]`);
    assertEnum(enemy.type, ENEMY_TYPES, `enemies[${index}].type`);
    assertNumber(enemy.patrolDistance, `enemies[${index}].patrolDistance`);
  });

  assertArray(data.springs, 'springs');
  data.springs.forEach((spring, index) => {
    assertPosition(spring, `springs[${index}]`);
  });

  assertArray(data.powerups, 'powerups');
  data.powerups.forEach((powerup, index) => {
    assertPosition(powerup, `powerups[${index}]`);
    assertEnum(powerup.type, POWERUP_TYPES, `powerups[${index}].type`);
  });

  assertArray(data.checkpoints, 'checkpoints');
  data.checkpoints.forEach((checkpoint, index) => {
    assertPosition(checkpoint, `checkpoints[${index}]`);
  });

  return data;
}

campaignLevels.forEach(validateLevelData);

export function getLevelCount() {
  return campaignLevels.length;
}

export function getLevelData(levelIndex) {
  const levelData = campaignLevels[levelIndex];

  if (!levelData) {
    throw new Error(`Invalid level index: ${levelIndex}.`);
  }

  return levelData;
}

export { campaignLevels };

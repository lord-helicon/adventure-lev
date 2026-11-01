import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Boss from '../entities/Boss.js';
import FireballManager from '../entities/FireballManager.js';
import ParticleSystem from '../utils/ParticleSystem.js';
import AudioManager from '../utils/AudioManager.js';
import { getLevelCount, getLevelData } from '../data/levelData.js';
import { getKeyboardLayoutBindings, getKeyboardLayoutLabel } from '../utils/inputConfig.js';
import { loadSettings } from '../utils/storage.js';
import { createGamepadInput } from '../utils/gamepadInput.js';
import { computeRank, formatTime, getParTime, RANK_COLORS } from '../utils/rank.js';
import {
  abandonRun,
  addCoin,
  addDeath,
  addLife,
  addScore,
  ensureRunStarted,
  getRunState,
  hasNextLevel,
  loseLife,
  recordLevelResult,
  setCurrentLevelIndex,
} from '../utils/runState.js';

/**
 * Enhanced Game Scene with improved gameplay
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data = {}) {
    if (Number.isInteger(data.levelIndex)) {
      setCurrentLevelIndex(data.levelIndex);
    }

    const runState = ensureRunStarted();

    this.levelIndex = runState.currentLevelIndex;
    this.levelData = getLevelData(this.levelIndex);
    this.score = runState.score;
    this.lives = runState.lives;
    this.totalLevels = getLevelCount();
    this.levelComplete = false;
    this.gameOver = false;
    this.isTransitioning = false;
    this.isRespawning = false;
    this.checkpointPos = null;
    this.enemies = [];
    this.movingPlatforms = [];
    this.secretZones = [];
    this.discoveredSecrets = new Set();
    // Run coin total (this.coins is the physics group) and per-level stats for the summary
    this.coinCount = runState.coins;
    this.levelCoins = 0;
    this.levelDeaths = 0;
    this.levelTime = 0;
    this.boss = null;
    this.bossDefeated = false;
    this.goalLocked = false;
    this.touchControls = { left: false, right: false, jump: false };
    this.touchButtons = [];
    this.touchButtonReleases = [];
    this.touchFireQueued = false;
    this.fireButtonParts = [];
    this.isTouchDevice = false;
    this.keyboardLayout = loadSettings().keyboardLayout;
    this.layoutKeys = {};
    this.inputState = {
      left: { isDown: false },
      right: { isDown: false },
      space: { isDown: false },
    };
  }

  create() {
    // Initialize systems
    this.audioManager = new AudioManager(this);
    this.audioManager.resume();
    this.setupMusic();
    this.particles = new ParticleSystem(this);
    this.isTouchDevice = this.sys.game.device.input.touch;

    this.registerSceneCleanup();
    this.gamepad = createGamepadInput(this, { pause: () => this.pauseGame() });
    
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.levelData.width, this.levelData.height);
    
    // Create parallax background
    this.createParallaxBackground();
    
    // Create level
    this.createLevel();
    
    // Create player
    this.player = new Player(this, this.levelData.playerStart.x, this.levelData.playerStart.y);
    
    // Set up camera
    this.cameras.main.setBounds(0, 0, this.levelData.width, this.levelData.height);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(40, 20);
    
    // Set up collisions
    this.setupCollisions();
    this.setupFireballs();
    
    // Input handling
    this.setupInputHandlers();
    
    // Create UI
    this.createUI();
    this.refreshKeyboardLayout();

    this.events.on('resume', this.refreshKeyboardLayout, this);
    
    // Fade in
    this.cameras.main.fadeIn(500);
  }

  createParallaxBackground() {
    // Create scrolling backgrounds
    this.bgSky = this.add.tileSprite(160, 90, 320, 180, 'bg_sky');
    this.bgSky.setScrollFactor(0);
    this.bgSky.setDepth(-3);
    
    this.bgMountains = this.add.tileSprite(160, 90, 320, 180, 'bg_mountains');
    this.bgMountains.setScrollFactor(0.1);
    this.bgMountains.setDepth(-2);
    this.bgMountains.setAlpha(0.6);
    
    this.bgClouds = this.add.tileSprite(160, 90, 320, 180, 'bg_clouds');
    this.bgClouds.setScrollFactor(0.3);
    this.bgClouds.setDepth(-1);
    this.bgClouds.setAlpha(0.8);
    
    this.bgTrees = this.add.tileSprite(160, 90, 320, 180, 'bg_trees');
    this.bgTrees.setScrollFactor(0.5);
    this.bgTrees.setDepth(0);
    this.bgTrees.setAlpha(0.7);
  }

  createLevel() {
    // Create platform groups
    this.platforms = this.physics.add.staticGroup();
    this.breakablePlatforms = this.physics.add.staticGroup();
    
    // Build platforms from level data
    this.levelData.platforms.forEach(platform => {
      if (platform.type === 'moving') {
        this.createMovingPlatform(platform);
      } else if (platform.type === 'breakable') {
        for (let i = 0; i < platform.width; i++) {
          const tile = this.breakablePlatforms.create(
            platform.x + i * 16, 
            platform.y, 
            'tile_breakable'
          );
          tile.setOrigin(0);
          tile.refreshBody();
        }
      } else {
        const texture = platform.type === 'grass' ? 'tile_grass' : 'tile_dirt';
        for (let i = 0; i < platform.width; i++) {
          const tile = this.platforms.create(platform.x + i * 16, platform.y, texture);
          tile.setOrigin(0);
          tile.refreshBody();
        }
      }
    });
    
    this.createCoins();
    this.createEnemies();
    
    // Create springs
    this.springs = this.physics.add.staticGroup();
    this.levelData.springs.forEach(spring => {
      const s = this.springs.create(spring.x, spring.y, 'spring');
      s.setOrigin(0);
      s.refreshBody();
      s.body.setSize(16, 8);
    });
    
    this.createPowerups();
    this.createSecretZones();
    
    // Create checkpoints
    this.checkpoints = this.physics.add.staticGroup();
    this.levelData.checkpoints.forEach(checkpoint => {
      // Level data positions assume a 16px-tall marker; anchor the 24px sprite by its base instead
      const c = this.checkpoints.create(checkpoint.x, checkpoint.y + 16, 'checkpoint');
      c.setOrigin(0, 1);
      c.refreshBody();
      c.activated = false;
    });

    // Create goal (top-left origin like the other level pieces, so it stands on the ground)
    this.goalFlag = this.physics.add.staticSprite(this.levelData.goal.x, this.levelData.goal.y, 'flag');
    this.goalFlag.setOrigin(0);
    this.goalFlag.refreshBody();
    this.goalFlag.body.setSize(8, 32);

    if (this.levelData.boss) {
      this.createBossEncounter();
    }
  }

  createBossEncounter() {
    this.boss = new Boss(this, this.levelData.boss);
    this.goalLocked = true;
    this.goalFlag.setAlpha(0.35);
  }

  createSecretZones() {
    if (!this.levelData.secrets) {
      return;
    }

    this.secretZones = this.levelData.secrets.map((secret, index) => {
      const zone = this.add.zone(secret.x, secret.y, secret.width, secret.height);
      zone.setOrigin(0);
      zone.secretLabel = secret.label;
      zone.secretId = `${this.levelData.id}-secret-${index}`;
      this.physics.add.existing(zone, true);
      return zone;
    });
  }

  createCoins() {
    this.coins = this.physics.add.group({ allowGravity: false, immovable: true });

    if (!this.anims.exists('coin_spin')) {
      this.anims.create({
        key: 'coin_spin',
        frames: Array.from({ length: 8 }, (_, i) => ({ key: `coin_${i}` })),
        frameRate: 10,
        repeat: -1
      });
    }

    this.levelData.coins.forEach(coin => {
      const sprite = this.coins.create(coin.x, coin.y, 'coin_0');
      sprite.anims.play('coin_spin');
      sprite.setBodySize(8, 10);
    });
  }

  createEnemies() {
    this.levelData.enemies.forEach(enemy => {
      const instance = new Enemy(this, enemy.x, enemy.y, enemy.type);
      instance.patrolDistance = enemy.patrolDistance;
      this.enemies.push(instance);
    });
  }

  createPowerups() {
    this.powerups = this.physics.add.group({ allowGravity: false, immovable: true });

    this.levelData.powerups.forEach(powerup => {
      const sprite = this.powerups.create(powerup.x, powerup.y, `powerup_${powerup.type}`);
      sprite.setBodySize(12, 12);
      sprite.powerupType = powerup.type;
    });

    this.tweens.add({
      targets: this.powerups.getChildren(),
      y: '+=4',
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createMovingPlatform(platformData) {
    const tiles = [];
    for (let i = 0; i < platformData.width; i++) {
      const tile = this.physics.add.sprite(
        platformData.x + i * 16,
        platformData.y,
        'tile_moving'
      );
      tile.setOrigin(0);
      tile.body.setImmovable(true);
      tile.body.pushable = false;
      tile.body.allowGravity = false;
      // Arcade carries a riding body along with an immovable body's horizontal motion
      tile.body.setFriction(1, 0);
      tiles.push(tile);
    }

    const moveX = platformData.moveX || 0;
    const moveY = platformData.moveY || 0;
    const maxOffset = Math.sqrt(moveX ** 2 + moveY ** 2);

    // Platforms travel between their start position and start + (moveX, moveY)
    const platform = {
      tiles: tiles,
      startX: platformData.x,
      startY: platformData.y,
      dirX: maxOffset ? moveX / maxOffset : 0,
      dirY: maxOffset ? moveY / maxOffset : 0,
      maxOffset,
      speed: platformData.speed || 30,
      direction: 1,
    };

    this.movingPlatforms.push(platform);
  }

  setupInputHandlers() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.handlePause = () => this.pauseGame();
    this.input.keyboard.on('keydown-ESC', this.handlePause);
    this.input.keyboard.on('keydown-P', this.handlePause);
    this.setupFireInput();
    this.refreshKeyboardLayout();

    if (this.isTouchDevice) {
      this.setupTouchControls();
    }
  }

  refreshKeyboardLayout() {
    this.keyboardLayout = loadSettings().keyboardLayout;
    this.layoutKeys = this.input.keyboard.addKeys(getKeyboardLayoutBindings(this.keyboardLayout));

    if (this.touchHintText) {
      this.touchHintText.setText(`TOUCH: MOVE  JUMP  PAUSE  |  ${getKeyboardLayoutLabel(this.keyboardLayout)}`);
    }
  }

  setupTouchControls() {
    this.input.addPointer(2);

    this.createTouchButton(44, 146, 22, '<', pointerId => {
      this.touchControls.left = true;
      this.touchButtonReleases.push({ pointerId, key: 'left' });
    });

    this.createTouchButton(94, 146, 22, '>', pointerId => {
      this.touchControls.right = true;
      this.touchButtonReleases.push({ pointerId, key: 'right' });
    });

    this.createTouchButton(278, 146, 24, 'JUMP', pointerId => {
      this.touchControls.jump = true;
      this.player.jump();
      this.touchButtonReleases.push({ pointerId, key: 'jump' });
    }, '10px');

    // FIRE only exists while the player has fire power (see setFirePower)
    const fireButtonStart = this.touchButtons.length;
    this.createTouchButton(226, 152, 16, 'FIRE', () => {
      if (this.player.hasFire) {
        this.touchFireQueued = true;
      }
    }, '8px');
    this.fireButtonParts = this.touchButtons.slice(fireButtonStart);
    this.fireButtonParts.forEach(part => part.setVisible(this.player.hasFire));

    const pauseButton = this.add.rectangle(294, 30, 34, 18, 0x000000, 0.4);
    pauseButton.setScrollFactor(0);
    pauseButton.setDepth(120);
    pauseButton.setStrokeStyle(1, 0xffffff, 0.35);
    pauseButton.setInteractive();
    pauseButton.on('pointerdown', () => this.pauseGame());

    const pauseLabel = this.add.text(294, 30, 'PAUSE', {
      fontSize: '8px',
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
    });
    pauseLabel.setOrigin(0.5);
    pauseLabel.setScrollFactor(0);
    pauseLabel.setDepth(121);

    this.touchButtons.push(pauseButton, pauseLabel);

    this.handleTouchPointerUp = pointer => {
      this.touchButtonReleases = this.touchButtonReleases.filter(binding => {
        if (binding.pointerId === pointer.id) {
          this.touchControls[binding.key] = false;
          return false;
        }

        return true;
      });
    };

    this.input.on('pointerup', this.handleTouchPointerUp);
    this.input.on('pointerupoutside', this.handleTouchPointerUp);
  }

  createTouchButton(x, y, radius, label, onPress, fontSize = '14px') {
    const button = this.add.circle(x, y, radius, 0x000000, 0.35);
    button.setScrollFactor(0);
    button.setDepth(120);
    button.setStrokeStyle(2, 0xffffff, 0.35);
    button.setInteractive();
    button.on('pointerdown', pointer => onPress(pointer.id));

    const text = this.add.text(x, y, label, {
      fontSize,
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(121);

    this.touchButtons.push(button, text);
  }

  getPlayerInputState() {
    this.inputState.left.isDown = this.cursors.left.isDown || this.layoutKeys.left?.isDown || this.touchControls.left || this.gamepad.left;
    this.inputState.right.isDown = this.cursors.right.isDown || this.layoutKeys.right?.isDown || this.touchControls.right || this.gamepad.right;
    // Up also jumps (see shouldQueueJump), so it must count as "held" or the jump is cut immediately
    this.inputState.space.isDown = this.cursors.space.isDown || this.cursors.up.isDown ||
      this.layoutKeys.jump?.isDown || this.touchControls.jump || this.gamepad.jump;
    return this.inputState;
  }

  shouldQueueJump() {
    return Boolean(
      this.gamepad.jumpPressed ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      (this.layoutKeys.jump && Phaser.Input.Keyboard.JustDown(this.layoutKeys.jump))
    );
  }

  setupCollisions() {
    // Player collisions
    this.physics.add.collider(this.player.sprite, this.platforms);
    // The process callback runs before separation zeroes the velocity, so record the impact speed there
    this.physics.add.collider(this.player.sprite, this.breakablePlatforms,
      (player, tile) => this.hitBreakable(tile),
      player => {
        this.breakableImpactVelocityY = player.body.velocity.y;
        return true;
      });
    
    this.setupMovingPlatformCollisions();
    
    // Springs
    this.physics.add.overlap(this.player.sprite, this.springs, 
      (player, spring) => this.hitSpring(player, spring));
    
    // Coins
    this.physics.add.overlap(this.player.sprite, this.coins, 
      (player, coin) => this.collectCoin(coin));
    
    this.setupEnemyCollisions();
    this.physics.add.overlap(this.player.sprite, this.enemies.map(e => e.sprite), 
      (player, enemySprite) => this.hitEnemy(player, enemySprite));

    if (this.boss) {
      this.physics.add.collider(this.boss.sprite, this.platforms);
      this.physics.add.collider(this.boss.sprite, this.breakablePlatforms);
      this.physics.add.overlap(this.player.sprite, this.boss.sprite, 
        (player, bossSprite) => this.hitBoss(player, bossSprite));
    }
    
    // Power-ups
    this.physics.add.overlap(this.player.sprite, this.powerups, 
      (player, powerup) => this.collectPowerup(powerup));
    
    // Checkpoints
    this.physics.add.overlap(this.player.sprite, this.checkpoints, 
      (player, checkpoint) => this.activateCheckpoint(checkpoint));

    if (this.secretZones.length > 0) {
      this.secretZones.forEach(zone => {
        this.physics.add.overlap(this.player.sprite, zone, () => this.discoverSecret(zone));
      });
    }
    
    // Goal
    this.physics.add.overlap(this.player.sprite, this.goalFlag, 
      () => this.reachGoal());
  }

  setupMovingPlatformCollisions() {
    const tiles = this.movingPlatforms.flatMap(platform => platform.tiles);

    if (tiles.length === 0) {
      return;
    }

    // One-way: only collide when the player was above the platform top on the previous step.
    // Comparing positions (not velocity) keeps the player on platforms that are moving upward.
    this.physics.add.collider(this.player.sprite, tiles, null, (player, tile) =>
      player.body.prev.y + player.body.height <= tile.body.prev.y + 4
    );
  }

  setupEnemyCollisions() {
    this.enemies.forEach(enemy => {
      this.physics.add.collider(enemy.sprite, this.platforms);
      this.physics.add.collider(enemy.sprite, this.breakablePlatforms);
    });
  }

  hitBreakable(tile) {
    const body = this.player.sprite.body;
    // Break when bumped from below, or when landed on from a hard fall
    const bumpedFromBelow = body.touching.up && this.breakableImpactVelocityY < 0;
    const stompedFromAbove = body.touching.down && this.breakableImpactVelocityY > 200;

    if (bumpedFromBelow || stompedFromAbove) {
      this.audioManager.play('break');
      this.particles.createExplosion(tile.x + 8, tile.y + 8, 6);
      tile.disableBody(true, true);
    }
  }

  hitSpring(player, spring) {
    if (player.body.touching.down) {
      this.audioManager.play('spring');
      player.setVelocityY(-350);
      
      // Squash animation for spring
      this.tweens.add({
        targets: spring,
        scaleY: 0.5,
        duration: 100,
        yoyo: true
      });
    }
  }

  collectCoin(coin) {
    coin.destroy();
    this.score = addScore(10);
    this.levelCoins += 1;

    const result = addCoin();
    this.coinCount = result.coins;
    this.lives = result.lives;
    this.audioManager.play('coin');
    this.particles.createSparkles(coin.x, coin.y);

    if (result.oneUps > 0) {
      this.showOneUp();
    }

    this.updateUI();
  }

  showOneUp() {
    this.audioManager.play('powerup');
    this.particles.createHearts(this.player.x, this.player.y - 20);

    const pop = this.add.text(this.player.x, this.player.y - 24, '1UP', {
      fontSize: '10px',
      fill: '#66FF66',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
    });
    pop.setOrigin(0.5);
    pop.setDepth(110);

    this.tweens.add({
      targets: pop,
      y: pop.y - 18,
      alpha: 0,
      duration: 900,
      ease: 'Sine.easeOut',
      onComplete: () => pop.destroy(),
    });
  }

  hitEnemy(player, enemySprite) {
    if (this.levelComplete || this.gameOver || this.isRespawning) return;
    
    const enemy = this.enemies.find(e => e.sprite === enemySprite);
    if (!enemy || enemy.isDead) return;
    
    // Check if stomping
    if (this.player.isStomping() && player.y < enemySprite.y) {
      this.player.bounce();
      enemy.stomp();
      this.score = addScore(100);
      this.updateUI();
    } else if (this.player.invincible) {
      // Star power defeats enemies on contact
      this.defeatEnemy(enemy);
    } else if (this.player.canBeHurt()) {
      this.damagePlayer();
    }
  }

  hitBoss(player, bossSprite) {
    if (!this.boss || this.boss.isDefeated || this.levelComplete || this.gameOver || this.isRespawning) {
      return;
    }

    if (this.player.isStomping() && player.y < bossSprite.y - 2) {
      const damaged = this.boss.takeStomp();

      if (!damaged) {
        return;
      }

      this.player.bounce();
      this.score = addScore(this.boss.isDefeated ? 500 : 200);
      this.audioManager.play(this.boss.isDefeated ? 'complete' : 'enemy_hit');
      this.particles.createExplosion(bossSprite.x, bossSprite.y, this.boss.isDefeated ? 10 : 6);

      if (this.boss.isDefeated) {
        this.onBossDefeated();
      }

      this.updateUI();
      return;
    }

    if (this.player.invincible) {
      this.bossTakeHit();
      return;
    }

    if (this.player.canBeHurt()) {
      this.damagePlayer();
    }
  }

  setupFireballs() {
    this.fireballs = new FireballManager(this);
    this.fireballs.setupCollisions([this.platforms, this.breakablePlatforms]);

    // Overlap callbacks may swap argument order, so identify the fireball by flag
    const split = (a, b) => (a.isFireball ? [a, b] : [b, a]);

    this.physics.add.overlap(
      this.fireballs.group,
      this.enemies.map(e => e.sprite),
      (a, b) => {
        const [fireball, enemySprite] = split(a, b);
        this.fireballHitEnemy(fireball, enemySprite);
      },
      (a, b) => {
        const enemy = this.enemies.find(e => e.sprite === split(a, b)[1]);
        return Boolean(enemy) && !enemy.isDead;
      }
    );

    if (this.boss) {
      this.physics.add.overlap(
        this.fireballs.group,
        this.boss.sprite,
        (a, b) => {
          this.fireballs.destroyFireball(split(a, b)[0]);
          this.bossTakeHit();
        },
        () => !this.boss.isDefeated
      );
    }
  }

  setupFireInput() {
    // Fixed keys, independent of the arrows/WASD/ZQSD layout setting
    this.fireKeys = this.input.keyboard.addKeys({ x: 'X', f: 'F' });
  }

  shouldFire() {
    const queued = this.touchFireQueued;
    this.touchFireQueued = false;

    return Boolean(
      Phaser.Input.Keyboard.JustDown(this.fireKeys.x) ||
      Phaser.Input.Keyboard.JustDown(this.fireKeys.f) ||
      queued
    );
  }

  tryFireball() {
    if (!this.player.hasFire || this.isRespawning) return;

    const dir = this.player.facingRight ? 1 : -1;
    // Spawn from the hand; the body sits a couple of pixels below the sprite centre
    if (this.fireballs.fire(this.player.x + dir * 10, this.player.y + 2, this.player.facingRight)) {
      this.audioManager.play('fireball');
    }
  }

  setFirePower(active) {
    this.player.setFirePower(active);
    this.fireButtonParts.forEach(part => part.setVisible(active));

    if (!active) {
      this.touchFireQueued = false;
    }
  }

  defeatEnemy(enemy) {
    enemy.stomp();
    this.score = addScore(100);
    this.updateUI();
  }

  fireballHitEnemy(fireball, enemySprite) {
    const enemy = this.enemies.find(e => e.sprite === enemySprite);
    if (!enemy || enemy.isDead) return;

    this.fireballs.destroyFireball(fireball);
    this.defeatEnemy(enemy);
  }

  /**
   * One point of boss damage from a non-stomp source (fireball, star contact)
   */
  bossTakeHit() {
    if (!this.boss || this.boss.isDefeated || this.levelComplete || this.gameOver) {
      return false;
    }

    if (!this.boss.takeHit()) {
      return false;
    }

    this.score = addScore(this.boss.isDefeated ? 500 : 200);
    this.audioManager.play(this.boss.isDefeated ? 'complete' : 'enemy_hit');
    this.particles.createExplosion(this.boss.sprite.x, this.boss.sprite.y, this.boss.isDefeated ? 10 : 6);

    if (this.boss.isDefeated) {
      this.onBossDefeated();
    }

    this.updateUI();
    return true;
  }

  /**
   * Contact damage: fire power absorbs one hit, otherwise it costs a life
   */
  damagePlayer() {
    if (this.gameOver || this.levelComplete || this.isRespawning) return;

    if (this.player.hasFire) {
      this.setFirePower(false);
      this.audioManager.play('powerdown');
      this.particles.createFirePoof(this.player.x, this.player.y, 8);
      this.player.setHurtImmunity(1.5);
      return;
    }

    this.playerDeath();
  }

  onBossDefeated() {
    this.bossDefeated = true;
    this.goalLocked = false;
    this.goalFlag.setAlpha(1);
    this.showBossBanner('BOSS DEFEATED');
    this.endBossMusic();
  }

  resetBossEncounter() {
    if (!this.boss || this.bossDefeated) {
      return;
    }

    this.boss.reset();
    this.setBossMusic(false);
    this.goalLocked = true;
    this.goalFlag.setAlpha(0.35);
    this.updateUI();
  }

  collectPowerup(powerup) {
    const type = powerup.powerupType;
    powerup.destroy();
    
    this.audioManager.play('powerup');
    this.particles.createPowerUpEffect(powerup.x, powerup.y);
    
    switch(type) {
      case 'star':
        this.player.setInvincible(true, 5);
        break;
      case 'speed':
        this.player.setSpeedBoost(true, 5);
        break;
      case 'fire':
        this.setFirePower(true);
        break;
      case 'life':
        this.lives = addLife(1);
        this.particles.createHearts(this.player.x, this.player.y - 20);
        this.updateUI();
        break;
    }
  }

  activateCheckpoint(checkpoint) {
    if (checkpoint.activated) return;
    
    checkpoint.activated = true;
    checkpoint.setTexture('checkpoint_active');
    this.checkpointPos = { x: checkpoint.x + 8, y: checkpoint.y - checkpoint.height };
    
    this.audioManager.play('checkpoint');
    this.particles.createSparkles(checkpoint.x + 8, checkpoint.y);
  }

  discoverSecret(secretZone) {
    if (this.discoveredSecrets.has(secretZone.secretId)) {
      return;
    }

    this.discoveredSecrets.add(secretZone.secretId);
    this.score = addScore(150);
    this.audioManager.play('checkpoint');
    this.particles.createSparkles(secretZone.x + secretZone.width / 2, secretZone.y + secretZone.height / 2);
    this.showBossBanner(`SECRET FOUND: ${secretZone.secretLabel}`);
    this.updateUI();
  }

  reachGoal() {
    if (this.levelComplete) return;

    if (this.goalLocked) {
      this.showBossBanner('DEFEAT THE GUARDIAN');
      return;
    }
    
    this.levelComplete = true;
    this.audioManager.stopMusic();
    this.audioManager.play('complete');

    if (hasNextLevel()) {
      this.showLevelComplete();
      return;
    }

    this.showCampaignComplete();
  }

  playerDeath() {
    // Overlap callbacks fire every frame, so guard against losing several lives to one hit
    if (this.gameOver || this.levelComplete || this.isRespawning) return;

    this.lives = loseLife(1);
    this.levelDeaths += 1;
    addDeath();
    this.audioManager.play('death');
    this.particles.createExplosion(this.player.x, this.player.y);

    if (this.lives <= 0) {
      this.gameOver = true;
      this.audioManager.stopMusic();
      this.showGameOver();
    } else {
      // Respawn at checkpoint or start
      const respawnPos = this.checkpointPos || this.levelData.playerStart;
      this.isRespawning = true;
      this.player.sprite.setVelocity(0, 0);
      this.player.sprite.body.moves = false;
      this.player.sprite.setVisible(false);
      this.resetBossEncounter();
      this.cameras.main.shake(200, 0.01);
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.player.sprite.setPosition(respawnPos.x, respawnPos.y);
        this.player.sprite.setVelocity(0, 0);
        this.player.sprite.body.moves = true;
        this.player.sprite.setVisible(true);
        this.player.setHurtImmunity(1.5);
        this.isRespawning = false;
        this.cameras.main.fadeIn(300);
      });
    }
    
    this.updateUI();
  }

  createUI() {
    const uiContainer = this.add.container(0, 0);
    uiContainer.setScrollFactor(0);
    uiContainer.setDepth(100);
    
    // Score
    this.scoreText = this.add.text(10, 8, `SCORE: ${this.score}`, {
      fontSize: '10px',
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(100);

    this.levelText = this.add.text(160, 8, `LEVEL ${this.levelIndex + 1}/${this.totalLevels}`, {
      fontSize: '10px',
      fill: '#FFD700',
      fontFamily: '"Courier New", monospace',
    });
    this.levelText.setOrigin(0.5, 0);
    this.levelText.setScrollFactor(0);
    this.levelText.setDepth(100);

    if (this.boss) {
      this.bossText = this.add.text(160, 22, `BOSS: ${this.boss.health}`, {
        fontSize: '10px',
        fill: '#FFAA66',
        fontFamily: '"Courier New", monospace',
      });
      this.bossText.setOrigin(0.5, 0);
      this.bossText.setScrollFactor(0);
      this.bossText.setDepth(100);
    }

    if (this.isTouchDevice) {
      // Bottom centre, clear of the top-row HUD and the boss banner
      this.touchHintText = this.add.text(160, 168, 'TOUCH: MOVE  JUMP  PAUSE', {
        fontSize: '8px',
        fill: '#88CCFF',
        fontFamily: '"Courier New", monospace',
      });
      this.touchHintText.setOrigin(0.5, 0);
      this.touchHintText.setScrollFactor(0);
      this.touchHintText.setDepth(100);
    }
    
    // Top row, left to right: score | level | coins | lives (nothing shares an x-range)
    this.coinIcon = this.add.image(204, 13, 'ui_coin');
    this.coinIcon.setScrollFactor(0);
    this.coinIcon.setDepth(100);

    this.coinText = this.add.text(211, 8, `x${this.coinCount}`, {
      fontSize: '10px',
      fill: '#FFD700',
      fontFamily: '"Courier New", monospace',
    });
    this.coinText.setScrollFactor(0);
    this.coinText.setDepth(100);

    // Lives (heart icons)
    this.livesContainer = this.add.container(0, 0);
    this.livesContainer.setScrollFactor(0);
    this.livesContainer.setDepth(100);
    this.renderedLives = null;
    this.updateLivesUI();

    // Pause hint, under the lives. Touch devices have the PAUSE button instead.
    if (!this.isTouchDevice) {
      const pauseText = this.add.text(314, 20, 'ESC: PAUSE', {
        fontSize: '8px',
        fill: '#888888',
        fontFamily: '"Courier New", monospace',
      });
      pauseText.setOrigin(1, 0);
      pauseText.setScrollFactor(0);
      pauseText.setDepth(100);
    }
  }

  updateLivesUI() {
    // Rebuilding on every coin or score change is wasteful, so only redraw when lives changed
    if (this.renderedLives === this.lives) {
      return;
    }

    this.renderedLives = this.lives;
    this.livesContainer.removeAll(true);

    // Up to 3 hearts, beyond that one heart and a count so it never runs off-screen
    const showCount = this.lives > 3;
    const heartCount = showCount ? 1 : this.lives;

    for (let i = 0; i < heartCount; i++) {
      const heart = this.add.image(274 + i * 12, 13, 'ui_heart');
      heart.setScrollFactor(0);
      this.livesContainer.add(heart);
    }

    if (showCount) {
      const count = this.add.text(281, 8, `x${this.lives}`, {
        fontSize: '10px',
        fill: '#FFFFFF',
        fontFamily: '"Courier New", monospace',
      });
      count.setScrollFactor(0);
      this.livesContainer.add(count);
    }
  }

  updateUI() {
    this.scoreText.setText(`SCORE: ${this.score}`);
    this.coinText.setText(`x${this.coinCount}`);

    if (this.bossText) {
      this.bossText.setText(this.bossDefeated ? 'BOSS: DOWN' : `BOSS: ${this.boss.health}`);
    }

    this.updateLivesUI();
  }

  showBossBanner(label) {
    if (this.bossBannerTimer) {
      this.bossBannerTimer.remove(false);
    }

    this.bossBanner?.destroy();
    this.bossBanner = this.add.text(160, 38, label, {
      fontSize: '10px',
      fill: '#FFAA66',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
    });
    this.bossBanner.setOrigin(0.5, 0);
    this.bossBanner.setScrollFactor(0);
    this.bossBanner.setDepth(110);

    this.bossBannerTimer = this.time.delayedCall(1200, () => {
      this.bossBanner?.destroy();
      this.bossBanner = null;
      this.bossBannerTimer = null;
    });
  }

  registerSceneCleanup() {
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-ESC', this.handlePause);
      this.input.keyboard.off('keydown-P', this.handlePause);
      this.events.off('resume', this.refreshKeyboardLayout, this);
      this.input.off('pointerup', this.handleTouchPointerUp);
      this.input.off('pointerupoutside', this.handleTouchPointerUp);
      this.bossBannerTimer?.remove(false);
      this.fireballs?.clear();
      if (this.fireKeys) {
        this.input.keyboard.removeKey(this.fireKeys.x);
        this.input.keyboard.removeKey(this.fireKeys.f);
      }
      this.touchButtons.forEach(button => button.destroy());
      this.particles?.clear();
    });
  }

  setupMusic() {
    this.bossMusicActive = false;
    this.audioManager.playMusic('level', { level: this.levelIndex });

    // Keep the loop running under the pause/settings overlays, just quieter.
    const duck = () => this.audioManager.setMusicDucked(true);
    const unduck = () => this.audioManager.setMusicDucked(false);
    this.events.on('pause', duck);
    this.events.on('resume', unduck);
    this.events.once('shutdown', () => {
      this.events.off('pause', duck);
      this.events.off('resume', unduck);
      unduck();
    });
  }

  setBossMusic(active) {
    if (this.bossMusicActive === active) return;

    this.bossMusicActive = active;
    if (active) {
      this.audioManager.playMusic('boss');
    } else {
      this.audioManager.playMusic('level', { level: this.levelIndex });
    }
  }

  updateBossMusic() {
    if (!this.boss || this.bossDefeated) return;

    // Different enter/exit distances so hovering at the edge doesn't flip tracks.
    const distance = Math.abs(this.player.sprite.x - this.boss.sprite.x);
    if (distance < 200) {
      this.setBossMusic(true);
    } else if (distance > 320) {
      this.setBossMusic(false);
    }
  }

  endBossMusic() {
    this.bossMusicActive = false;
    this.audioManager.stopMusic();

    // Let the victory sound play on its own, then bring the level theme back.
    this.time.delayedCall(2000, () => {
      if (!this.levelComplete && !this.gameOver) {
        this.audioManager.playMusic('level', { level: this.levelIndex });
      }
    });
  }

  pauseGame() {
    if (this.levelComplete || this.gameOver || this.scene.isPaused() || this.isTransitioning) {
      return;
    }

    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  getLevelStats() {
    const stats = {
      coins: this.levelCoins,
      totalCoins: this.levelData.coins.length,
      secrets: this.discoveredSecrets.size,
      totalSecrets: this.levelData.secrets ? this.levelData.secrets.length : 0,
      deaths: this.levelDeaths,
      time: this.levelTime,
      parTime: getParTime(this.levelData),
    };

    return { ...stats, rank: computeRank(stats) };
  }

  showLevelComplete() {
    this.isTransitioning = true;
    const stats = this.getLevelStats();
    recordLevelResult(stats);

    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('LevelSummaryScene', {
        levelIndex: this.levelIndex,
        score: this.score,
        lives: this.lives,
        coinCount: this.coinCount,
        stats,
      });
    });
  }

  showCampaignComplete() {
    this.isTransitioning = true;
    recordLevelResult(this.getLevelStats());
    // Snapshot the run totals before abandonRun() resets them
    const run = getRunState();
    abandonRun();

    const rank = computeRank({
      coins: run.coins,
      totalCoins: run.coinsPossible,
      secrets: run.secretsFound,
      totalSecrets: run.secretsPossible,
      deaths: run.deaths,
      time: run.playTime,
      parTime: run.parTime,
    });

    const overlay = this.add.rectangle(160, 90, 320, 180, 0x000000, 0.8);
    overlay.setScrollFactor(0);
    overlay.setDepth(200);

    const title = this.add.text(160, 30, 'CAMPAIGN COMPLETE!', {
      fontSize: '18px',
      fill: '#FFD700',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(201);

    const summary = this.add.text(160, 58, `FINAL SCORE: ${this.score}`, {
      fontSize: '12px',
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
    });
    summary.setOrigin(0.5);
    summary.setScrollFactor(0);
    summary.setDepth(201);

    const lines = [
      `LEVELS CLEARED: ${this.totalLevels}`,
      `COINS: ${run.coins}   DEATHS: ${run.deaths}`,
      `TOTAL TIME: ${formatTime(run.playTime)}`,
    ];

    lines.forEach((line, i) => {
      const text = this.add.text(160, 80 + i * 13, line, {
        fontSize: '10px',
        fill: '#AAAAAA',
        fontFamily: '"Courier New", monospace',
      });
      text.setOrigin(0.5);
      text.setScrollFactor(0);
      text.setDepth(201);
    });

    const rankLabel = this.add.text(160, 130, `RANK: ${rank}`, {
      fontSize: '16px',
      fill: RANK_COLORS[rank],
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
    });
    rankLabel.setOrigin(0.5);
    rankLabel.setScrollFactor(0);
    rankLabel.setDepth(201);

    const prompt = this.add.text(160, 158, 'ENTER / TAP for Menu', {
      fontSize: '10px',
      fill: '#AAAAAA',
      fontFamily: '"Courier New", monospace',
    });
    prompt.setOrigin(0.5);
    prompt.setScrollFactor(0);
    prompt.setDepth(201);

    this.onConfirm(() => this.scene.start('MenuScene'));
  }

  /**
   * Run `callback` once on ENTER or a tap. Returns the guarded trigger so it can also be fired by a timer.
   */
  onConfirm(callback) {
    let done = false;
    const confirm = () => {
      if (done) return;
      done = true;
      callback();
    };

    this.input.keyboard.once('keydown-ENTER', confirm);
    this.input.once('pointerdown', confirm);
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-ENTER', confirm);
      this.input.off('pointerdown', confirm);
    });
    // Pad confirm shares the same guard, so it can't double-fire with ENTER, a tap or the timer
    this.gamepad.handlers.confirm = confirm;

    return confirm;
  }

  showGameOver() {
    this.isTransitioning = true;
    abandonRun();

    const overlay = this.add.rectangle(160, 90, 320, 180, 0x000000, 0.8);
    overlay.setScrollFactor(0);
    overlay.setDepth(200);
    
    const title = this.add.text(160, 80, 'GAME OVER', {
      fontSize: '24px',
      fill: '#FF0000',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(201);

    // Advance automatically so touch players are never stuck; ENTER or a tap skips the wait
    const showGameOverScreen = this.onConfirm(() => {
      this.scene.start('GameOverScene', { score: this.score });
    });
    this.time.delayedCall(1500, showGameOverScreen);
  }

  updateMovingPlatforms() {
    for (let i = 0; i < this.movingPlatforms.length; i++) {
      const platform = this.movingPlatforms[i];

      if (!platform.maxOffset) {
        continue;
      }

      // Distance travelled along the movement axis, measured from the lead tile
      const lead = platform.tiles[0];
      const offset = (lead.x - platform.startX) * platform.dirX + (lead.y - platform.startY) * platform.dirY;

      if (offset >= platform.maxOffset) {
        platform.direction = -1;
      } else if (offset <= 0) {
        platform.direction = 1;
      }

      // Velocity-driven so physics can carry the rider
      const vx = platform.dirX * platform.speed * platform.direction;
      const vy = platform.dirY * platform.speed * platform.direction;

      for (let tileIndex = 0; tileIndex < platform.tiles.length; tileIndex++) {
        platform.tiles[tileIndex].body.setVelocity(vx, vy);
      }
    }
  }

  update(time, delta) {
    const dt = delta / 1000;
    
    if (this.levelComplete || this.gameOver) return;

    // Clamp so a tab switch does not inflate the level time
    this.levelTime += Math.min(dt, 0.1);

    if (!this.isRespawning) {
      if (this.shouldQueueJump()) {
        this.player.jump();
      }

      // Update player
      this.player.update(this.getPlayerInputState(), dt);

    if (this.shouldFire()) {
      this.tryFireball();
    }
    this.fireballs.update(dt);
    }
    
    // Update enemies
    this.enemies.forEach(enemy => enemy.update(dt));

    if (this.boss) {
      this.boss.update(dt, this.player.sprite);
      this.updateBossMusic();
    }
    
    // Update particles
    this.particles.update(dt);
    
    // Update moving platforms
    this.updateMovingPlatforms();
    
    // Update parallax
    const scrollX = this.cameras.main.scrollX;
    this.bgMountains.tilePositionX = scrollX * 0.1;
    this.bgClouds.tilePositionX = scrollX * 0.3 + time / 50;
    this.bgTrees.tilePositionX = scrollX * 0.5;
    
    // Fall check
     if (this.player.y > this.levelData.height + 50) {
       this.playerDeath();
     }
    
    // Invincibility star trail
    if (this.player.invincible && time % 100 < 16) {
      this.particles.createStarTrail(this.player.x, this.player.y);
    }
  }
}

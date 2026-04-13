import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Boss from '../entities/Boss.js';
import ParticleSystem from '../utils/ParticleSystem.js';
import AudioManager from '../utils/AudioManager.js';
import { getLevelCount, getLevelData } from '../data/levelData.js';
import { getKeyboardLayoutBindings, getKeyboardLayoutLabel } from '../utils/inputConfig.js';
import { loadSettings } from '../utils/storage.js';
import {
  abandonRun,
  addLife,
  addScore,
  ensureRunStarted,
  hasNextLevel,
  loseLife,
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
    this.checkpointPos = null;
    this.enemies = [];
    this.movingPlatforms = [];
    this.secretZones = [];
    this.discoveredSecrets = new Set();
    this.boss = null;
    this.bossDefeated = false;
    this.goalLocked = false;
    this.touchControls = { left: false, right: false, jump: false };
    this.touchButtons = [];
    this.touchButtonReleases = [];
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
    this.particles = new ParticleSystem(this);
    this.isTouchDevice = this.sys.game.device.input.touch;

    this.registerSceneCleanup();
    
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
      const c = this.checkpoints.create(checkpoint.x, checkpoint.y, 'checkpoint');
      c.setOrigin(0);
      c.refreshBody();
      c.activated = false;
    });
    
    // Create goal
    this.goalFlag = this.physics.add.staticSprite(this.levelData.goal.x, this.levelData.goal.y, 'flag');
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
    this.coins = this.physics.add.group();

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
    this.powerups = this.physics.add.group();

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
      tile.body.allowGravity = false;
      tiles.push(tile);
    }
    
    const platform = {
      tiles: tiles,
      startX: platformData.x,
      startY: platformData.y,
      moveX: platformData.moveX || 0,
      moveY: platformData.moveY || 0,
      maxOffset: Math.sqrt((platformData.moveX || 0) ** 2 + (platformData.moveY || 0) ** 2),
      speed: platformData.speed || 30,
      direction: 1,
      offset: 0
    };
    
    this.movingPlatforms.push(platform);
  }

  setupInputHandlers() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.handlePause = () => this.pauseGame();
    this.input.keyboard.on('keydown-ESC', this.handlePause);
    this.input.keyboard.on('keydown-P', this.handlePause);
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
    this.inputState.left.isDown = this.cursors.left.isDown || this.layoutKeys.left?.isDown || this.touchControls.left;
    this.inputState.right.isDown = this.cursors.right.isDown || this.layoutKeys.right?.isDown || this.touchControls.right;
    this.inputState.space.isDown = this.cursors.space.isDown || this.layoutKeys.jump?.isDown || this.touchControls.jump;
    return this.inputState;
  }

  shouldQueueJump() {
    return Boolean(
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      (this.layoutKeys.jump && Phaser.Input.Keyboard.JustDown(this.layoutKeys.jump))
    );
  }

  setupCollisions() {
    // Player collisions
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.physics.add.collider(this.player.sprite, this.breakablePlatforms, 
      (player, tile) => this.hitBreakable(tile));
    
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
    this.movingPlatforms.forEach(platform => {
      platform.tiles.forEach(tile => {
        this.physics.add.collider(
          this.player.sprite,
          tile,
          null,
          () => this.player.sprite.body.velocity.y >= 0
        );
      });
    });
  }

  setupEnemyCollisions() {
    this.enemies.forEach(enemy => {
      this.physics.add.collider(enemy.sprite, this.platforms);
      this.physics.add.collider(enemy.sprite, this.breakablePlatforms);
    });
  }

  hitBreakable(tile) {
    // Only break if hitting from above with enough force
    if (this.player.sprite.body.touching.down && this.player.sprite.body.velocity.y > 50) {
      this.audioManager.play('break');
      this.particles.createExplosion(tile.x + 8, tile.y + 8, 6);
      tile.destroy();
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
    this.audioManager.play('coin');
    this.particles.createSparkles(coin.x, coin.y);
    this.updateUI();
  }

  hitEnemy(player, enemySprite) {
    if (this.levelComplete || this.gameOver) return;
    
    const enemy = this.enemies.find(e => e.sprite === enemySprite);
    if (!enemy || enemy.isDead) return;
    
    // Check if stomping
    if (this.player.isStomping() && player.y < enemySprite.y) {
      this.player.bounce();
      enemy.stomp();
      this.score = addScore(100);
      this.updateUI();
    } else if (!this.player.invincible) {
      this.playerDeath();
    }
  }

  hitBoss(player, bossSprite) {
    if (!this.boss || this.boss.isDefeated || this.levelComplete || this.gameOver) {
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

    if (!this.player.invincible) {
      this.playerDeath();
    }
  }

  onBossDefeated() {
    this.bossDefeated = true;
    this.goalLocked = false;
    this.goalFlag.setAlpha(1);
    this.showBossBanner('BOSS DEFEATED');
  }

  resetBossEncounter() {
    if (!this.boss || this.bossDefeated) {
      return;
    }

    this.boss.reset();
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
    this.checkpointPos = { x: checkpoint.x + 8, y: checkpoint.y - 10 };
    
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
    this.audioManager.play('complete');

    if (hasNextLevel()) {
      this.showLevelComplete();
      return;
    }

    this.showCampaignComplete();
  }

  playerDeath() {
    if (this.gameOver || this.levelComplete) return;
    
    this.lives = loseLife(1);
    this.audioManager.play('death');
    this.particles.createExplosion(this.player.x, this.player.y);
    
    if (this.lives <= 0) {
      this.gameOver = true;
      this.showGameOver();
    } else {
      // Respawn at checkpoint or start
      const respawnPos = this.checkpointPos || this.levelData.playerStart;
      this.resetBossEncounter();
      this.cameras.main.shake(200, 0.01);
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.player.sprite.setPosition(respawnPos.x, respawnPos.y);
        this.player.sprite.setVelocity(0, 0);
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
      this.touchHintText = this.add.text(160, 34, 'TOUCH: MOVE  JUMP  PAUSE', {
        fontSize: '8px',
        fill: '#88CCFF',
        fontFamily: '"Courier New", monospace',
      });
      this.touchHintText.setOrigin(0.5, 0);
      this.touchHintText.setScrollFactor(0);
      this.touchHintText.setDepth(100);
    }
    
    // Lives (heart icons)
    this.livesContainer = this.add.container(0, 0);
    this.livesContainer.setScrollFactor(0);
    this.livesContainer.setDepth(100);
    this.updateLivesUI();
    
    // Pause hint
    const pauseText = this.add.text(310, 8, 'ESC', {
      fontSize: '8px',
      fill: '#888888',
      fontFamily: '"Courier New", monospace',
    });
    pauseText.setOrigin(1, 0);
    pauseText.setScrollFactor(0);
    pauseText.setDepth(100);
  }

  updateLivesUI() {
    this.livesContainer.removeAll(true);
    
    for (let i = 0; i < this.lives; i++) {
      const heart = this.add.image(270 + i * 12, 12, 'ui_heart');
      heart.setScrollFactor(0);
      this.livesContainer.add(heart);
    }
  }

  updateUI() {
    this.scoreText.setText(`SCORE: ${this.score}`);

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
      this.touchButtons.forEach(button => button.destroy());
      this.particles?.clear();
    });
  }

  pauseGame() {
    if (this.levelComplete || this.gameOver || this.scene.isPaused() || this.isTransitioning) {
      return;
    }

    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  showLevelComplete() {
    this.isTransitioning = true;
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('LevelSummaryScene', {
        levelIndex: this.levelIndex,
        score: this.score,
        lives: this.lives,
      });
    });
  }

  showCampaignComplete() {
    this.isTransitioning = true;
    abandonRun();

    const overlay = this.add.rectangle(160, 90, 320, 180, 0x000000, 0.8);
    overlay.setScrollFactor(0);
    overlay.setDepth(200);

    const title = this.add.text(160, 60, 'CAMPAIGN COMPLETE!', {
      fontSize: '18px',
      fill: '#FFD700',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(201);

    const summary = this.add.text(160, 88, `FINAL SCORE: ${this.score}`, {
      fontSize: '12px',
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
    });
    summary.setOrigin(0.5);
    summary.setScrollFactor(0);
    summary.setDepth(201);

    const levelsCleared = this.add.text(160, 108, `LEVELS CLEARED: ${this.totalLevels}`, {
      fontSize: '10px',
      fill: '#AAAAAA',
      fontFamily: '"Courier New", monospace',
    });
    levelsCleared.setOrigin(0.5);
    levelsCleared.setScrollFactor(0);
    levelsCleared.setDepth(201);

    const prompt = this.add.text(160, 132, 'Press ENTER for Menu', {
      fontSize: '10px',
      fill: '#AAAAAA',
      fontFamily: '"Courier New", monospace',
    });
    prompt.setOrigin(0.5);
    prompt.setScrollFactor(0);
    prompt.setDepth(201);

    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('MenuScene');
    });
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
    
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('GameOverScene', { score: this.score });
    });
  }

  updateMovingPlatforms(dt) {
    for (let i = 0; i < this.movingPlatforms.length; i++) {
      const platform = this.movingPlatforms[i];
      const maxOffset = platform.maxOffset;

      if (!maxOffset) {
        continue;
      }

      platform.offset += platform.speed * platform.direction * dt;

      if (Math.abs(platform.offset) > maxOffset) {
        platform.direction *= -1;
        platform.offset = Math.sign(platform.offset) * maxOffset;
      }

      const ratio = platform.offset / maxOffset || 0;
      const moveX = platform.moveX * ratio;
      const moveY = platform.moveY * ratio;

      for (let tileIndex = 0; tileIndex < platform.tiles.length; tileIndex++) {
        const tile = platform.tiles[tileIndex];
        tile.x = platform.startX + tileIndex * 16 + moveX;
        tile.y = platform.startY + moveY;
        tile.body.updateFromGameObject();
      }
    }
  }

  update(time, delta) {
    const dt = delta / 1000;
    
    if (this.levelComplete || this.gameOver) return;

    if (this.shouldQueueJump()) {
      this.player.jump();
    }
    
    // Update player
    this.player.update(this.getPlayerInputState(), dt);
    
    // Update enemies
    this.enemies.forEach(enemy => enemy.update(dt));

    if (this.boss) {
      this.boss.update(dt, this.player.sprite);
    }
    
    // Update particles
    this.particles.update(dt);
    
    // Update moving platforms
    this.updateMovingPlatforms(dt);
    
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

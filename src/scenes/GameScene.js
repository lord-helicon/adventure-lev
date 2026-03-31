import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import ParticleSystem from '../utils/ParticleSystem.js';
import AudioManager from '../utils/AudioManager.js';
import { levelData } from '../data/levelData.js';

/**
 * Enhanced Game Scene with improved gameplay
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    this.score = 0;
    this.lives = 3;
    this.levelComplete = false;
    this.gameOver = false;
    this.checkpointPos = null;
    this.enemies = [];
    this.movingPlatforms = [];
  }

  create() {
    // Initialize systems
    this.audioManager = new AudioManager(this);
    this.audioManager.resume();
    this.particles = new ParticleSystem(this);
    
    // Set world bounds
    this.physics.world.setBounds(0, 0, levelData.width, levelData.height);
    
    // Create parallax background
    this.createParallaxBackground();
    
    // Create level
    this.createLevel();
    
    // Create player
    this.player = new Player(this, levelData.playerStart.x, levelData.playerStart.y);
    
    // Set up camera
    this.cameras.main.setBounds(0, 0, levelData.width, levelData.height);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(40, 20);
    
    // Set up collisions
    this.setupCollisions();
    
    // Input handling
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', () => this.player.jump());
    this.input.keyboard.on('keydown-ESC', () => this.pauseGame());
    this.input.keyboard.on('keydown-P', () => this.pauseGame());
    
    // Create UI
    this.createUI();
    
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
    levelData.platforms.forEach(platform => {
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
    
    // Create coins with animation
    this.coins = this.physics.add.group();
    this.anims.create({
      key: 'coin_spin',
      frames: Array.from({ length: 8 }, (_, i) => ({ key: `coin_${i}` })),
      frameRate: 10,
      repeat: -1
    });
    
    levelData.coins.forEach(coin => {
      const c = this.coins.create(coin.x, coin.y, 'coin_0');
      c.anims.play('coin_spin');
      c.setBodySize(8, 10);
    });
    
    // Create enemies
    levelData.enemies.forEach(enemy => {
      const e = new Enemy(this, enemy.x, enemy.y, enemy.type);
      e.patrolDistance = enemy.patrolDistance;
      this.enemies.push(e);
    });
    
    // Create springs
    this.springs = this.physics.add.staticGroup();
    levelData.springs.forEach(spring => {
      const s = this.springs.create(spring.x, spring.y, 'spring');
      s.setOrigin(0);
      s.refreshBody();
      s.body.setSize(16, 8);
    });
    
    // Create power-ups
    this.powerups = this.physics.add.group();
    levelData.powerups.forEach(powerup => {
      const p = this.powerups.create(powerup.x, powerup.y, `powerup_${powerup.type}`);
      p.setBodySize(12, 12);
      p.powerupType = powerup.type;
    });
    
    // Animate power-ups
    this.tweens.add({
      targets: this.powerups.getChildren(),
      y: '+=4',
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Create checkpoints
    this.checkpoints = this.physics.add.staticGroup();
    levelData.checkpoints.forEach(checkpoint => {
      const c = this.checkpoints.create(checkpoint.x, checkpoint.y, 'checkpoint');
      c.setOrigin(0);
      c.refreshBody();
      c.activated = false;
    });
    
    // Create goal
    this.goalFlag = this.physics.add.staticSprite(levelData.goal.x, levelData.goal.y, 'flag');
    this.goalFlag.body.setSize(8, 32);
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
      speed: platformData.speed || 30,
      direction: 1,
      offset: 0
    };
    
    this.movingPlatforms.push(platform);
  }

  setupCollisions() {
    // Player collisions
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.physics.add.collider(this.player.sprite, this.breakablePlatforms, 
      (player, tile) => this.hitBreakable(tile));
    
    // Moving platform collisions
    this.movingPlatforms.forEach(platform => {
      platform.tiles.forEach(tile => {
        this.physics.add.collider(this.player.sprite, tile, null, 
          () => this.player.sprite.body.velocity.y >= 0);
      });
    });
    
    // Springs
    this.physics.add.overlap(this.player.sprite, this.springs, 
      (player, spring) => this.hitSpring(player, spring));
    
    // Coins
    this.physics.add.overlap(this.player.sprite, this.coins, 
      (player, coin) => this.collectCoin(coin));
    
    // Enemies - collide with platforms and player
    this.enemies.forEach(enemy => {
      this.physics.add.collider(enemy.sprite, this.platforms);
      this.physics.add.collider(enemy.sprite, this.breakablePlatforms);
    });
    this.physics.add.overlap(this.player.sprite, this.enemies.map(e => e.sprite), 
      (player, enemySprite) => this.hitEnemy(player, enemySprite));
    
    // Power-ups
    this.physics.add.overlap(this.player.sprite, this.powerups, 
      (player, powerup) => this.collectPowerup(powerup));
    
    // Checkpoints
    this.physics.add.overlap(this.player.sprite, this.checkpoints, 
      (player, checkpoint) => this.activateCheckpoint(checkpoint));
    
    // Goal
    this.physics.add.overlap(this.player.sprite, this.goalFlag, 
      () => this.reachGoal());
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
    this.score += 10;
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
      this.score += 100;
      this.updateUI();
    } else if (!this.player.invincible) {
      this.playerDeath();
    }
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
        this.lives++;
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

  reachGoal() {
    if (this.levelComplete) return;
    
    this.levelComplete = true;
    this.audioManager.play('complete');
    this.showLevelComplete();
  }

  playerDeath() {
    if (this.gameOver || this.levelComplete) return;
    
    this.lives--;
    this.audioManager.play('death');
    this.particles.createExplosion(this.player.x, this.player.y);
    
    if (this.lives <= 0) {
      this.gameOver = true;
      this.showGameOver();
    } else {
      // Respawn at checkpoint or start
      const respawnPos = this.checkpointPos || levelData.playerStart;
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
    this.scoreText = this.add.text(10, 8, 'SCORE: 0', {
      fontSize: '10px',
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(100);
    
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
    this.updateLivesUI();
  }

  pauseGame() {
    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  showLevelComplete() {
    const overlay = this.add.rectangle(160, 90, 320, 180, 0x000000, 0.7);
    overlay.setScrollFactor(0);
    overlay.setDepth(200);
    
    const title = this.add.text(160, 70, 'LEVEL COMPLETE!', {
      fontSize: '20px',
      fill: '#FFD700',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(201);
    
    const score = this.add.text(160, 95, `SCORE: ${this.score}`, {
      fontSize: '12px',
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
    });
    score.setOrigin(0.5);
    score.setScrollFactor(0);
    score.setDepth(201);
    
    const restart = this.add.text(160, 120, 'Press ENTER to Restart', {
      fontSize: '10px',
      fill: '#AAAAAA',
      fontFamily: '"Courier New", monospace',
    });
    restart.setOrigin(0.5);
    restart.setScrollFactor(0);
    restart.setDepth(201);
    
    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.restart();
    });
  }

  showGameOver() {
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
    
    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('GameOverScene', { score: this.score });
    });
  }

  update(time, delta) {
    const dt = delta / 1000;
    
    if (this.levelComplete || this.gameOver) return;
    
    // Update player
    this.player.update(this.cursors, dt);
    
    // Update enemies
    this.enemies.forEach(enemy => enemy.update(dt));
    
    // Update particles
    this.particles.update(dt);
    
    // Update moving platforms
    this.movingPlatforms.forEach(platform => {
      const maxOffset = Math.sqrt(platform.moveX ** 2 + platform.moveY ** 2);
      platform.offset += platform.speed * platform.direction * dt;
      
      if (Math.abs(platform.offset) > maxOffset) {
        platform.direction *= -1;
        platform.offset = Math.sign(platform.offset) * maxOffset;
      }
      
      const ratio = platform.offset / maxOffset || 0;
      const moveX = platform.moveX * ratio;
      const moveY = platform.moveY * ratio;
      
      platform.tiles.forEach((tile, i) => {
        tile.x = platform.startX + i * 16 + moveX;
        tile.y = platform.startY + moveY;
        tile.body.updateFromGameObject();
      });
    });
    
    // Update parallax
    const scrollX = this.cameras.main.scrollX;
    this.bgMountains.tilePositionX = scrollX * 0.1;
    this.bgClouds.tilePositionX = scrollX * 0.3 + time / 50;
    this.bgTrees.tilePositionX = scrollX * 0.5;
    
    // Fall check
    if (this.player.y > levelData.height + 50) {
      this.playerDeath();
    }
    
    // Invincibility star trail
    if (this.player.invincible && time % 100 < 16) {
      this.particles.createStarTrail(this.player.x, this.player.y);
    }
  }
}

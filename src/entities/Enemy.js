import Phaser from 'phaser';

/**
 * Enemy class with multiple types and behaviors
 */
export default class Enemy {
  constructor(scene, x, y, type = 'ground') {
    this.scene = scene;
    this.type = type;
    this.isDead = false;
    this.jumpTimer = 0.9;
    this.diveState = 'patrol';
    this.diveTarget = { x, y };
    
    // Create sprite based on type
    const textureKey = this.getTextureKey();
    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(4);
    
    if (type === 'ground') {
      this.sprite.setBodySize(14, 12);
      this.sprite.setOffset(1, 4);
      this.sprite.setBounce(0);
    } else if (type === 'hopper') {
      this.sprite.setBodySize(14, 14);
      this.sprite.setOffset(1, 2);
      this.sprite.setBounce(0);
    } else if (type === 'swooper') {
      this.sprite.setBodySize(12, 10);
      this.sprite.setOffset(2, 3);
    } else {
      this.sprite.setBodySize(12, 10);
      this.sprite.setOffset(2, 3);
    }
    
    // Disable gravity for flying enemies
    if (type === 'flying' || type === 'swooper') {
      this.sprite.body.allowGravity = false;
    }
    
    // Movement properties
    this.patrolStartX = x;
    this.baseY = y;
    this.patrolDistance = 60;
    this.patrolSpeed = type === 'hopper' ? 30 : type === 'swooper' ? 32 : 40;
    this.facingRight = false;
    
    // Animation
    this.animTimer = 0;
    this.currentFrame = 0;
    
    // Create animations
    this.createAnimations();
    
    // Start patrolling
    this.startPatrol();
  }

  getTextureKey() {
    if (this.type === 'flying') {
      return 'enemy_flying_0';
    }

    if (this.type === 'hopper') {
      return 'enemy_hopper_0';
    }

    if (this.type === 'swooper') {
      return 'enemy_swooper_0';
    }

    return 'enemy_ground_0';
  }

  createAnimations() {
    // Ground enemy animation
    if (!this.scene.anims.exists('enemy_ground_walk')) {
      this.scene.anims.create({
        key: 'enemy_ground_walk',
        frames: [
          { key: 'enemy_ground_0' },
          { key: 'enemy_ground_1' },
          { key: 'enemy_ground_2' },
          { key: 'enemy_ground_3' },
        ],
        frameRate: 8,
        repeat: -1
      });
    }
    
    // Flying enemy animation
    if (!this.scene.anims.exists('enemy_flying')) {
      this.scene.anims.create({
        key: 'enemy_flying',
        frames: [
          { key: 'enemy_flying_0' },
          { key: 'enemy_flying_1' },
          { key: 'enemy_flying_2' },
          { key: 'enemy_flying_3' },
        ],
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.scene.anims.exists('enemy_hopper')) {
      this.scene.anims.create({
        key: 'enemy_hopper',
        frames: [
          { key: 'enemy_hopper_0' },
          { key: 'enemy_hopper_1' },
          { key: 'enemy_hopper_2' },
          { key: 'enemy_hopper_3' },
        ],
        frameRate: 8,
        repeat: -1
      });
    }

    if (!this.scene.anims.exists('enemy_swooper')) {
      this.scene.anims.create({
        key: 'enemy_swooper',
        frames: [
          { key: 'enemy_swooper_0' },
          { key: 'enemy_swooper_1' },
          { key: 'enemy_swooper_2' },
          { key: 'enemy_swooper_3' },
        ],
        frameRate: 10,
        repeat: -1
      });
    }
    
    // Start appropriate animation
    if (this.type === 'ground') {
      this.sprite.anims.play('enemy_ground_walk', true);
    } else if (this.type === 'hopper') {
      this.sprite.anims.play('enemy_hopper', true);
    } else if (this.type === 'swooper') {
      this.sprite.anims.play('enemy_swooper', true);
    } else {
      this.sprite.anims.play('enemy_flying', true);
    }
  }

  startPatrol() {
    this.sprite.setVelocityX(-this.patrolSpeed);
  }

  update(dt) {
    if (this.isDead) return;
    
    if (this.type === 'ground') {
      this.updateGroundBehavior();
    } else if (this.type === 'hopper') {
      this.updateHopperBehavior(dt);
    } else if (this.type === 'swooper') {
      this.updateSwooperBehavior(dt);
    } else {
      this.updateFlyingBehavior(dt);
    }
  }

  updateGroundBehavior() {
    // Check if we should turn around at patrol boundaries
    const distance = Math.abs(this.sprite.x - this.patrolStartX);
    
    if (distance >= this.patrolDistance) {
      this.turnAround();
    }
    
    // Also turn around if hitting a wall
    if (this.sprite.body.blocked.left) {
      this.facingRight = true;
      this.sprite.setVelocityX(this.patrolSpeed);
      this.sprite.setFlipX(true);
    } else if (this.sprite.body.blocked.right) {
      this.facingRight = false;
      this.sprite.setVelocityX(-this.patrolSpeed);
      this.sprite.setFlipX(false);
    }
    
    // Update facing direction based on velocity
    if (this.sprite.body.velocity.x > 0) {
      this.facingRight = true;
      this.sprite.setFlipX(true);
    } else if (this.sprite.body.velocity.x < 0) {
      this.facingRight = false;
      this.sprite.setFlipX(false);
    }
  }

  updateFlyingBehavior(dt) {
    // Flying enemies move in a sine wave pattern
    this.animTimer += dt;
    
    // Ensure no gravity affects flying enemies
    this.sprite.body.setVelocityY(0);
    this.sprite.body.allowGravity = false;
    
    // Horizontal patrol
    const distance = Math.abs(this.sprite.x - this.patrolStartX);
    if (distance >= this.patrolDistance) {
      this.turnAround();
    }
    
    // Vertical sine wave movement
    const waveOffset = Math.sin(this.animTimer * 3) * 6;
    this.sprite.y = this.baseY + waveOffset;
    
    // Update facing
    if (this.sprite.body.velocity.x > 0) {
      this.sprite.setFlipX(true);
    } else {
      this.sprite.setFlipX(false);
    }
  }

  updateHopperBehavior(dt) {
    this.updateGroundBehavior();

    const isGrounded = this.sprite.body.blocked.down || this.sprite.body.touching.down;

    if (!isGrounded) {
      return;
    }

    this.jumpTimer -= dt;

    if (this.jumpTimer <= 0) {
      this.sprite.setVelocityY(-220);
      this.jumpTimer = Phaser.Math.FloatBetween(0.8, 1.25);
    }
  }

  updateSwooperBehavior(dt) {
    this.animTimer += dt;
    this.sprite.body.allowGravity = false;

    if (this.diveState === 'patrol') {
      this.updateFlyingBehavior(dt);

      const player = this.scene.player?.sprite;
      if (
        player &&
        Math.abs(player.x - this.sprite.x) < 110 &&
        player.y > this.sprite.y + 8 &&
        player.y < this.baseY + 85
      ) {
        this.diveState = 'dive';
        this.diveTarget = {
          x: player.x,
          y: Math.min(player.y + 8, this.baseY + 72),
        };
      }

      return;
    }

    if (this.diveState === 'dive') {
      const diveVector = new Phaser.Math.Vector2(
        this.diveTarget.x - this.sprite.x,
        this.diveTarget.y - this.sprite.y
      );

      if (diveVector.lengthSq() > 0) {
        diveVector.normalize().scale(115);
        this.sprite.setVelocity(diveVector.x, diveVector.y);
        this.sprite.setFlipX(diveVector.x > 0);
      }

      if (
        Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.diveTarget.x, this.diveTarget.y) < 12 ||
        this.sprite.y >= this.baseY + 72
      ) {
        this.diveState = 'return';
      }

      return;
    }

    const returnVector = new Phaser.Math.Vector2(this.patrolStartX - this.sprite.x, this.baseY - this.sprite.y);

    if (returnVector.lengthSq() > 0) {
      returnVector.normalize().scale(80);
      this.sprite.setVelocity(returnVector.x, returnVector.y);
      this.sprite.setFlipX(returnVector.x > 0);
    }

    if (Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.patrolStartX, this.baseY) < 8) {
      this.diveState = 'patrol';
      this.sprite.setPosition(this.patrolStartX, this.baseY);
      this.startPatrol();
    }
  }

  turnAround() {
    this.facingRight = !this.facingRight;
    this.sprite.setVelocityX(this.facingRight ? this.patrolSpeed : -this.patrolSpeed);
    this.sprite.setFlipX(this.facingRight);
    
    // Reset patrol start to prevent getting stuck
    if (Math.abs(this.sprite.x - this.patrolStartX) > this.patrolDistance * 1.5) {
      this.patrolStartX = this.sprite.x;
    }
  }

  /**
   * Handle being stomped by player
   */
  stomp() {
    if (this.isDead) return;
    
    this.isDead = true;
    
    // Create death effect
    if (this.scene.particles) {
      this.scene.particles.createExplosion(this.sprite.x, this.sprite.y);
    }
    
    // Play sound
    if (this.scene.audioManager) {
      this.scene.audioManager.play('enemy_hit');
    }
    
    // Squash animation
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.3,
      scaleY: 0.3,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.sprite.destroy();
      }
    });
  }

  /**
   * Handle being hit (when not stomped)
   */
  hit() {
    // Flash red
    this.sprite.setTint(0xFF0000);
    this.scene.time.delayedCall(100, () => {
      if (this.sprite.active) {
        this.sprite.clearTint();
      }
    });
  }

  /**
   * Get position
   */
  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  /**
   * Destroy the enemy
   */
  destroy() {
    this.sprite.destroy();
  }
}

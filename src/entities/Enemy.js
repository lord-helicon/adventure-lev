import Phaser from 'phaser';

/**
 * Enemy class with multiple types and behaviors
 */
export default class Enemy {
  constructor(scene, x, y, type = 'ground') {
    this.scene = scene;
    this.type = type;
    this.isDead = false;
    
    // Create sprite based on type
    const textureKey = type === 'flying' ? 'enemy_flying_0' : 'enemy_ground_0';
    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(4);
    
    if (type === 'ground') {
      this.sprite.setBodySize(14, 12);
      this.sprite.setOffset(1, 4);
      this.sprite.setBounce(0);
    } else {
      this.sprite.setBodySize(12, 10);
      this.sprite.setOffset(2, 3);
    }
    
    // Disable gravity for flying enemies
    if (type === 'flying') {
      this.sprite.body.allowGravity = false;
    }
    
    // Movement properties
    this.patrolStartX = x;
    this.patrolDistance = 60;
    this.patrolSpeed = 40;
    this.facingRight = false;
    
    // Animation
    this.animTimer = 0;
    this.currentFrame = 0;
    
    // Create animations
    this.createAnimations();
    
    // Start patrolling
    this.startPatrol();
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
    
    // Start appropriate animation
    if (this.type === 'ground') {
      this.sprite.anims.play('enemy_ground_walk', true);
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
    const waveOffset = Math.sin(this.animTimer * 3) * 0.5;
    this.sprite.y += waveOffset;
    
    // Update facing
    if (this.sprite.body.velocity.x > 0) {
      this.sprite.setFlipX(true);
    } else {
      this.sprite.setFlipX(false);
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

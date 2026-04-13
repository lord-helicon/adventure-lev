import Phaser from 'phaser';

/**
 * Player class with enhanced mechanics
 */
export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    
    // Create the sprite
    this.sprite = scene.physics.add.sprite(x, y, 'lev_idle_0');
    this.sprite.setBounce(0.1);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBodySize(12, 20);
    this.sprite.setOffset(2, 4);
    this.sprite.setDepth(5);
    
    // Animation state
    this.currentAnim = 'idle';
    this.animFrame = 0;
    this.animTimer = 0;
    this.facingRight = true;
    
    // Movement constants
    this.SPEED = 100;
    this.JUMP_VELOCITY = -240;
    this.JUMP_CUT_VELOCITY = -100;
    this.COYOTE_TIME = 0.1; // 100ms coyote time
    this.JUMP_BUFFER_TIME = 0.08; // 80ms jump buffer
    
    // Jump mechanics
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.isGrounded = false;
    this.wasGrounded = false;
    this.isJumping = false;
    
    // Power-up states
    this.invincible = false;
    this.invincibleTimer = 0;
    this.speedBoost = false;
    this.speedBoostTimer = 0;
    
    // Create animations
    this.createAnimations();
  }

  createAnimations() {
    // Idle animation
    if (!this.scene.anims.exists('lev_idle')) {
      this.scene.anims.create({
        key: 'lev_idle',
        frames: [
          { key: 'lev_idle_0' },
          { key: 'lev_idle_1' },
          { key: 'lev_idle_2' },
          { key: 'lev_idle_3' },
        ],
        frameRate: 6,
        repeat: -1
      });
    }

    // Run animation
    if (!this.scene.anims.exists('lev_run')) {
      this.scene.anims.create({
        key: 'lev_run',
        frames: [
          { key: 'lev_run_0' },
          { key: 'lev_run_1' },
          { key: 'lev_run_2' },
          { key: 'lev_run_3' },
          { key: 'lev_run_4' },
          { key: 'lev_run_5' },
        ],
        frameRate: 10,
        repeat: -1
      });
    }

    // Jump (single frame)
    if (!this.scene.anims.exists('lev_jump')) {
      this.scene.anims.create({
        key: 'lev_jump',
        frames: [{ key: 'lev_jump' }],
        frameRate: 1,
        repeat: 0
      });
    }
  }

  update(cursors, dt) {
    // Check grounded state
    this.wasGrounded = this.isGrounded;
    this.isGrounded = this.sprite.body.touching.down;
    
    // Handle coyote time
    if (this.wasGrounded && !this.isGrounded) {
      this.coyoteTimer = this.COYOTE_TIME;
    } else {
      this.coyoteTimer -= dt;
    }
    
    // Handle jump buffer
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
    }
    
    // Reset jumping state when grounded
    if (this.isGrounded) {
      this.isJumping = false;
    }
    
    // Horizontal movement
    const speed = this.speedBoost ? this.SPEED * 1.5 : this.SPEED;
    
    if (cursors.left.isDown) {
      this.sprite.setVelocityX(-speed);
      this.facingRight = false;
      this.sprite.setFlipX(true);
    } else if (cursors.right.isDown) {
      this.sprite.setVelocityX(speed);
      this.facingRight = true;
      this.sprite.setFlipX(false);
    } else {
      this.sprite.setVelocityX(0);
    }
    
    // Update animation based on state
    this.updateAnimation();
    
    // Handle variable jump height
    if (this.isJumping && !cursors.space.isDown && this.sprite.body.velocity.y < this.JUMP_CUT_VELOCITY) {
      this.sprite.setVelocityY(this.JUMP_CUT_VELOCITY);
    }
    
    // Check for buffered jump
    if (this.jumpBufferTimer > 0 && (this.isGrounded || this.coyoteTimer > 0)) {
      this.performJump();
    }
    
    // Update power-up timers
    if (this.invincible) {
      this.invincibleTimer -= dt;
      this.sprite.setAlpha(0.5 + Math.sin(this.scene.time.now / 50) * 0.5);
      if (this.invincibleTimer <= 0) {
        this.setInvincible(false);
      }
    }
    
    if (this.speedBoost) {
      this.speedBoostTimer -= dt;
      if (this.speedBoostTimer <= 0) {
        this.setSpeedBoost(false);
      }
    }
  }

  updateAnimation() {
    if (!this.isGrounded) {
      // Jumping
      if (this.currentAnim !== 'jump') {
        this.sprite.anims.play('lev_jump', true);
        this.currentAnim = 'jump';
      }
    } else if (Math.abs(this.sprite.body.velocity.x) > 10) {
      // Running
      if (this.currentAnim !== 'run') {
        this.sprite.anims.play('lev_run', true);
        this.currentAnim = 'run';
      }
    } else {
      // Idle
      if (this.currentAnim !== 'idle') {
        this.sprite.anims.play('lev_idle', true);
        this.currentAnim = 'idle';
      }
    }
  }

  /**
   * Queue a jump (jump buffering)
   */
  jump() {
    this.jumpBufferTimer = this.JUMP_BUFFER_TIME;
  }

  /**
   * Perform the actual jump
   */
  performJump() {
    this.sprite.setVelocityY(this.JUMP_VELOCITY);
    this.isJumping = true;
    this.jumpBufferTimer = 0;
    this.coyoteTimer = 0;
    
    // Play sound
    if (this.scene.audioManager) {
      this.scene.audioManager.play('jump');
    }
    
    // Create dust effect
    if (this.scene.particles) {
      this.scene.particles.createDust(this.sprite.x, this.sprite.y + 10);
    }
  }

  /**
   * Set invincibility state
   */
  setInvincible(active, duration = 3) {
    this.invincible = active;
    if (active) {
      this.invincibleTimer = duration;
    } else {
      this.sprite.setAlpha(1);
    }
  }

  /**
   * Set speed boost state
   */
  setSpeedBoost(active, duration = 5) {
    this.speedBoost = active;
    if (active) {
      this.speedBoostTimer = duration;
    }
  }

  /**
   * Get stomp hitbox (for killing enemies)
   */
  isStomping() {
    return this.sprite.body.velocity.y > 0 && !this.isGrounded;
  }

  /**
   * Bounce off enemy
   */
  bounce() {
    this.sprite.setVelocityY(this.JUMP_VELOCITY * 0.7);
    this.isJumping = true;
  }

  /**
   * Apply knockback
   */
  knockback(direction) {
    this.sprite.setVelocityX(direction * 150);
    this.sprite.setVelocityY(-150);
  }

  /**
   * Get position
   */
  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  /**
   * Destroy the player
   */
  destroy() {
    this.sprite.destroy();
  }
}

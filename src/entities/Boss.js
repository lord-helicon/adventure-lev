import Phaser from 'phaser';

export default class Boss {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.maxHealth = config.health;
    this.health = config.health;
    this.isDefeated = false;
    this.invulnerableTimer = 0;
    this.jumpCooldown = 1.1;

    this.sprite = scene.physics.add.sprite(config.x, config.y, 'boss_guardian_0');
    this.sprite.setDepth(6);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBodySize(24, 20);
    this.sprite.setOffset(4, 4);
    this.sprite.setBounce(0);

    this.homeX = config.x;
    this.homeY = config.y;
    this.patrolDistance = config.patrolDistance || 70;
    this.speed = config.speed || 42;
    this.facingRight = false;

    this.createAnimations();
    this.reset();
  }

  createAnimations() {
    if (!this.scene.anims.exists('boss_guardian')) {
      this.scene.anims.create({
        key: 'boss_guardian',
        frames: [
          { key: 'boss_guardian_0' },
          { key: 'boss_guardian_1' },
          { key: 'boss_guardian_2' },
          { key: 'boss_guardian_3' },
        ],
        frameRate: 7,
        repeat: -1,
      });
    }

    this.sprite.anims.play('boss_guardian', true);
  }

  reset() {
    this.health = this.maxHealth;
    this.isDefeated = false;
    this.invulnerableTimer = 0;
    this.jumpCooldown = 1.1;
    this.sprite.setActive(true);
    this.sprite.setVisible(true);
    this.sprite.enableBody(true, this.homeX, this.homeY, true, true);
    this.sprite.clearTint();
    this.sprite.setAlpha(1);
    this.sprite.setVelocityX(-this.speed);
    this.sprite.setVelocityY(0);
    this.sprite.setFlipX(false);
  }

  update(dt, player) {
    if (this.isDefeated || !this.sprite.active) {
      return;
    }

    this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);

    const distanceFromHome = Math.abs(this.sprite.x - this.homeX);
    if (distanceFromHome >= this.patrolDistance) {
      this.turnAround();
    }

    if (this.sprite.body.blocked.left) {
      this.facingRight = true;
      this.sprite.setVelocityX(this.speed);
    } else if (this.sprite.body.blocked.right) {
      this.facingRight = false;
      this.sprite.setVelocityX(-this.speed);
    }

    if (player) {
      if (Math.abs(player.x - this.sprite.x) < 90) {
        const targetVelocity = player.x > this.sprite.x ? this.speed : -this.speed;
        this.sprite.setVelocityX(targetVelocity);
        this.facingRight = targetVelocity > 0;
      }

      const grounded = this.sprite.body.blocked.down || this.sprite.body.touching.down;
      this.jumpCooldown -= dt;
      if (grounded && this.jumpCooldown <= 0) {
        this.sprite.setVelocityY(-260);
        this.jumpCooldown = player.x > this.sprite.x ? 1 : 1.2;
      }
    }

    this.sprite.setFlipX(this.facingRight);
  }

  turnAround() {
    this.facingRight = !this.facingRight;
    this.sprite.setVelocityX(this.facingRight ? this.speed : -this.speed);
  }

  takeStomp() {
    if (this.isDefeated || this.invulnerableTimer > 0) {
      return false;
    }

    this.health -= 1;
    this.invulnerableTimer = 0.8;
    this.sprite.setTint(0xffcc66);
    this.scene.time.delayedCall(120, () => {
      if (this.sprite.active) {
        this.sprite.clearTint();
      }
    });

    if (this.health <= 0) {
      this.defeat();
    } else {
      this.sprite.setVelocityY(-210);
    }

    return true;
  }

  defeat() {
    this.isDefeated = true;
    this.sprite.disableBody();
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      y: this.sprite.y - 12,
      duration: 300,
      onComplete: () => {
        this.sprite.setVisible(false);
      },
    });
  }
}

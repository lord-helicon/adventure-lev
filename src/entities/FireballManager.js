const SPEED = 180;
const BOUNCE_VELOCITY = -130;
const LIFETIME = 1.5;
const COOLDOWN = 0.25;
const MAX_ACTIVE = 2;

/**
 * Owns the player's fireballs: spawning, bouncing along the level geometry
 * and expiring. Enemy/boss hits are reported through the onHit callbacks.
 */
export default class FireballManager {
  constructor(scene) {
    this.scene = scene;
    this.cooldown = 0;

    if (!scene.anims.exists('fireball_spin')) {
      scene.anims.create({
        key: 'fireball_spin',
        frames: Array.from({ length: 4 }, (_, i) => ({ key: `fireball_${i}` })),
        frameRate: 16,
        repeat: -1,
      });
    }

    this.group = scene.physics.add.group();
  }

  get activeCount() {
    return this.group.countActive(true);
  }

  canFire() {
    return this.cooldown <= 0 && this.activeCount < MAX_ACTIVE;
  }

  fire(x, y, facingRight) {
    if (!this.canFire()) return false;

    const sprite = this.group.create(x, y, 'fireball_0');
    sprite.setDepth(7);
    sprite.setBodySize(6, 6);
    sprite.anims.play('fireball_spin');
    sprite.isFireball = true;
    sprite.dir = facingRight ? 1 : -1;
    sprite.life = LIFETIME;
    sprite.setVelocity(sprite.dir * SPEED, 0);

    this.cooldown = COOLDOWN;
    return true;
  }

  /**
   * Register collisions with level geometry. Called from GameScene once the
   * platforms exist. Each entry is a group, an array of tiles, or
   * `{ targets, process }` when some tiles should be ignored (e.g. a falling
   * platform that has let go).
   */
  setupCollisions(solids) {
    solids.forEach(solid => {
      const { targets, process = null } = solid.targets ? solid : { targets: solid };

      if (Array.isArray(targets) && targets.length === 0) return;

      // Collider callbacks may swap argument order, so identify the fireball by flag
      this.scene.physics.add.collider(
        this.group,
        targets,
        (a, b) => this.handleSolidHit(a.isFireball ? a : b),
        process && ((a, b) => process(a.isFireball ? b : a))
      );
    });
  }

  handleSolidHit(fireball) {
    if (!fireball.active) return;

    const body = fireball.body;
    const hitWall = (body.blocked.left || body.blocked.right || body.touching.left || body.touching.right);

    if (hitWall && !body.touching.down) {
      this.destroyFireball(fireball);
    } else if (body.touching.down || body.blocked.down) {
      fireball.setVelocityY(BOUNCE_VELOCITY);
    } else if (body.touching.up) {
      fireball.setVelocityY(40);
    }
  }

  destroyFireball(fireball, poof = true) {
    if (!fireball.active) return;

    if (poof) {
      this.scene.particles?.createFirePoof(fireball.x, fireball.y);
    }

    fireball.destroy();
  }

  update(dt) {
    this.cooldown = Math.max(0, this.cooldown - dt);

    const view = this.scene.cameras.main.worldView;

    this.group.getChildren().slice().forEach(fireball => {
      if (!fireball.active) return;

      fireball.life -= dt;
      // Re-apply each frame so tile seams can't bleed off horizontal speed
      fireball.setVelocityX(fireball.dir * SPEED);

      const outside = fireball.x < view.left - 4 || fireball.x > view.right + 4 ||
        fireball.y < view.top - 4 || fireball.y > view.bottom + 4;

      if (fireball.life <= 0) {
        this.destroyFireball(fireball);
      } else if (outside) {
        this.destroyFireball(fireball, false);
      }
    });
  }

  clear() {
    // Phaser may already have destroyed the group during scene shutdown (children is then undefined)
    if (this.group.children) {
      this.group.clear(true, true);
    }
  }
}

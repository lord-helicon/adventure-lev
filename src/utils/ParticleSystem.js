/**
 * Particle System for visual effects
 */
export default class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.maxParticles = 180;
  }

  canSpawn(count = 1) {
    return this.particles.length + count <= this.maxParticles;
  }

  /**
   * Create dust particles when landing
   */
  createDust(x, y, count = 5) {
    if (!this.canSpawn(count)) return;

    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.image(x, y, 'particle_dust');
      particle.setAlpha(0.8);
      particle.setScale(0.5 + Math.random() * 0.5);
      particle.setDepth(1);
      
      const angle = (Math.random() * Math.PI) + Math.PI; // Upward arc
      const speed = 20 + Math.random() * 30;
      
      this.particles.push({
        sprite: particle,
        vx: Math.cos(angle) * speed * (Math.random() - 0.5),
        vy: -Math.abs(Math.sin(angle) * speed),
        life: 0.5,
        maxLife: 0.5,
        gravity: 50
      });
    }
  }

  /**
   * Create coin collection sparkles
   */
  createSparkles(x, y, count = 8) {
    if (!this.canSpawn(count)) return;

    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.image(x, y, 'particle_sparkle');
      particle.setAlpha(1);
      particle.setScale(0.3 + Math.random() * 0.4);
      particle.setDepth(10);
      
      const angle = (i / count) * Math.PI * 2;
      const speed = 40 + Math.random() * 40;
      
      this.particles.push({
        sprite: particle,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6,
        maxLife: 0.6,
        gravity: -20, // Float up
        rotation: Math.random() * Math.PI * 4
      });
    }
  }

  /**
   * Create explosion effect (enemy death)
   */
  createExplosion(x, y, count = 12) {
    if (!this.canSpawn(count)) return;

    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.image(x, y, 'particle_explode');
      particle.setAlpha(1);
      particle.setScale(0.5 + Math.random() * 0.5);
      particle.setDepth(10);
      
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5);
      const speed = 60 + Math.random() * 60;
      
      this.particles.push({
        sprite: particle,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4,
        maxLife: 0.4,
        gravity: 100,
        rotation: (Math.random() - 0.5) * 10
      });
    }
  }

  /**
   * Create heart particles (extra life)
   */
  createHearts(x, y, count = 5) {
    if (!this.canSpawn(count)) return;

    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.image(x, y, 'particle_heart');
      particle.setAlpha(1);
      particle.setScale(0.4 + Math.random() * 0.3);
      particle.setDepth(10);
      
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 2;
      const speed = 30 + Math.random() * 30;
      
      this.particles.push({
        sprite: particle,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        maxLife: 1.0,
        gravity: -30, // Float up
        rotation: 0
      });
    }
  }

  /**
   * Create power-up collection effect
   */
  createPowerUpEffect(x, y, color = 0xFFD700) {
    const count = 10;
    if (!this.canSpawn(count)) return;

    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.image(x, y, 'particle_sparkle');
      particle.setTint(color);
      particle.setAlpha(1);
      particle.setScale(0.5 + Math.random() * 0.5);
      particle.setDepth(10);
      
      const angle = (i / count) * Math.PI * 2;
      const speed = 50 + Math.random() * 50;
      
      this.particles.push({
        sprite: particle,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8,
        maxLife: 0.8,
        gravity: 0,
        rotation: Math.random() * Math.PI * 4
      });
    }
  }

  /**
   * Create star trail for invincibility
   */
  createStarTrail(x, y) {
    if (!this.canSpawn()) return;

    const particle = this.scene.add.image(x, y, 'particle_sparkle');
    particle.setTint(0xFFD700);
    particle.setAlpha(0.8);
    particle.setScale(0.3);
    particle.setDepth(5);
    
    this.particles.push({
      sprite: particle,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
      life: 0.3,
      maxLife: 0.3,
      gravity: 0,
      rotation: Math.random() * Math.PI * 2
    });
  }

  /**
   * Update all particles
   */
  update(dt) {
    let writeIndex = 0;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.life -= dt;
      
      if (p.life <= 0) {
        p.sprite.destroy();
        continue;
      }
      
      // Update position
      p.vy += p.gravity * dt;
      p.sprite.x += p.vx * dt;
      p.sprite.y += p.vy * dt;
      
      // Update rotation if applicable
      if (p.rotation) {
        p.sprite.rotation += p.rotation * dt;
      }
      
      // Fade out
      const alpha = (p.life / p.maxLife);
      p.sprite.setAlpha(alpha);
      p.sprite.setScale(p.sprite.scaleX * 0.99);
      this.particles[writeIndex] = p;
      writeIndex += 1;
    }

    this.particles.length = writeIndex;
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particles.forEach(p => p.sprite.destroy());
    this.particles = [];
  }
}

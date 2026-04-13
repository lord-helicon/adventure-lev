/**
 * Enhanced Asset Generator with animations, particles, and parallax backgrounds
 */

// Helper function to create canvas texture
const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext('2d') };
};

export const createAssets = function() {
  // ==========================================
  // PLAYER SPRITES (Lev) - Multiple animations
  // ==========================================
  
  // Idle animation frames (4 frames)
  for (let i = 0; i < 4; i++) {
    const { canvas, ctx } = createCanvas(16, 24);
    const bounce = Math.sin(i * Math.PI / 2) * 1;
    
    // Skin color
    ctx.fillStyle = '#F4A460';
    // Head with slight bounce
    ctx.fillRect(4, 0 + bounce, 8, 8);
    
    // Blond hair
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(3, 0 + bounce, 10, 4);
    // Hair strands
    ctx.fillRect(2, 1 + bounce, 1, 2);
    ctx.fillRect(12, 1 + bounce, 1, 2);
    
    // Eyes (blink on frame 2)
    if (i !== 2) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(5, 3 + bounce, 2, 2);
      ctx.fillRect(9, 3 + bounce, 2, 2);
      // Eye shine
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(6, 3 + bounce, 1, 1);
      ctx.fillRect(10, 3 + bounce, 1, 1);
    } else {
      // Blinking
      ctx.fillStyle = '#000000';
      ctx.fillRect(5, 4 + bounce, 2, 1);
      ctx.fillRect(9, 4 + bounce, 2, 1);
    }
    
    // Mouth (smile)
    ctx.fillStyle = '#FF6B9D';
    ctx.fillRect(6, 6 + bounce, 4, 1);
    
    // Green shirt
    ctx.fillStyle = '#00AA00';
    ctx.fillRect(2, 8 + bounce, 12, 6);
    // Shirt detail
    ctx.fillStyle = '#008800';
    ctx.fillRect(2, 13 + bounce, 12, 1);
    
    // Skin for arms (slight movement)
    ctx.fillStyle = '#F4A460';
    const armOffset = Math.sin(i * Math.PI / 2) * 0.5;
    ctx.fillRect(1, 9 + bounce + armOffset, 2, 4);
    ctx.fillRect(13, 9 + bounce - armOffset, 2, 4);
    
    // Red shorts
    ctx.fillStyle = '#DD0000';
    ctx.fillRect(3, 14 + bounce, 10, 4);
    
    // Skin for legs
    ctx.fillStyle = '#F4A460';
    ctx.fillRect(4, 18 + bounce, 3, 6);
    ctx.fillRect(9, 18 + bounce, 3, 6);
    
    this.textures.addCanvas(`lev_idle_${i}`, canvas);
  }

  // Run animation frames (6 frames)
  for (let i = 0; i < 6; i++) {
    const { canvas, ctx } = createCanvas(16, 24);
    const legOffset1 = Math.sin(i * Math.PI / 3) * 3;
    const legOffset2 = Math.sin((i + 3) * Math.PI / 3) * 3;
    const bodyBounce = Math.abs(Math.sin(i * Math.PI / 3)) * 2;
    
    // Skin color
    ctx.fillStyle = '#F4A460';
    // Head
    ctx.fillRect(4, 0 + bodyBounce, 8, 8);
    
    // Blond hair
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(3, 0 + bodyBounce, 10, 4);
    ctx.fillRect(2, 1 + bodyBounce, 1, 2);
    ctx.fillRect(12, 1 + bodyBounce, 1, 2);
    
    // Eyes (determined look)
    ctx.fillStyle = '#000000';
    ctx.fillRect(5, 3 + bodyBounce, 2, 2);
    ctx.fillRect(9, 3 + bodyBounce, 2, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(6, 3 + bodyBounce, 1, 1);
    ctx.fillRect(10, 3 + bodyBounce, 1, 1);
    
    // Mouth
    ctx.fillStyle = '#FF6B9D';
    ctx.fillRect(6, 6 + bodyBounce, 4, 1);
    
    // Green shirt
    ctx.fillStyle = '#00AA00';
    ctx.fillRect(2, 8 + bodyBounce, 12, 6);
    ctx.fillStyle = '#008800';
    ctx.fillRect(2, 13 + bodyBounce, 12, 1);
    
    // Arms (running motion)
    ctx.fillStyle = '#F4A460';
    ctx.fillRect(0, 9 + bodyBounce - legOffset1 * 0.5, 2, 4);
    ctx.fillRect(14, 9 + bodyBounce + legOffset1 * 0.5, 2, 4);
    
    // Red shorts
    ctx.fillStyle = '#DD0000';
    ctx.fillRect(3, 14 + bodyBounce, 10, 4);
    
    // Legs (running motion)
    ctx.fillStyle = '#F4A460';
    ctx.fillRect(4 + legOffset1 * 0.3, 18 + bodyBounce + legOffset1, 3, 6);
    ctx.fillRect(9 - legOffset2 * 0.3, 18 + bodyBounce + legOffset2, 3, 6);
    
    this.textures.addCanvas(`lev_run_${i}`, canvas);
  }

  // Jump frame
  const { canvas: jumpCanvas, ctx: jumpCtx } = createCanvas(16, 24);
  jumpCtx.fillStyle = '#F4A460';
  jumpCtx.fillRect(4, 2, 8, 8);
  jumpCtx.fillStyle = '#FFD700';
  jumpCtx.fillRect(3, 2, 10, 4);
  jumpCtx.fillRect(2, 3, 1, 2);
  jumpCtx.fillRect(12, 3, 1, 2);
  jumpCtx.fillStyle = '#000000';
  jumpCtx.fillRect(5, 5, 2, 2);
  jumpCtx.fillRect(9, 5, 2, 2);
  jumpCtx.fillStyle = '#FFFFFF';
  jumpCtx.fillRect(6, 5, 1, 1);
  jumpCtx.fillRect(10, 5, 1, 1);
  jumpCtx.fillStyle = '#FF6B9D';
  jumpCtx.fillRect(6, 8, 4, 1);
  jumpCtx.fillStyle = '#00AA00';
  jumpCtx.fillRect(2, 10, 12, 6);
  jumpCtx.fillStyle = '#F4A460';
  jumpCtx.fillRect(0, 10, 2, 4);
  jumpCtx.fillRect(14, 12, 2, 4);
  jumpCtx.fillStyle = '#DD0000';
  jumpCtx.fillRect(3, 16, 10, 4);
  jumpCtx.fillStyle = '#F4A460';
  jumpCtx.fillRect(4, 20, 3, 4);
  jumpCtx.fillRect(9, 18, 3, 3);
  this.textures.addCanvas('lev_jump', jumpCanvas);

  // ==========================================
  // ENEMY SPRITES - Multiple types with animations
  // ==========================================
  
  // Ground enemy (red slime-like)
  for (let i = 0; i < 4; i++) {
    const { canvas, ctx } = createCanvas(16, 16);
    const squash = Math.sin(i * Math.PI / 2) * 2;
    
    // Body (squashing animation)
    ctx.fillStyle = '#DD0000';
    ctx.fillRect(1 + squash/2, 4 - squash, 14 - squash, 12 + squash);
    
    // Highlight
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(3 + squash/2, 6 - squash, 4, 4);
    
    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(4, 6 - squash, 3, 3);
    ctx.fillRect(9, 6 - squash, 3, 3);
    ctx.fillStyle = '#000000';
    ctx.fillRect(5, 7 - squash, 1, 1);
    ctx.fillRect(10, 7 - squash, 1, 1);
    
    // Angry eyebrows
    ctx.fillStyle = '#880000';
    ctx.fillRect(3, 5 - squash, 4, 1);
    ctx.fillRect(9, 5 - squash, 4, 1);
    
    this.textures.addCanvas(`enemy_ground_${i}`, canvas);
  }

  // Flying enemy (bat-like)
  for (let i = 0; i < 4; i++) {
    const { canvas, ctx } = createCanvas(16, 16);
    const wingFlap = Math.sin(i * Math.PI / 2) * 4;
    
    // Wings
    ctx.fillStyle = '#663399';
    ctx.fillRect(0, 4 + wingFlap, 4, 6 - wingFlap);
    ctx.fillRect(12, 4 + wingFlap, 4, 6 - wingFlap);
    
    // Body
    ctx.fillStyle = '#444444';
    ctx.fillRect(4, 6, 8, 8);
    
    // Eyes (glowing)
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(5, 8, 2, 2);
    ctx.fillRect(9, 8, 2, 2);
    
    this.textures.addCanvas(`enemy_flying_${i}`, canvas);
  }

  // Hopper enemy (beetle-like)
  for (let i = 0; i < 4; i++) {
    const { canvas, ctx } = createCanvas(16, 16);
    const crouch = i % 2 === 0 ? 0 : 1;
    const eyeOffset = i >= 2 ? 1 : 0;

    ctx.fillStyle = '#1E90FF';
    ctx.fillRect(2, 5 + crouch, 12, 8 - crouch);

    ctx.fillStyle = '#63B8FF';
    ctx.fillRect(4, 6 + crouch, 4, 3);
    ctx.fillRect(9, 7 + crouch, 2, 2);

    ctx.fillStyle = '#0B3D91';
    ctx.fillRect(3, 13, 2, 2);
    ctx.fillRect(11, 13, 2, 2);
    ctx.fillRect(1, 11 + crouch, 2, 2);
    ctx.fillRect(13, 11 + crouch, 2, 2);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 7 + crouch, 2, 2);
    ctx.fillRect(9, 7 + crouch, 2, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(5 + eyeOffset, 8 + crouch, 1, 1);
    ctx.fillRect(9 + eyeOffset, 8 + crouch, 1, 1);

    this.textures.addCanvas(`enemy_hopper_${i}`, canvas);
  }

  // Swooper enemy (hawk-like)
  for (let i = 0; i < 4; i++) {
    const { canvas, ctx } = createCanvas(16, 16);
    const wingOffset = i % 2 === 0 ? 0 : 2;
    const tailOffset = i >= 2 ? 1 : 0;

    ctx.fillStyle = '#7B3F00';
    ctx.fillRect(1, 5 + wingOffset, 4, 2);
    ctx.fillRect(11, 5 + wingOffset, 4, 2);
    ctx.fillRect(2, 7 + wingOffset, 2, 2);
    ctx.fillRect(12, 7 + wingOffset, 2, 2);

    ctx.fillStyle = '#A0522D';
    ctx.fillRect(4, 5, 8, 6);
    ctx.fillRect(7, 11, 2, 3);

    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(5, 8, 6, 2);

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(7, 10 + tailOffset, 2, 1);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 6, 2, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(6, 7, 1, 1);

    this.textures.addCanvas(`enemy_swooper_${i}`, canvas);
  }

  // Final boss (stone guardian)
  for (let i = 0; i < 4; i++) {
    const { canvas, ctx } = createCanvas(32, 24);
    const armOffset = i % 2 === 0 ? 0 : 1;
    const eyeGlow = i >= 2 ? '#FFEE88' : '#FFD700';

    ctx.fillStyle = '#5F6B7A';
    ctx.fillRect(8, 4, 16, 14);
    ctx.fillRect(4, 8 + armOffset, 4, 8);
    ctx.fillRect(24, 8 - armOffset, 4, 8);
    ctx.fillRect(10, 18, 4, 6);
    ctx.fillRect(18, 18, 4, 6);

    ctx.fillStyle = '#92A0AF';
    ctx.fillRect(10, 6, 5, 4);
    ctx.fillRect(18, 8, 4, 3);
    ctx.fillRect(6, 10, 2, 3);

    ctx.fillStyle = eyeGlow;
    ctx.fillRect(12, 10, 3, 2);
    ctx.fillRect(17, 10, 3, 2);

    ctx.fillStyle = '#2F3B4A';
    ctx.fillRect(11, 15, 10, 2);

    this.textures.addCanvas(`boss_guardian_${i}`, canvas);
  }

  // ==========================================
  // TILES AND PLATFORMS
  // ==========================================
  
  // Grass platform top
  const { canvas: grassTopCanvas, ctx: grassTopCtx } = createCanvas(16, 16);
  grassTopCtx.fillStyle = '#8B4513';
  grassTopCtx.fillRect(0, 0, 16, 16);
  grassTopCtx.fillStyle = '#654321';
  grassTopCtx.fillRect(2, 2, 4, 4);
  grassTopCtx.fillRect(10, 6, 4, 4);
  grassTopCtx.fillStyle = '#228B22';
  grassTopCtx.fillRect(0, 0, 16, 4);
  // Grass details
  grassTopCtx.fillStyle = '#32CD32';
  grassTopCtx.fillRect(2, 0, 2, 3);
  grassTopCtx.fillRect(8, 0, 2, 2);
  grassTopCtx.fillRect(12, 0, 2, 3);
  this.textures.addCanvas('tile_grass', grassTopCanvas);

  // Dirt/Stone platform
  const { canvas: dirtCanvas, ctx: dirtCtx } = createCanvas(16, 16);
  dirtCtx.fillStyle = '#8B4513';
  dirtCtx.fillRect(0, 0, 16, 16);
  dirtCtx.fillStyle = '#654321';
  dirtCtx.fillRect(0, 0, 8, 8);
  dirtCtx.fillRect(8, 8, 8, 8);
  dirtCtx.fillStyle = '#5D4037';
  dirtCtx.strokeStyle = '#4E342E';
  dirtCtx.lineWidth = 1;
  dirtCtx.strokeRect(1, 1, 14, 14);
  this.textures.addCanvas('tile_dirt', dirtCanvas);

  // Moving platform
  const { canvas: movingCanvas, ctx: movingCtx } = createCanvas(16, 16);
  movingCtx.fillStyle = '#4A90E2';
  movingCtx.fillRect(0, 0, 16, 16);
  movingCtx.fillStyle = '#357ABD';
  movingCtx.fillRect(0, 0, 8, 8);
  movingCtx.fillRect(8, 8, 8, 8);
  movingCtx.fillStyle = '#87CEEB';
  movingCtx.fillRect(2, 2, 4, 2);
  movingCtx.fillRect(10, 10, 4, 2);
  // Gear-like border
  movingCtx.fillStyle = '#2C5F8D';
  for (let i = 0; i < 4; i++) {
    movingCtx.fillRect(i * 4, 14, 2, 2);
    movingCtx.fillRect(i * 4, 0, 2, 2);
  }
  this.textures.addCanvas('tile_moving', movingCanvas);

  // Breakable block
  const { canvas: breakCanvas, ctx: breakCtx } = createCanvas(16, 16);
  breakCtx.fillStyle = '#D2691E';
  breakCtx.fillRect(0, 0, 16, 16);
  breakCtx.fillStyle = '#8B4513';
  breakCtx.fillRect(0, 0, 8, 8);
  breakCtx.fillRect(8, 8, 8, 8);
  // Cracks
  breakCtx.strokeStyle = '#5D4037';
  breakCtx.lineWidth = 2;
  breakCtx.beginPath();
  breakCtx.moveTo(4, 4);
  breakCtx.lineTo(8, 8);
  breakCtx.lineTo(6, 12);
  breakCtx.moveTo(12, 4);
  breakCtx.lineTo(10, 6);
  breakCtx.stroke();
  this.textures.addCanvas('tile_breakable', breakCanvas);

  // Spring
  const { canvas: springCanvas, ctx: springCtx } = createCanvas(16, 12);
  springCtx.fillStyle = '#FF6347';
  for (let i = 0; i < 4; i++) {
    springCtx.fillRect(2 + i * 2, 8 - i * 2, 12 - i * 4, 2);
  }
  springCtx.fillStyle = '#CD5C5C';
  springCtx.fillRect(0, 10, 16, 2);
  this.textures.addCanvas('spring', springCanvas);

  // ==========================================
  // COINS - Animated spinning
  // ==========================================
  
  for (let i = 0; i < 8; i++) {
    const { canvas, ctx } = createCanvas(12, 16);
    const width = i < 4 ? 2 + i * 2 : 10 - (i - 4) * 2;
    const offset = (12 - width) / 2;
    
    // Gold gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 16);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.5, '#FFA500');
    gradient.addColorStop(1, '#FFD700');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(offset, 2, width, 12);
    
    // Shine
    if (i === 0 || i === 4) {
      ctx.fillStyle = '#FFFFE0';
      ctx.fillRect(offset + width/2 - 1, 4, 2, 4);
    }
    
    this.textures.addCanvas(`coin_${i}`, canvas);
  }

  // ==========================================
  // POWER-UPS
  // ==========================================
  
  // Invincibility star
  const { canvas: starCanvas, ctx: starCtx } = createCanvas(16, 16);
  starCtx.fillStyle = '#FFD700';
  // Draw star shape
  const drawStar = (cx, cy, spikes, outerRadius, innerRadius) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;
    starCtx.beginPath();
    starCtx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      starCtx.lineTo(x, y);
      rot += step;
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      starCtx.lineTo(x, y);
      rot += step;
    }
    starCtx.lineTo(cx, cy - outerRadius);
    starCtx.closePath();
    starCtx.fill();
  };
  drawStar(8, 8, 5, 7, 3);
  starCtx.fillStyle = '#FFA500';
  drawStar(8, 8, 5, 5, 2);
  this.textures.addCanvas('powerup_star', starCanvas);

  // Speed boost
  const { canvas: speedCanvas, ctx: speedCtx } = createCanvas(16, 16);
  speedCtx.fillStyle = '#00CED1';
  speedCtx.fillRect(4, 2, 8, 12);
  speedCtx.fillStyle = '#FFFFFF';
  speedCtx.fillRect(6, 4, 2, 8);
  speedCtx.fillRect(9, 4, 2, 8);
  this.textures.addCanvas('powerup_speed', speedCanvas);

  // Extra life
  const { canvas: lifeCanvas, ctx: lifeCtx } = createCanvas(16, 16);
  lifeCtx.fillStyle = '#FF1493';
  // Heart shape
  lifeCtx.beginPath();
  lifeCtx.moveTo(8, 14);
  lifeCtx.bezierCurveTo(8, 14, 2, 10, 2, 6);
  lifeCtx.bezierCurveTo(2, 3, 4, 2, 6, 2);
  lifeCtx.bezierCurveTo(7, 2, 8, 3, 8, 4);
  lifeCtx.bezierCurveTo(8, 3, 9, 2, 10, 2);
  lifeCtx.bezierCurveTo(12, 2, 14, 3, 14, 6);
  lifeCtx.bezierCurveTo(14, 10, 8, 14, 8, 14);
  lifeCtx.fill();
  this.textures.addCanvas('powerup_life', lifeCanvas);

  // ==========================================
  // FLAG / GOAL
  // ==========================================
  
  const { canvas: flagCanvas, ctx: flagCtx } = createCanvas(16, 32);
  // Pole
  flagCtx.fillStyle = '#8B4513';
  flagCtx.fillRect(6, 8, 4, 24);
  flagCtx.fillStyle = '#654321';
  flagCtx.fillRect(6, 8, 2, 24);
  // Pole top
  flagCtx.fillStyle = '#FFD700';
  flagCtx.fillRect(5, 4, 6, 4);
  // Flag
  flagCtx.fillStyle = '#FFD700';
  flagCtx.fillRect(10, 4, 6, 10);
  flagCtx.fillStyle = '#FFA500';
  flagCtx.fillRect(10, 4, 2, 10);
  flagCtx.fillRect(14, 4, 2, 10);
  this.textures.addCanvas('flag', flagCanvas);

  // ==========================================
  // PARALLAX BACKGROUNDS
  // ==========================================
  
  // Sky gradient (far background)
  const { canvas: skyCanvas, ctx: skyCtx } = createCanvas(320, 180);
  const skyGradient = skyCtx.createLinearGradient(0, 0, 0, 180);
  skyGradient.addColorStop(0, '#1a1a2e');
  skyGradient.addColorStop(0.3, '#16213e');
  skyGradient.addColorStop(0.7, '#0f3460');
  skyGradient.addColorStop(1, '#e8f4f8');
  skyCtx.fillStyle = skyGradient;
  skyCtx.fillRect(0, 0, 320, 180);
  this.textures.addCanvas('bg_sky', skyCanvas);

  // Distant mountains
  const { canvas: mountainCanvas, ctx: mountainCtx } = createCanvas(320, 180);
  mountainCtx.fillStyle = '#2d3561';
  // Mountain silhouettes
  mountainCtx.beginPath();
  mountainCtx.moveTo(0, 180);
  mountainCtx.lineTo(0, 120);
  mountainCtx.lineTo(40, 80);
  mountainCtx.lineTo(80, 130);
  mountainCtx.lineTo(120, 70);
  mountainCtx.lineTo(160, 110);
  mountainCtx.lineTo(200, 60);
  mountainCtx.lineTo(240, 100);
  mountainCtx.lineTo(280, 50);
  mountainCtx.lineTo(320, 120);
  mountainCtx.lineTo(320, 180);
  mountainCtx.fill();
  this.textures.addCanvas('bg_mountains', mountainCanvas);

  // Clouds
  const { canvas: cloudsCanvas, ctx: cloudsCtx } = createCanvas(320, 180);
  cloudsCtx.fillStyle = '#ffffff';
  // Multiple cloud clusters
  const drawCloud = (x, y, scale) => {
    cloudsCtx.fillRect(x, y, 30 * scale, 10 * scale);
    cloudsCtx.fillRect(x + 5 * scale, y - 8 * scale, 20 * scale, 8 * scale);
    cloudsCtx.fillRect(x + 20 * scale, y - 4 * scale, 15 * scale, 6 * scale);
  };
  drawCloud(20, 30, 1.2);
  drawCloud(120, 50, 0.8);
  drawCloud(200, 25, 1.0);
  drawCloud(260, 60, 0.9);
  this.textures.addCanvas('bg_clouds', cloudsCanvas);

  // Trees (foreground)
  const { canvas: treesCanvas, ctx: treesCtx } = createCanvas(320, 180);
  treesCtx.fillStyle = '#1a472a';
  // Tree silhouettes
  const drawTree = (x, h) => {
    treesCtx.fillRect(x, 180 - h, 8, h);
    treesCtx.beginPath();
    treesCtx.moveTo(x - 15, 180 - h + 10);
    treesCtx.lineTo(x + 4, 180 - h - h * 0.7);
    treesCtx.lineTo(x + 23, 180 - h + 10);
    treesCtx.fill();
  };
  drawTree(30, 50);
  drawTree(150, 70);
  drawTree(280, 45);
  drawTree(220, 60);
  this.textures.addCanvas('bg_trees', treesCanvas);

  // ==========================================
  // PARTICLES
  // ==========================================
  
  // Dust particle
  const { canvas: dustCanvas, ctx: dustCtx } = createCanvas(8, 8);
  dustCtx.fillStyle = '#dddddd';
  dustCtx.fillRect(2, 2, 4, 4);
  dustCtx.fillStyle = '#bbbbbb';
  dustCtx.fillRect(3, 3, 2, 2);
  this.textures.addCanvas('particle_dust', dustCanvas);

  // Sparkle particle
  const { canvas: sparkleCanvas, ctx: sparkleCtx } = createCanvas(8, 8);
  sparkleCtx.fillStyle = '#FFD700';
  sparkleCtx.fillRect(3, 1, 2, 6);
  sparkleCtx.fillRect(1, 3, 6, 2);
  this.textures.addCanvas('particle_sparkle', sparkleCanvas);

  // Explosion particle
  const { canvas: explodeCanvas, ctx: explodeCtx } = createCanvas(8, 8);
  explodeCtx.fillStyle = '#FF6347';
  explodeCtx.fillRect(2, 2, 4, 4);
  explodeCtx.fillStyle = '#FFA500';
  explodeCtx.fillRect(3, 3, 2, 2);
  this.textures.addCanvas('particle_explode', explodeCanvas);

  // Heart particle
  const { canvas: heartParticleCanvas, ctx: heartParticleCtx } = createCanvas(8, 8);
  heartParticleCtx.fillStyle = '#FF69B4';
  heartParticleCtx.fillRect(2, 2, 4, 4);
  this.textures.addCanvas('particle_heart', heartParticleCanvas);

  // ==========================================
  // UI ELEMENTS
  // ==========================================
  
  // Heart icon for lives
  const { canvas: heartCanvas, ctx: heartCtx } = createCanvas(10, 10);
  heartCtx.fillStyle = '#FF0000';
  heartCtx.fillRect(2, 2, 6, 6);
  heartCtx.fillRect(1, 3, 8, 4);
  heartCtx.fillRect(3, 1, 4, 8);
  this.textures.addCanvas('ui_heart', heartCanvas);

  // Coin icon for UI
  const { canvas: coinIconCanvas, ctx: coinIconCtx } = createCanvas(10, 10);
  coinIconCtx.fillStyle = '#FFD700';
  coinIconCtx.fillRect(2, 1, 6, 8);
  coinIconCtx.fillStyle = '#FFA500';
  coinIconCtx.fillRect(4, 1, 2, 8);
  this.textures.addCanvas('ui_coin', coinIconCanvas);

  // Checkpoint
  const { canvas: checkpointCanvas, ctx: checkpointCtx } = createCanvas(16, 24);
  checkpointCtx.fillStyle = '#8B4513';
  checkpointCtx.fillRect(6, 8, 4, 16);
  checkpointCtx.fillStyle = '#808080';
  checkpointCtx.fillRect(6, 4, 10, 12);
  checkpointCtx.fillStyle = '#00FF00';
  checkpointCtx.fillRect(8, 6, 6, 8);
  this.textures.addCanvas('checkpoint', checkpointCanvas);

  // Checkpoint activated
  const { canvas: checkpointActiveCanvas, ctx: checkpointActiveCtx } = createCanvas(16, 24);
  checkpointActiveCtx.fillStyle = '#8B4513';
  checkpointActiveCtx.fillRect(6, 8, 4, 16);
  checkpointActiveCtx.fillStyle = '#00AA00';
  checkpointActiveCtx.fillRect(6, 4, 10, 12);
  checkpointActiveCtx.fillStyle = '#00FF00';
  checkpointActiveCtx.fillRect(8, 6, 6, 8);
  this.textures.addCanvas('checkpoint_active', checkpointActiveCanvas);
};

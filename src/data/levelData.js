/**
 * Level Data - Defines platforms, enemies, collectibles, and other entities
 */
export const levelData = {
  width: 1200,
  height: 180,
  playerStart: { x: 50, y: 100 },
  
  // Platforms: { x, y, width (in tiles), type }
  platforms: [
    // Ground sections
    { x: 0, y: 160, width: 15, type: 'grass' },
    { x: 280, y: 160, width: 10, type: 'grass' },
    { x: 500, y: 160, width: 15, type: 'grass' },
    { x: 800, y: 160, width: 25, type: 'grass' },
    
    // Raised platforms
    { x: 180, y: 130, width: 6, type: 'grass' },
    { x: 320, y: 100, width: 5, type: 'grass' },
    { x: 450, y: 80, width: 4, type: 'grass' },
    { x: 580, y: 110, width: 6, type: 'grass' },
    { x: 720, y: 90, width: 5, type: 'grass' },
    { x: 900, y: 120, width: 6, type: 'grass' },
    { x: 1050, y: 100, width: 4, type: 'grass' },
    
    // High platform
    { x: 850, y: 60, width: 4, type: 'grass' },
    
    // Moving platforms
    { x: 400, y: 130, width: 3, type: 'moving', moveY: -50, speed: 30 },
    { x: 650, y: 140, width: 3, type: 'moving', moveX: 80, speed: 40 },
    
    // Breakable blocks
    { x: 380, y: 70, width: 1, type: 'breakable' },
    { x: 400, y: 70, width: 1, type: 'breakable' },
    { x: 420, y: 70, width: 1, type: 'breakable' },
    
    // Dirt filler below platforms (visual only)
    { x: 0, y: 176, width: 75, type: 'dirt' },
  ],
  
  // Coins: { x, y }
  coins: [
    { x: 200, y: 110 },
    { x: 220, y: 110 },
    { x: 340, y: 80 },
    { x: 360, y: 80 },
    { x: 390, y: 50 },
    { x: 470, y: 60 },
    { x: 480, y: 60 },
    { x: 600, y: 90 },
    { x: 620, y: 90 },
    { x: 640, y: 90 },
    { x: 740, y: 70 },
    { x: 760, y: 70 },
    { x: 870, y: 40 },
    { x: 890, y: 40 },
    { x: 920, y: 100 },
    { x: 940, y: 100 },
    { x: 960, y: 100 },
    { x: 1070, y: 80 },
    { x: 1090, y: 80 },
  ],
  
  // Enemies: { x, y, type, patrolDistance }
  // Ground enemies y positions should place them ON platforms (platformY - 12)
  enemies: [
    { x: 150, y: 148, type: 'ground', patrolDistance: 50 },
    { x: 340, y: 88, type: 'ground', patrolDistance: 40 },
    { x: 550, y: 148, type: 'ground', patrolDistance: 60 },
    { x: 620, y: 98, type: 'ground', patrolDistance: 40 },
    { x: 840, y: 148, type: 'ground', patrolDistance: 50 },
    { x: 250, y: 80, type: 'flying', patrolDistance: 60 },
    { x: 700, y: 70, type: 'flying', patrolDistance: 50 },
    { x: 950, y: 90, type: 'flying', patrolDistance: 60 },
  ],
  
  // Springs: { x, y }
  springs: [
    { x: 260, y: 148 },
    { x: 830, y: 148 },
  ],
  
  // Power-ups: { x, y, type }
  powerups: [
    { x: 410, y: 40, type: 'star' },
    { x: 880, y: 40, type: 'speed' },
    { x: 1100, y: 80, type: 'life' },
  ],
  
  // Checkpoints: { x, y }
  checkpoints: [
    { x: 300, y: 144 },
    { x: 750, y: 144 },
  ],
  
  // Goal: { x, y }
  goal: { x: 1150, y: 128 },
};

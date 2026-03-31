import Phaser from 'phaser';
import AudioManager from '../utils/AudioManager.js';

/**
 * Menu Scene - Title screen and main menu
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Resume audio context (browser requirement)
    this.audioManager = new AudioManager(this);
    this.audioManager.resume();
    
    // Create parallax background
    this.createBackground();
    
    // Title
    const titleText = this.add.text(this.cameras.main.centerX, 50, 'ADVENTURE LEV', {
      fontSize: '32px',
      fill: '#FFD700',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    titleText.setOrigin(0.5);
    titleText.setScrollFactor(0);
    
    // Subtitle
    const subtitleText = this.add.text(this.cameras.main.centerX, 80, 'A Pixel Platformer', {
      fontSize: '10px',
      fill: '#AAAAAA',
      fontFamily: '"Courier New", monospace',
    });
    subtitleText.setOrigin(0.5);
    subtitleText.setScrollFactor(0);
    
    // Menu options
    this.menuOptions = [
      { text: 'START GAME', scene: 'GameScene' },
      { text: 'MUSIC: ON', action: 'toggleMusic' },
    ];
    
    this.selectedIndex = 0;
    this.menuItems = [];
    
    this.menuOptions.forEach((option, index) => {
      const y = 110 + index * 20;
      const text = this.add.text(this.cameras.main.centerX, y, option.text, {
        fontSize: '12px',
        fill: index === 0 ? '#FFFFFF' : '#888888',
        fontFamily: '"Courier New", monospace',
      });
      text.setOrigin(0.5);
      text.setScrollFactor(0);
      this.menuItems.push(text);
    });
    
    // Instructions
    const instructionText = this.add.text(this.cameras.main.centerX, 160, 
      'ARROWS: Move | SPACE: Jump | ENTER: Select', {
      fontSize: '8px',
      fill: '#666666',
      fontFamily: '"Courier New", monospace',
    });
    instructionText.setOrigin(0.5);
    instructionText.setScrollFactor(0);
    
    // Input handling
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-UP', () => this.changeSelection(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.changeSelection(1));
    this.input.keyboard.on('keydown-ENTER', () => this.selectOption());
    this.input.keyboard.on('keydown-SPACE', () => this.selectOption());
    
    // Start background music
    this.audioManager.startMusic();
  }

  createBackground() {
    // Sky
    const sky = this.add.image(160, 90, 'bg_sky');
    sky.setScrollFactor(0);
    
    // Mountains (parallax)
    this.bgMountains = this.add.image(160, 90, 'bg_mountains');
    this.bgMountains.setScrollFactor(0.2);
    this.bgMountains.setAlpha(0.6);
    
    // Clouds (parallax)
    this.bgClouds = this.add.image(160, 90, 'bg_clouds');
    this.bgClouds.setScrollFactor(0.4);
    this.bgClouds.setAlpha(0.8);
    
    // Trees (parallax)
    this.bgTrees = this.add.image(160, 90, 'bg_trees');
    this.bgTrees.setScrollFactor(0.6);
    this.bgTrees.setAlpha(0.7);
  }

  changeSelection(direction) {
    this.audioManager.play('select');
    
    this.menuItems[this.selectedIndex].setFill('#888888');
    this.selectedIndex += direction;
    
    if (this.selectedIndex < 0) this.selectedIndex = this.menuOptions.length - 1;
    if (this.selectedIndex >= this.menuOptions.length) this.selectedIndex = 0;
    
    this.menuItems[this.selectedIndex].setFill('#FFFFFF');
  }

  selectOption() {
    const option = this.menuOptions[this.selectedIndex];
    
    this.audioManager.play('start');
    
    if (option.action === 'toggleMusic') {
      const isMuted = this.audioManager.toggleMute();
      this.menuItems[this.selectedIndex].setText(isMuted ? 'MUSIC: OFF' : 'MUSIC: ON');
    } else if (option.scene) {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(option.scene);
      });
    }
  }

  update(time, delta) {
    // Animate clouds
    this.bgClouds.x = 160 + Math.sin(time / 3000) * 20;
  }
}

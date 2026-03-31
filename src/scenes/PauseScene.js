import Phaser from 'phaser';

/**
 * Pause Scene - Overlay for paused game
 */
export default class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create() {
    // Semi-transparent overlay
    const overlay = this.add.rectangle(160, 90, 320, 180, 0x000000, 0.6);
    overlay.setScrollFactor(0);
    
    // Pause text
    const title = this.add.text(160, 60, 'PAUSED', {
      fontSize: '24px',
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    
    // Options
    const resumeText = this.add.text(160, 100, 'Press ESC to Resume', {
      fontSize: '12px',
      fill: '#AAAAAA',
      fontFamily: '"Courier New", monospace',
    });
    resumeText.setOrigin(0.5);
    resumeText.setScrollFactor(0);
    
    const menuText = this.add.text(160, 120, 'Press M for Menu', {
      fontSize: '12px',
      fill: '#AAAAAA',
      fontFamily: '"Courier New", monospace',
    });
    menuText.setOrigin(0.5);
    menuText.setScrollFactor(0);
    
    // Input handling
    this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
    this.input.keyboard.on('keydown-P', () => this.resumeGame());
    this.input.keyboard.on('keydown-M', () => this.goToMenu());
  }

  resumeGame() {
    this.scene.stop();
    this.scene.resume('GameScene');
  }

  goToMenu() {
    this.scene.stop('GameScene');
    this.scene.stop();
    this.scene.start('MenuScene');
  }
}

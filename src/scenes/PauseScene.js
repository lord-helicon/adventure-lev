import Phaser from 'phaser';
import { abandonRun } from '../utils/runState.js';

/**
 * Pause Scene - Overlay for paused game
 */
export default class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create() {
    this.isTransitioning = false;

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
    resumeText.setInteractive();
    resumeText.on('pointerdown', () => this.resumeGame());
    
    const menuText = this.add.text(160, 120, 'Press M for Menu', {
      fontSize: '12px',
      fill: '#AAAAAA',
      fontFamily: '"Courier New", monospace',
    });
    menuText.setOrigin(0.5);
    menuText.setScrollFactor(0);
    menuText.setInteractive();
    menuText.on('pointerdown', () => this.goToMenu());

    const settingsText = this.add.text(160, 140, 'Press S for Settings', {
      fontSize: '12px',
      fill: '#AAAAAA',
      fontFamily: '"Courier New", monospace',
    });
    settingsText.setOrigin(0.5);
    settingsText.setScrollFactor(0);
    settingsText.setInteractive();
    settingsText.on('pointerdown', () => this.openSettings());
    
    // Input handling
    this.handleResume = () => this.resumeGame();
    this.handleMenu = () => this.goToMenu();
    this.handleSettings = () => this.openSettings();
    this.input.keyboard.on('keydown-ESC', this.handleResume);
    this.input.keyboard.on('keydown-P', this.handleResume);
    this.input.keyboard.on('keydown-M', this.handleMenu);
    this.input.keyboard.on('keydown-S', this.handleSettings);

    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-ESC', this.handleResume);
      this.input.keyboard.off('keydown-P', this.handleResume);
      this.input.keyboard.off('keydown-M', this.handleMenu);
      this.input.keyboard.off('keydown-S', this.handleSettings);
    });
  }

  resumeGame() {
    if (this.isTransitioning) {
      return;
    }

    this.isTransitioning = true;
    this.scene.stop();
    this.scene.resume('GameScene');
  }

  goToMenu() {
    if (this.isTransitioning) {
      return;
    }

    this.isTransitioning = true;
    abandonRun();
    this.scene.stop('GameScene');
    this.scene.stop();
    this.scene.start('MenuScene');
  }

  openSettings() {
    if (this.isTransitioning) {
      return;
    }

    this.scene.pause();
    this.scene.launch('SettingsScene', { parentScene: 'PauseScene' });
  }
}

import Phaser from 'phaser';
import AudioManager from '../utils/AudioManager.js';

/**
 * Game Over Scene - Shows final score and options
 */
export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    this.audioManager = new AudioManager(this);
    
    // Background
    this.add.image(160, 90, 'bg_sky').setScrollFactor(0);
    
    // Game Over text
    const title = this.add.text(160, 50, 'GAME OVER', {
      fontSize: '28px',
      fill: '#FF0000',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    });
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    
    // Final score
    const scoreText = this.add.text(160, 85, `FINAL SCORE: ${this.finalScore}`, {
      fontSize: '14px',
      fill: '#FFD700',
      fontFamily: '"Courier New", monospace',
    });
    scoreText.setOrigin(0.5);
    scoreText.setScrollFactor(0);
    
    // Options
    const tryAgainText = this.add.text(160, 115, 'Press ENTER to Try Again', {
      fontSize: '12px',
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
    });
    tryAgainText.setOrigin(0.5);
    tryAgainText.setScrollFactor(0);
    
    const menuText = this.add.text(160, 135, 'Press M for Menu', {
      fontSize: '12px',
      fill: '#AAAAAA',
      fontFamily: '"Courier New", monospace',
    });
    menuText.setOrigin(0.5);
    menuText.setScrollFactor(0);
    
    // Input handling
    this.input.keyboard.on('keydown-ENTER', () => {
      this.audioManager.play('start');
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    });
    
    this.input.keyboard.on('keydown-M', () => {
      this.audioManager.play('select');
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
    
    // Fade in
    this.cameras.main.fadeIn(500);
  }
}

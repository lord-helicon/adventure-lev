import Phaser from 'phaser';
import AudioManager from '../utils/AudioManager.js';
import { abandonRun, getRunState, startNewRun } from '../utils/runState.js';
import { getBestScore } from '../utils/storage.js';

/**
 * Game Over Scene - Shows final score and options
 */
export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score ?? getRunState().score;
    this.bestScore = getBestScore();
  }

  create() {
    this.audioManager = new AudioManager(this);
    this.audioManager.resume();
    this.isTransitioning = false;
    
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

    const bestScoreText = this.add.text(160, 102, `BEST SCORE: ${this.bestScore}`, {
      fontSize: '10px',
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
    });
    bestScoreText.setOrigin(0.5);
    bestScoreText.setScrollFactor(0);
    
    // Options
    const tryAgainText = this.add.text(160, 122, 'Press ENTER to Try Again', {
      fontSize: '12px',
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
    });
    tryAgainText.setOrigin(0.5);
    tryAgainText.setScrollFactor(0);
    tryAgainText.setInteractive();
    tryAgainText.on('pointerdown', () => this.handleRestart());
    
    const menuText = this.add.text(160, 142, 'Press M for Menu', {
      fontSize: '12px',
      fill: '#AAAAAA',
      fontFamily: '"Courier New", monospace',
    });
    menuText.setOrigin(0.5);
    menuText.setScrollFactor(0);
    menuText.setInteractive();
    menuText.on('pointerdown', () => this.handleMenu());
    
    // Input handling
    this.handleRestart = () => {
      if (this.isTransitioning) {
        return;
      }

      this.isTransitioning = true;
      this.audioManager.play('start');
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        startNewRun();
        this.scene.start('GameScene', { levelIndex: 0 });
      });
    };
    
    this.handleMenu = () => {
      if (this.isTransitioning) {
        return;
      }

      this.isTransitioning = true;
      this.audioManager.play('select');
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        abandonRun();
        this.scene.start('MenuScene');
      });
    };

    this.input.keyboard.on('keydown-ENTER', this.handleRestart);
    this.input.keyboard.on('keydown-M', this.handleMenu);

    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-ENTER', this.handleRestart);
      this.input.keyboard.off('keydown-M', this.handleMenu);
    });
    
    // Fade in
    this.cameras.main.fadeIn(500);
  }
}

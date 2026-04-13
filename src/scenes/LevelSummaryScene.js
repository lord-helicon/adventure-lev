import Phaser from 'phaser';
import { getLevelData } from '../data/levelData.js';
import { abandonRun, advanceLevel } from '../utils/runState.js';
import { getBestScore } from '../utils/storage.js';

export default class LevelSummaryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSummaryScene' });
  }

  init(data) {
    this.levelIndex = data.levelIndex;
    this.score = data.score;
    this.lives = data.lives;
    this.nextLevel = getLevelData(data.levelIndex + 1);
    this.bestScore = getBestScore();
    this.isTransitioning = false;
  }

  create() {
    this.add.rectangle(160, 90, 320, 180, 0x000000, 0.85);

    const title = this.add.text(160, 34, `LEVEL ${this.levelIndex + 1} COMPLETE!`, {
      fontSize: '18px',
      fill: '#FFD700',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    const nextLabel = this.add.text(160, 62, `NEXT: ${this.nextLevel.name.toUpperCase()}`, {
      fontSize: '10px',
      fill: '#AAAAAA',
      fontFamily: '"Courier New", monospace',
    });
    nextLabel.setOrigin(0.5);

    const scoreText = this.add.text(160, 84, `RUN SCORE: ${this.score}`, {
      fontSize: '12px',
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
    });
    scoreText.setOrigin(0.5);

    const livesText = this.add.text(160, 100, `LIVES REMAINING: ${this.lives}`, {
      fontSize: '10px',
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
    });
    livesText.setOrigin(0.5);

    const bestScoreText = this.add.text(160, 116, `BEST SCORE: ${this.bestScore}`, {
      fontSize: '10px',
      fill: '#FFD700',
      fontFamily: '"Courier New", monospace',
    });
    bestScoreText.setOrigin(0.5);

    const continueText = this.add.text(160, 140, 'ENTER: NEXT LEVEL', {
      fontSize: '10px',
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
    });
    continueText.setOrigin(0.5);
    continueText.setInteractive();
    continueText.on('pointerdown', () => this.goToNextLevel());

    const menuText = this.add.text(160, 154, 'M: MENU', {
      fontSize: '10px',
      fill: '#AAAAAA',
      fontFamily: '"Courier New", monospace',
    });
    menuText.setOrigin(0.5);
    menuText.setInteractive();
    menuText.on('pointerdown', () => this.goToMenu());

    this.handleContinue = () => this.goToNextLevel();
    this.handleMenu = () => this.goToMenu();
    this.input.keyboard.on('keydown-ENTER', this.handleContinue);
    this.input.keyboard.on('keydown-M', this.handleMenu);

    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-ENTER', this.handleContinue);
      this.input.keyboard.off('keydown-M', this.handleMenu);
    });

    this.cameras.main.fadeIn(250);
  }

  goToNextLevel() {
    if (this.isTransitioning) {
      return;
    }

    this.isTransitioning = true;
    const nextLevelIndex = advanceLevel();
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { levelIndex: nextLevelIndex });
    });
  }

  goToMenu() {
    if (this.isTransitioning) {
      return;
    }

    this.isTransitioning = true;
    abandonRun();
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene');
    });
  }
}

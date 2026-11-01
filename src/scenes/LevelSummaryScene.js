import Phaser from 'phaser';
import { getLevelData } from '../data/levelData.js';
import { advanceLevel } from '../utils/runState.js';
import { getBestScore } from '../utils/storage.js';
import { formatTime, RANK_COLORS } from '../utils/rank.js';

export default class LevelSummaryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSummaryScene' });
  }

  init(data) {
    this.levelIndex = data.levelIndex;
    this.score = data.score;
    this.lives = data.lives;
    this.coinCount = data.coinCount || 0;
    // Fallback keeps the scene usable if started without stats (e.g. from the console)
    this.stats = data.stats || { time: 0, parTime: 0, coins: 0, totalCoins: 0, secrets: 0, totalSecrets: 0, deaths: 0, rank: 'C' };
    this.nextLevel = getLevelData(data.levelIndex + 1);
    this.bestScore = getBestScore();
    this.isTransitioning = false;
  }

  create() {
    this.add.rectangle(160, 90, 320, 180, 0x000000, 0.85);

    const title = this.add.text(160, 18, `LEVEL ${this.levelIndex + 1} COMPLETE!`, {
      fontSize: '18px',
      fill: '#FFD700',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    const nextLabel = this.add.text(160, 38, `NEXT: ${this.nextLevel.name.toUpperCase()}`, {
      fontSize: '10px',
      fill: '#AAAAAA',
      fontFamily: '"Courier New", monospace',
    });
    nextLabel.setOrigin(0.5);

    // Left column: this level's stats. Right: the rank. Below: run-wide totals.
    const stats = this.stats;
    const statLines = [
      `TIME:    ${formatTime(stats.time)} (PAR ${formatTime(stats.parTime)})`,
      `COINS:   ${stats.coins}/${stats.totalCoins}`,
      `SECRETS: ${stats.totalSecrets > 0 ? `${stats.secrets}/${stats.totalSecrets}` : '-'}`,
      `DEATHS:  ${stats.deaths}`,
    ];

    statLines.forEach((line, i) => {
      this.add.text(36, 56 + i * 14, line, {
        fontSize: '10px',
        fill: '#FFFFFF',
        fontFamily: '"Courier New", monospace',
      });
    });

    const rankCaption = this.add.text(256, 56, 'RANK', {
      fontSize: '10px',
      fill: '#AAAAAA',
      fontFamily: '"Courier New", monospace',
    });
    rankCaption.setOrigin(0.5, 0);

    const rankText = this.add.text(256, 84, stats.rank, {
      fontSize: '32px',
      fill: RANK_COLORS[stats.rank],
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
    });
    rankText.setOrigin(0.5);

    const scoreText = this.add.text(160, 118, `SCORE: ${this.score}   LIVES: ${this.lives}   COINS: ${this.coinCount}`, {
      fontSize: '10px',
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
    });
    scoreText.setOrigin(0.5);

    const bestScoreText = this.add.text(160, 130, `BEST SCORE: ${this.bestScore}`, {
      fontSize: '10px',
      fill: '#FFD700',
      fontFamily: '"Courier New", monospace',
    });
    bestScoreText.setOrigin(0.5);

    const continueText = this.add.text(160, 146, 'ENTER: NEXT LEVEL', {
      fontSize: '10px',
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
    });
    continueText.setOrigin(0.5);
    continueText.setInteractive();
    continueText.on('pointerdown', () => this.goToNextLevel());

    const menuText = this.add.text(160, 160, 'M: MENU', {
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

    // Save progress at the next level so CONTINUE resumes there
    this.isTransitioning = true;
    advanceLevel();
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene');
    });
  }
}

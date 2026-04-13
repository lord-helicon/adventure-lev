import Phaser from 'phaser';
import AudioManager from '../utils/AudioManager.js';
import { restoreSavedRun, startNewRun } from '../utils/runState.js';
import { getBestScore, loadRunProgress } from '../utils/storage.js';

/**
 * Menu Scene - Title screen and main menu
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.audioManager = new AudioManager(this);
    this.audioManager.resume();
    this.registerSceneCleanup();
    this.isTransitioning = false;
    this.savedRun = loadRunProgress();
    this.bestScore = getBestScore();

    this.createBackground();

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

    const subtitleText = this.add.text(this.cameras.main.centerX, 80, 'A Pixel Platformer', {
      fontSize: '10px',
      fill: '#AAAAAA',
      fontFamily: '"Courier New", monospace',
    });
    subtitleText.setOrigin(0.5);
    subtitleText.setScrollFactor(0);

    this.bestScoreText = this.add.text(this.cameras.main.centerX, 96, `BEST SCORE: ${this.bestScore}`, {
      fontSize: '10px',
      fill: '#FFD700',
      fontFamily: '"Courier New", monospace',
    });
    this.bestScoreText.setOrigin(0.5);
    this.bestScoreText.setScrollFactor(0);

    this.menuOptions = this.buildMenuOptions();
    this.selectedIndex = 0;
    this.menuItems = [];

    this.menuOptions.forEach((option, index) => {
      const y = 114 + index * 18;
      const text = this.add.text(this.cameras.main.centerX, y, option.text, {
        fontSize: '12px',
        fill: index === 0 ? '#FFFFFF' : '#888888',
        fontFamily: '"Courier New", monospace',
      });
      text.setOrigin(0.5);
      text.setScrollFactor(0);
      text.setInteractive();
      text.on('pointerdown', () => {
        this.selectedIndex = index;
        this.refreshSelection();
        this.selectOption();
      });
      text.on('pointerover', () => {
        this.selectedIndex = index;
        this.refreshSelection();
      });
      this.menuItems.push(text);
    });

    const instructionText = this.add.text(
      this.cameras.main.centerX,
      176,
      'ARROWS: Move | SPACE: Jump | ENTER: Select',
      {
        fontSize: '8px',
        fill: '#666666',
        fontFamily: '"Courier New", monospace',
      }
    );
    instructionText.setOrigin(0.5);
    instructionText.setScrollFactor(0);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.handleUp = () => this.changeSelection(-1);
    this.handleDown = () => this.changeSelection(1);
    this.handleSelect = () => this.selectOption();
    this.input.keyboard.on('keydown-UP', this.handleUp);
    this.input.keyboard.on('keydown-DOWN', this.handleDown);
    this.input.keyboard.on('keydown-ENTER', this.handleSelect);
    this.input.keyboard.on('keydown-SPACE', this.handleSelect);

    this.audioManager.startMusic();
  }

  buildMenuOptions() {
    const options = [];

    if (this.savedRun) {
      options.push({
        text: `CONTINUE - LEVEL ${this.savedRun.currentLevelIndex + 1}`,
        action: 'continueGame',
      });
    }

    options.push({ text: 'START NEW GAME', action: 'startGame' });
    options.push({ text: 'SETTINGS', action: 'settings' });

    return options;
  }

  createBackground() {
    const sky = this.add.image(160, 90, 'bg_sky');
    sky.setScrollFactor(0);

    this.bgMountains = this.add.image(160, 90, 'bg_mountains');
    this.bgMountains.setScrollFactor(0.2);
    this.bgMountains.setAlpha(0.6);

    this.bgClouds = this.add.image(160, 90, 'bg_clouds');
    this.bgClouds.setScrollFactor(0.4);
    this.bgClouds.setAlpha(0.8);

    this.bgTrees = this.add.image(160, 90, 'bg_trees');
    this.bgTrees.setScrollFactor(0.6);
    this.bgTrees.setAlpha(0.7);
  }

  changeSelection(direction) {
    this.audioManager.play('select');
    this.selectedIndex += direction;

    if (this.selectedIndex < 0) this.selectedIndex = this.menuOptions.length - 1;
    if (this.selectedIndex >= this.menuOptions.length) this.selectedIndex = 0;
    this.refreshSelection();
  }

  refreshSelection() {
    this.menuItems.forEach((item, index) => {
      item.setFill(index === this.selectedIndex ? '#FFFFFF' : '#888888');
    });
  }

  selectOption() {
    if (this.isTransitioning) {
      return;
    }

    const option = this.menuOptions[this.selectedIndex];

    if (option.action === 'continueGame') {
      const restoredRun = restoreSavedRun();

      if (!restoredRun) {
        return;
      }

      this.audioManager.play('start');
      this.isTransitioning = true;
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene', { levelIndex: restoredRun.currentLevelIndex });
      });
      return;
    }

    if (option.action === 'startGame') {
      startNewRun();
      this.audioManager.play('start');
      this.isTransitioning = true;
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene', { levelIndex: 0 });
      });
      return;
    }

    if (option.action === 'settings') {
      this.audioManager.play('select');
      this.scene.pause();
      this.scene.launch('SettingsScene', { parentScene: 'MenuScene' });
    }
  }

  registerSceneCleanup() {
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-UP', this.handleUp);
      this.input.keyboard.off('keydown-DOWN', this.handleDown);
      this.input.keyboard.off('keydown-ENTER', this.handleSelect);
      this.input.keyboard.off('keydown-SPACE', this.handleSelect);
      this.audioManager.stopMusic();
    });
  }

  update(time) {
    this.bgClouds.x = 160 + Math.sin(time / 3000) * 20;
  }
}

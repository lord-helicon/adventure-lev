import Phaser from 'phaser';
import AudioManager from '../utils/AudioManager.js';
import { getKeyboardLayoutLabel, getNextKeyboardLayout } from '../utils/inputConfig.js';
import { loadSettings, saveSettings } from '../utils/storage.js';

export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  init(data = {}) {
    this.parentScene = data.parentScene || 'MenuScene';
    this.selectedIndex = 0;
    this.isClosing = false;
  }

  create() {
    this.audioManager = new AudioManager(this);
    this.audioManager.resume();
    this.settings = loadSettings();

    this.add.rectangle(160, 90, 320, 180, 0x000000, 0.82);

    const title = this.add.text(160, 34, 'SETTINGS', {
      fontSize: '20px',
      fill: '#FFD700',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    this.optionDescriptors = [
      { key: 'mute', y: 66 },
      { key: 'volume', y: 88 },
      { key: 'keyboardLayout', y: 110 },
      { key: 'back', y: 138 },
    ];

    this.optionTexts = this.optionDescriptors.map((option, index) => {
      const text = this.add.text(160, option.y, '', {
        fontSize: '12px',
        fill: index === 0 ? '#FFFFFF' : '#888888',
        fontFamily: '"Courier New", monospace',
      });
      text.setOrigin(0.5);
      text.setInteractive();
      text.on('pointerdown', () => {
        this.selectedIndex = index;
        this.refreshOptions();

        this.handlePointerSelection(option.key);
      });
      return text;
    });

    const hint = this.add.text(160, 160, 'UP/DOWN: SELECT  LEFT/RIGHT: ADJUST  ESC: BACK', {
      fontSize: '8px',
      fill: '#888888',
      fontFamily: '"Courier New", monospace',
    });
    hint.setOrigin(0.5);

    this.refreshOptions();

    this.handleUp = () => this.moveSelection(-1);
    this.handleDown = () => this.moveSelection(1);
    this.handleLeft = () => this.adjustSelected(-0.25);
    this.handleRight = () => this.adjustSelected(0.25);
    this.handleEnter = () => this.activateSelected();
    this.handleBack = () => this.close();

    this.input.keyboard.on('keydown-UP', this.handleUp);
    this.input.keyboard.on('keydown-DOWN', this.handleDown);
    this.input.keyboard.on('keydown-LEFT', this.handleLeft);
    this.input.keyboard.on('keydown-RIGHT', this.handleRight);
    this.input.keyboard.on('keydown-ENTER', this.handleEnter);
    this.input.keyboard.on('keydown-ESC', this.handleBack);

    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown-UP', this.handleUp);
      this.input.keyboard.off('keydown-DOWN', this.handleDown);
      this.input.keyboard.off('keydown-LEFT', this.handleLeft);
      this.input.keyboard.off('keydown-RIGHT', this.handleRight);
      this.input.keyboard.off('keydown-ENTER', this.handleEnter);
      this.input.keyboard.off('keydown-ESC', this.handleBack);
    });
  }

  refreshOptions() {
    const labels = [
      `MUSIC: ${this.audioManager.isMuted ? 'OFF' : 'ON'}`,
      `VOLUME: ${Math.round(this.audioManager.volume * 100)}%`,
      `KEYBOARD: ${getKeyboardLayoutLabel(this.settings.keyboardLayout)}`,
      'BACK',
    ];

    this.optionTexts.forEach((text, index) => {
      text.setText(labels[index]);
      text.setFill(index === this.selectedIndex ? '#FFFFFF' : '#888888');
    });
  }

  moveSelection(direction) {
    this.audioManager.play('select');
    this.selectedIndex += direction;

    if (this.selectedIndex < 0) this.selectedIndex = this.optionTexts.length - 1;
    if (this.selectedIndex >= this.optionTexts.length) this.selectedIndex = 0;

    this.refreshOptions();
  }

  adjustSelected(delta) {
    const selectedKey = this.optionDescriptors[this.selectedIndex].key;

    if (selectedKey === 'mute') {
      this.audioManager.toggleMute();
      this.refreshOptions();
      return;
    }

    if (selectedKey === 'volume') {
      const nextVolume = Math.max(0, Math.min(1, this.audioManager.volume + delta));
      this.audioManager.setVolume(nextVolume);
      this.audioManager.play('select');
      this.refreshOptions();
      return;
    }

    if (selectedKey === 'keyboardLayout') {
      this.settings = saveSettings({
        keyboardLayout: getNextKeyboardLayout(this.settings.keyboardLayout, delta > 0 ? 1 : -1),
      });
      this.audioManager.play('select');
      this.refreshOptions();
    }
  }

  activateSelected() {
    const selectedKey = this.optionDescriptors[this.selectedIndex].key;

    if (selectedKey === 'mute') {
      this.audioManager.toggleMute();
      this.refreshOptions();
      return;
    }

    if (selectedKey === 'keyboardLayout') {
      this.settings = saveSettings({
        keyboardLayout: getNextKeyboardLayout(this.settings.keyboardLayout, 1),
      });
      this.audioManager.play('select');
      this.refreshOptions();
      return;
    }

    if (selectedKey === 'back') {
      this.close();
    }
  }

  handlePointerSelection(selectedKey) {
    if (selectedKey === 'mute') {
      this.audioManager.toggleMute();
      this.refreshOptions();
      return;
    }

    if (selectedKey === 'volume') {
      this.audioManager.cycleVolume();
      this.refreshOptions();
      return;
    }

    if (selectedKey === 'keyboardLayout') {
      this.settings = saveSettings({
        keyboardLayout: getNextKeyboardLayout(this.settings.keyboardLayout, 1),
      });
      this.audioManager.play('select');
      this.refreshOptions();
      return;
    }

    if (selectedKey === 'back') {
      this.close();
    }
  }

  close() {
    if (this.isClosing) {
      return;
    }

    this.isClosing = true;
    this.scene.stop();
    this.scene.resume(this.parentScene);
  }
}

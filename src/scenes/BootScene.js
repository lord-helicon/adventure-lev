import Phaser from 'phaser';
import AudioManager from '../utils/AudioManager.js';

/**
 * Boot Scene - Initial loading
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading text
    const loadingText = this.add.text(160, 90, 'LOADING...', {
      fontSize: '16px',
      fill: '#FFFFFF',
      fontFamily: '"Courier New", monospace',
    });
    loadingText.setOrigin(0.5);
  }

  create() {
    // Small delay then start preload
    this.time.delayedCall(500, () => {
      this.scene.start('PreloadScene');
    });
  }
}

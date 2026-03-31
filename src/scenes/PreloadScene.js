import Phaser from 'phaser';
import { createAssets } from '../utils/assetGenerator.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Create pixel art assets dynamically
    createAssets.call(this);
  }

  create() {
    this.scene.start('MenuScene');
  }
}

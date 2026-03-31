import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import PauseScene from './scenes/PauseScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const config = {
  type: Phaser.CANVAS,
  render: {
    pixelArt: true,
    antialias: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 320,
    height: 180,
    zoom: 2, // Scale up for better visibility
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false,
      tileBias: 8,
    },
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, PauseScene, GameOverScene],
  backgroundColor: '#1a1a2e',
};

const game = new Phaser.Game(config);

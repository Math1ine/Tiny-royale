import GameScene from './scene/GameScene.js';

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#1f1f2e',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [ GameScene ]
};

window.game = new Phaser.Game(config);
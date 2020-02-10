import play from './play.js';
import menu from './menu.js';
import gameover from './gameover.js';

var config = {
  type: Phaser.AUTO,
  width: 1150,
  height: 690,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: {
              y: 500
          },
          debug: true
      }
  },
  render: {
    pixelArt: true
  },

  scene: [menu, play, gameover]
};

var game = new Phaser.Game(config);


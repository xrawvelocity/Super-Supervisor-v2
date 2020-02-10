//TEMPORARY TEST TO BE REPLACED BY GAMEOVER THIS IS MENU
import {score} from './globals.js';
export default new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function menu() {
        Phaser.Scene.call(this, {
            key: 'gameover',
            active: false
        });
    },
    init() {
        this.CONFIG = this.sys.game.CONFIG;
    },
    preload: function() {
        this.load.bitmapFont('Click-Pixel', 'assets/fonts/click.png', 'assets/fonts/click.xml');
        this.load.audio('menuMusic', '../assets/sound effects/menuMusic.mp3');
        this.load.image('fired', '../assets/fired.png');
    },
  
    create() {
  
        // Music
        this.music = this.sound.add('menuMusic', {
            mute: false,
            volume: 0.5,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        });
  
        this.music.play();

        // Background
        this.add.image(0,0, 'titleBg').setDepth(0).setOrigin(0).setScale(0.618);
        this.add.image(50,50,'fired').setDepth(1).setOrigin(0).setScale(0.25);
  
        // Game Over title
        this.add.bitmapText(
            Math.round(0.4 * 1150),
            Math.round(0.23 * 690),
            'Click-Pixel',
            'Game Over',
            64
        );
        // Click to play text
        let restartButton = this.add.bitmapText(
            Math.round(0.295 * 1150),
            Math.round(0.47 * 690),
            'Click-Pixel',
            'click to go to main menu',
            48
        );

        // Score text
        this.add.bitmapText(
            Math.round(0.36 * 1150),
            Math.round(0.68 * 690),
            'Click-Pixel',
            `Your score was: ${score.value}`,
            48
        );
  
        // Make play button interactive
        
        restartButton.setInteractive();

        restartButton.on('pointerover', ()=>{
            restartButton.setScale(1.2);
            restartButton.x = Math.round(0.245 * 1150);
            restartButton.y = Math.round(0.46 * 690);
        });

        restartButton.on('pointerout', ()=>{
            restartButton.setScale(1);
            restartButton.x = Math.round(0.295 * 1150);
            restartButton.y = Math.round(0.47 * 690);
        });

        restartButton.on('pointerup', ()=>{
            location.reload();
        });
    }
  });
  
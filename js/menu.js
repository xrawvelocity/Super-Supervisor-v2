
//################ menu.js

export default new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function menu() {
        Phaser.Scene.call(this, {
            key: 'menu',
            active: true
        });
    },
    init() {
        this.CONFIG = this.sys.game.CONFIG;
    },
    preload: function() {
        this.load.image('titleBg', '../assets/officebg.jpeg');
        this.load.bitmapFont('Click-Pixel', '../assets/fonts/click.png', '../assets/fonts/click.xml');
        this.load.audio('menuMusic', '../assets/sound effects/menuMusic.mp3');
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
  
        // Game title
        this.add.bitmapText(
            Math.round(0.315 * 1150),
            95,
            'Click-Pixel',
            'Super Supervisor',
            64
        );
        // Click to play text
        let playButton = this.add.bitmapText(
            Math.round(0.405 * 1150),
            Math.round(0.35 * 690),
            'Click-Pixel',
            'click to play',
            48
        );

        // instructions text
        this.add.bitmapText(
            Math.round(0.009 * 1150),
            Math.round(0.52 * 690),
            'Click-Pixel',
            `             Instructions :
            Your mission is to avoid the enemies as they come towards you.
            The longer you stay alive the more your score increases.
            Use W or the up arrow to jump.
            Use A and D or the left arrow and right arrow to move.
            Hold down SHIFT as you move to run.
            Good luck.`,
            32,
            1
        );
  
        // Make play button interactive
        
        playButton.setInteractive();

        playButton.on('pointerover', ()=>{
            playButton.setScale(1.2);
            playButton.x = Math.round(0.385 * 1150);
            playButton.y = Math.round(0.34 * 690);
        });

        playButton.on('pointerout', ()=>{
            playButton.setScale(1);
            playButton.x = Math.round(0.405 * 1150);
            playButton.y = Math.round(0.35 * 690);
        });

        playButton.on('pointerup', ()=>{
            this.music.stop();
            this.scene.start('play');
        });

    }
  });
  
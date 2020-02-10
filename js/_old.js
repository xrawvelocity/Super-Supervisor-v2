//################ globals.js

// Any variables that need to be accessed from multiple scenes or systems can go here

module.exports = {
  score: 0,
  difficulty: 9001
}


//################ game.js

const play = require('./play')
const menu = require('./menu')
const gameover = require('./gameover')

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

  scene: [menu, play, gameover]
};

var game = new Phaser.Game(config);


//################ menu.js

module.exports = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function menu() {
      Phaser.Scene.call(this, {
          key: 'menu',
          active: false
      })
  },
  init() {
      this.CONFIG = this.sys.game.CONFIG;
  },
  preload: function() {},

  create() {

      // Background
      this.createBackground();

      // Game title
      this.title = new Text(
          this,
          this.CONFIG.centerX,
          175,
          'Super Supervisor',
          'title'
      );
      // Click to play text
      this.text = new Text(
          this,
          this.CONFIG.centerX,
          this.CONFIG.centerY,
          'click to play',
          'standard'
      );

      // Create mouse input
      this.createMouseInput();

      // Create keyboard input
      this.createKeyboardInput();

  },

  createBackground() {
      this.bg = this.add.graphics({ x: 0, y: 0 });
      this.bg.fillStyle('0xF4CCA1', 1);
      this.bg.fillRect(0, 0, this.CONFIG.width, this.CONFIG.height);
  },

  createMouseInput() {
      this.input.on('pointerup', this.goPlay, this);
  },

  createKeyboardInput() {
      const handleKeyUp = (e) => {
          switch (e.code) {
              case 'Enter':
                  this.goPlay();
                  break;
          }
      };
      this.input.keyboard.on('keyup', handleKeyUp, this);
  },

  goPlay() {
      this.scene.start('Play');
  }
})


// ############ play.js

let globals = require('./globals')

//You can access the globals via the imported file,  all scenes would be using the same instance of the globals

let map, player, bullets, cursors, enemies, office, coinLayer, text, startingTime, currentTime, hurt, jump, wKey, sKey, aKey, dKey;
let enemyArr = [];
let bulletArr = [];
var score = 0;
var health = 100;

module.exports = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function play() {
      Phaser.Scene.call(this, {
          key: 'play',
          active: false
      });
  },
  ///////////


  preload() {
      //IMAGES
      // map made with Tiled in JSON format
      this.load.tilemapTiledJSON('map', 'assets/officeMap.json');

      // enemies spritesheet 
      this.load.atlas('enemy', 'assets/enemy.png', 'assets/player.json');

      // tiles for map
      this.load.image('terrainPNG', 'assets/Office_furniture_set.png');

      // player animations
      this.load.atlas('player', 'assets/player1.png', 'assets/player.json');
      this.load.image('bullet', 'assets/bullet.png');
      // SOUNDS
      // player hurt sound
      this.load.audio('hurtSnd', 'assets/sound effects/Player_hurt.ogg');
      this.load.audio('jumpSnd', 'assets/sound effects/Player_jump.ogg');
      this.load.audio('musicSnd', 'assets/sound effects/soundtrack.mp3');
  },


  create() {

      ////////////////////////////////////////////////////////////////
      //IMPORTANT VARIABLES AND PHYSICS

      let gameOverText = this.add.text(game.config.width / 2, game.config.height / 2, 'GAME OVER', {
          fontSize: '40px',
          fill: '#fff',
          backgroundColor: '#000'
      });
      gameOverText.setOrigin(0.5);
      gameOverText.setDepth(1);
      gameOverText.visible = false;

      cursors = this.input.keyboard.createCursorKeys();

      wKey = this.input.keyboard.addKey('W');
      sKey = this.input.keyboard.addKey('S');
      aKey = this.input.keyboard.addKey('A');
      dKey = this.input.keyboard.addKey('D');

      //sounds
      hurt = this.sound.add('hurtSnd');
      jump = this.sound.add('jumpSnd');

      music = this.sound.add('musicSnd', {
          mute: false,
          volume: 1,
          rate: 1,
          detune: 0,
          seek: 0,
          loop: true,
          delay: 0
      });

      // music.play();

      //Starting time
      startingTime = new Date().getTime();

      // load the map 
      map = this.make.tilemap({
          key: 'map'
      });

      // tiles for the ground layer
      office = map.addTilesetImage('test', 'terrainPNG');
      map.createDynamicLayer('default2', office, 0, 0).setScale(2.9);
      map.createStaticLayer('default', office, 0, 0).setScale(2.9);

      // set the boundaries of our game world
      this.physics.world.bounds.width = 1150;
      this.physics.world.bounds.height = 600;

      // create the player sprite    
      player = this.physics.add.sprite(200, 400, 'player', 64, 64);
      player.setBounce(0.1); // our player will bounce from items
      player.setCollideWorldBounds(true); // don't go out of the map    
      // small fix to our player images, we resize the physics body object slightly
      player.body.setSize(32, 45);
      player.setScale(2);
      player.body.immovable = true;
      // player will collide with the level tiles 
      this.physics.add.collider(map, player);
      // set bounds so the camera won't go outside the game world
      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      // make the camera follow the player
      this.cameras.main.startFollow(player);

      //bullet group
      bullets = this.physics.add.group();


      //////////////////////////////////////////////////


      //////////////////////////////////////////////////
      //ANIMATIONS


      // player walk animation
      this.anims.create({
          key: 'walk',
          frames: this.anims.generateFrameNames('player', {
              prefix: 'p1_walk',
              start: 1,
              end: 9,
              zeroPad: 2
          }),
          frameRate: 10,
          repeat: -1
      });
      // player idle animation
      this.anims.create({
          key: 'idle',
          frames: [{
              key: 'player',
              frame: 'p1_stand'
          }],
          frameRate: 10,
      });
      // player jumping animation
      this.anims.create({
          key: 'jump',
          frames: [{
              key: 'player',
              frame: 'p1_jump'
          }],
          frameRate: 10,
      });
      // player shooting animation
      this.anims.create({
          key: 'shoot',
          frames: [{
              key: 'player',
              frame: 'p1_shoot'
          }],
          frameRate: 10,

      });
      //player dying animation
      this.anims.create({
          key: 'fall',
          frames: this.anims.generateFrameNames('player', {
              prefix: 'p1_fall',
              start: 1,
              end: 6,
              zeroPad: 2
          }),
          frameRate: 10,
          repeat: -1
      });


      // enemy walking animation
      this.anims.create({
          key: 'walkEnemy',
          frames: this.anims.generateFrameNames('enemy', {
              prefix: 'p1_walk',
              start: 1,
              end: 9,
              zeroPad: 2
          }),
          frameRate: 10,
          repeat: -1
      });

      //////////////////////////////////////////////////


      //////////////////////////////////////////////////
      //SCORE

      scoreText = this.add.text(20, 60, 'Score: ', {
          fontSize: '35px',
          fill: '#fff',
          backgroundColor: '#000'
      });
      text = this.add.text(140, 60, score, {
          fontSize: '35px',
          fill: '#fff',
          backgroundColor: '#000'
      });
      // fix the text to the camera
      text.setScrollFactor(0);

      //////////////////////////////////////////////////


      //////////////////////////////////////////////////
      //HEALTH

      healthNumber = this.add.text(160, 20, health, {
          fontSize: '35px',
          fontWeight: '500',
          backgroundColor: '#000'
      });

      healthText = this.add.text(20, 20, 'Health: ', {
          fontSize: '35px',
          fontWeight: '500',
          backgroundColor: '#000'
      });


      healthNumber.setScrollFactor(0);

      //////////////////////////////////////////////////


      //////////////////////////////////////////////////
      //ENEMY SPAWNING

      enemy = this.physics.add.group();

      setInterval(() => {
          if (enemyArr.length <= 3) {
              var x = Phaser.Math.Between(800, 1000);
              enemy = this.physics.add.sprite(x, 0, 'enemy');
              enemy.setVelocity(Phaser.Math.Between(-500, -100), 100);
          }
          this.physics.world.bounds.width = office.width;
          this.physics.world.bounds.height = 600;

          enemy.body.setSize(32, 45);
          enemy.setScale(2);
          enemy.setBounce(0.6);
          enemy.setCollideWorldBounds(true);
          enemy.body.immovable = true;

          enemy.allowGravity = true;
          enemyArr.push(enemy);
          this.physics.add.collider(player, enemy, damage, null, this);

          enemyArr.forEach((enem, i) => {

              if (enem.body.position.x > 1150) {
                  enemyArr.splice(i, 1);
                  enem.disableBody(true, true);

              }
          });

      }, 1000);

      this.physics.add.collider(player, enemy, damage, null, this);

      //////////////////////////////////////////////////


      //////////////////////////////////////////////////
      //SHOOTING

      //lol nvm

      //////////////////////////////////////////////////    

  },
  update(time, delta) {

      //////////////////////////////////////////////////
      //SCORE

      currentTime = new Date().getTime();
      score += Math.floor(Math.floor((currentTime - startingTime)) / 2000);
      score = Math.floor(score / 1.2);
      text = this.add.text(140, 60, score, {
          fontSize: '35px',
          fill: '#fff',
          backgroundColor: '#000'
      });

      //////////////////////////////////////////////////


      //////////////////////////////////////////////////
      //HEALTH NUMBER AND GAME OVER

      if (health > 70) {
          healthNumber.setFill('#0f0');
      }

      if (health > 30 && health <= 70) {
          healthNumber.setFill('#ff0');
      }

      if (health <= 30) {
          healthNumber.setFill('#f00');
      }

      //****************************************************************/
      // if(health < -1){
      //     //gameOverText.visible = true;
      //     // player.anims.play('fall', true);
      //     // setTimeout(() => {
      //     //     
      //     // }, 500);
      //     if(confirm(`THE OFFICE WAS TAKEN OVER \n \n Your score was ${score} \n \n Click ok to restart`)){
      //         location.reload();
      //     }else{
      //         if(confirm(`Just click ok please`)){
      //             location.reload();
      //         }
      //     }

      //     setTimeout(() => {
      //         this.gameOver();
      //     }, 2000);
      // }
      //*****************************************************************/
      //////////////////////////////////////////////////


      //////////////////////////////////////////////////
      //ENEMY SPRITE ANIMATION

      enemyArr.forEach(i => {
          if (i.body.velocity.x < 0) {
              i.anims.play('walkEnemy', true); // walk left
              i.flipX = true;
          } else if (i.body.velocity.x > 0) {
              i.anims.play('walkEnemy', true);
              i.flipX = false;
          } else {
              console.log('no');
          }
      });

      //////////////////////////////////////////////////


      //////////////////////////////////////////////////
      //PLAYER MOVEMENT AND JUMPING

      if (cursors.left.isDown || aKey.isDown) {
          player.body.setVelocityX(-200);
          player.anims.play('walk', true); // walk left
          player.flipX = true; // flip the sprite to the left
      } else if (cursors.right.isDown || dKey.isDown) {
          player.body.setVelocityX(200);
          player.anims.play('walk', true);
          player.flipX = false; // use the original sprite looking to the right
          if (player.body.x > 1100) {
              player.body.setVelocity(0);

          }
      }

      //player running
      else if (cursors.left.isDown || aKey.isDown && cursors.shift.isDown) {
          player.body.setVelocityX(-200);
          player.anims.play('walk', true); // walk left
          player.flipX = true; // flip the sprite to the left
      } else if (cursors.right.isDown || dKey.isDown && cursors.shift.isDown) {
          player.body.setVelocityX(200);
          player.anims.play('walk', true);
          player.flipX = false; // use the original sprite looking to the right
      }

      //player idle
      else if (player.body.onFloor()) {
          player.body.setVelocityX(0);
          player.anims.play('idle', true);
      }

      // jump 
      if (cursors.up.isDown || wKey.isDown && player.body.onFloor()) {
          jump.play();
          player.anims.play('jump', true);
          player.body.setVelocityY(-500);
      } else if (!player.body.onFloor() && player.y < 500) {
          player.anims.play('jump', true);
      }
      if (player.body.x >= 1100) {
          player.body.x = 1100;
      }
      if (player.body.x >= 1100) {
          player.body.x = 1100;
      }

      if (cursors.space.isDown) {
          player.anims.play('shoot', true);
          if (bulletArr < 1) {
              if (player.flipX == false) {
                  bullet = bullets.create(player.body.x, player.body.y + 20, 'bullet', 64, 64);
                  bullet.body.setVelocity(1000, 0);
                  bulletArr.push(bullet);
                  bullet.body.gravity.y = -400;
                  bullet.setBounce(0.1); // our bullet will bounce from items
                  bullet.setCollideWorldBounds(true); // don't go out of the map    
                  // small fix to our bullet images, we resize the physics body object slightly
                  bullet.body.setSize(32, 45);
                  bullet.setScale(0.03);

              } else if (player.flipX == true) {
                  bullet = bullets.create(player.body.x, player.body.y + 20, 'bullet', 64, 64);
                  bullet.body.setVelocity(-1000, 0);
                  bulletArr.push(bullet);
                  bullet.body.gravity.y = -400;
                  bullet.setBounce(0.1); // our bullet will bounce from items
                  bullet.setCollideWorldBounds(true); // don't go out of the map    
                  // small fix to our bullet images, we resize the physics body object slightly
                  bullet.body.setSize(32, 45);
                  bullet.setScale(0.03);

              }


              console.log(bulletArr);
          }
          bulletArr.forEach((bullet, i) => {

              if (bullet.body.position.x > 1150) {
                  bulletArr.splice(i, 1);
                  bullet.disableBody(true, true);

              }
          });
          bulletArr.forEach((bullet, i) => {
              console.log(bullet.body.position.x, i);
              if (bullet.body.position.x < 10) {
                  bulletArr.splice(i, 1);
                  bullet.disableBody(true, true);

              }
          });

          //////////////////////////////////////////////////
      }
  },

  addScore() {
      const startTime = new Date();
      console.log(startTime.getTime());

  },
  damage() {
      player.y -= 10;
      hurt.play();
      player.setTint(0xff0000);
      setTimeout(() => {
          player.setTint();
      }, 100);

      player.anims.play('turn');

      health -= 3;
      healthNumber.setText(health);
  },

  showGameOve() {
      this.scene.start('gameover');
      //hide UI elements

      //show the game over overlay

      //listen to events from game over scene
  }
});




///////////////////////////////////////
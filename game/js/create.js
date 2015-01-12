"use strict";

GameCycle.create = function() {

  game.world.bounds.setTo(0, 0, Globals.worldSize.x, Globals.worldSize.y);
  game.camera.setBoundsToWorld();
  game.camera.x = Globals.worldSize.x/2 - game.camera.width / 2;
  game.camera.y = Globals.worldSize.y - game.camera.height;

  // Background and stuff
  var bgCloud = game.add.sprite(Globals.worldSize.x/2, Globals.worldSize.y, 'bgCloud');
  bgCloud.anchor.setTo(0.5, 1.0);
  bgCloud.fixedToCamera = false;
  var bgCity = game.add.sprite(Globals.worldSize.x/2, Globals.worldSize.y, 'bgCity');
  var cityRatio = (Globals.worldSize.x/bgCity.width) * 2;
  bgCity.width *= cityRatio;
  bgCity.height *= cityRatio;
  bgCity.anchor.setTo(0.5, 1.0);
  bgCity.fixedToCamera = false;

  var bgCity2 = game.add.sprite(Globals.worldSize.x/2, Globals.worldSize.y, 'bgCity2');
  var cityRatio = (Globals.worldSize.x/bgCity2.width) * 1;
  bgCity2.width *= cityRatio;
  bgCity2.height *= cityRatio;
  bgCity2.anchor.setTo(0.5, 1.0);
  bgCity2.fixedToCamera = false;

  for( var i=1; i<=9; i++ ) {
    var cloud = game.add.sprite(Globals.worldSize.x/2 + Globals.initialCloudPositions[i-1].x, Globals.initialCloudPositions[i-1].y, 'cloud'+i);
    cloud.anchor.setTo(0.5, 0.5);
    cloud.scale.setTo(1.8,1.8);
    cloud.vx = Globals.initialCloudPositions[i-1].vx;
    Entities.bgClouds.push(cloud);
  }

  // For most stuff
  game.physics.startSystem(Phaser.Physics.ARCADE);
  // For particles
  game.physics.startSystem(Phaser.Physics.NINJA);
  game.physics.ninja.gravity = 0.2;

  //  The bullet group
  Entities.ownBullets = game.add.group();
  Entities.ownBullets.cycle = 0;
  Entities.ownBullets.maxCycle = 100-1;
  Entities.ownBullets.enableBody = true;
  Entities.ownBullets.physicsBodyType = Phaser.Physics.ARCADE;
  Entities.ownBullets.createMultiple(Entities.ownBullets.maxCycle+1, 'bullet');
  Entities.ownBullets.setAll('anchor.x', 0.5);
  Entities.ownBullets.setAll('anchor.y', 0.5);
  Entities.ownBullets.setAll('outOfBoundsKill', false);
  Entities.ownBullets.setAll('checkWorldBounds', false);
  Entities.ownBullets.forEach(function(b){
    b.body.setSize(b.height, b.width, 0, 0);
  });

  //  The bullet group
  Entities.bullets = game.add.group();
  Entities.bullets.cycle = 0;
  Entities.bullets.maxCycle = 300-1;
  Entities.bullets.enableBody = true;
  Entities.bullets.physicsBodyType = Phaser.Physics.ARCADE;
  Entities.bullets.createMultiple(Entities.bullets.maxCycle+1, 'bullet');
  Entities.bullets.setAll('anchor.x', 0.5);
  Entities.bullets.setAll('anchor.y', 0.5);
  Entities.bullets.setAll('outOfBoundsKill', false);
  Entities.bullets.setAll('checkWorldBounds', false);
  Entities.bullets.forEach(function(b){
    b.body.setSize(b.height, b.width, 0, 0);
  });

  //  The bomb group
  Entities.bombs = game.add.group();
  Entities.bombs.cycle = 0;
  Entities.bombs.maxCycle = 200-1;
  Entities.bombs.enableBody = true;
  Entities.bombs.physicsBodyType = Phaser.Physics.ARCADE;
  Entities.bombs.createMultiple(Entities.bombs.maxCycle+1, 'bomb');
  Entities.bombs.setAll('anchor.x', 0.5);
  Entities.bombs.setAll('anchor.y', 0.5);
  Entities.bombs.setAll('outOfBoundsKill', false);
  Entities.bombs.setAll('checkWorldBounds', false);
  Entities.bombs.forEach(function(b){
    b.body.setSize(b.height, b.width, 0, 0);
  });

  // EnemySetup is run based on data from the server
  //enemySetup(enemyType);


  // Small explosions (bullets)
  Entities.smallExplosions = game.add.group();
  Entities.smallExplosions.createMultiple(100, 'smallExplosion');
  Entities.smallExplosions.callAll('animations.add', 'animations', 'smallExplosion');
  Entities.smallExplosions.forEach(function(e){
    e.anchor.setTo(0.5, 0.5);
  });

  // Large explosions (aliens)
  Entities.largeExplosions = game.add.group();
  Entities.largeExplosions.createMultiple(50, 'largeExplosion');
  Entities.largeExplosions.callAll('animations.add', 'animations', 'largeExplosion');
  Entities.largeExplosions.forEach(function(e){
    e.anchor.setTo(0.4, 0.6);
  });

  // Shoot explosions
  Entities.shootExplosions = game.add.group();
  Entities.shootExplosions.createMultiple(30, 'shootExplosion');
  Entities.shootExplosions.callAll('animations.add', 'animations', 'shootExplosion');
  Entities.shootExplosions.forEach(function(e){
    e.anchor.setTo(0.5, 0.5);
  });


  // Status Text (Game Over)
  UI.stateTextHolder = document.getElementById('game-over');
  UI.stateText = document.getElementById('game-over-text');

  // Score
  UI.scoreTextHolder = document.getElementById('game-score');
  UI.scoreText = document.getElementById('game-score-text');
  Scene.updateScore();

  // LevelUp
  UI.progressBarHolder = document.getElementById('game-progress');
  UI.progressBar = document.getElementById('game-progress-bar');

  // FPS Counter
  UI.fpsText = game.add.text(
      20, 35, '', { font: '16px InputMono', fill: '#ffffff' }
  );
  game.time.advancedTiming = true; // Calculates FPS
  UI.fpsText.fixedToCamera = true;
  UI.fpsText.visible = false;

  // Ping Counter
  UI.pingText = game.add.text(
    20, 65, '', { font: '16px InputMono', fill: '#ffffff' }
  );
  UI.pingText.fixedToCamera = true;
  UI.pingText.visible = false;

  //  And some controls to play the game with
  Controls.cursors = { up:    game.input.keyboard.addKey(Phaser.Keyboard.UP),
              down:  game.input.keyboard.addKey(Phaser.Keyboard.DOWN),
              left:  game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
              right: game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)}

  Controls.altCursors = {up:    game.input.keyboard.addKey(Phaser.Keyboard.W),
                down:  game.input.keyboard.addKey(Phaser.Keyboard.S),
                left:  game.input.keyboard.addKey(Phaser.Keyboard.A),
                right: game.input.keyboard.addKey(Phaser.Keyboard.D)};

  Controls.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  // Connect to the server
  connectToServer();


  // In mobile there are no FX or sound
  if( Utils.isMobile() ) {
    Globals.explosionsEnabled = false;
    //game.sound.noAudio = true;
    document.getElementById('game-holder').className = 'mobile';
  } else {
    Globals.explosionsEnabled = true;
    //game.sound.noAudio = false;
    document.getElementById('game-holder').className = '';
  }

  game.sound.mute = true;

  if( ! game.sound.noAudio ) {
    // Effects
    Sounds.shootSound = game.add.audio('shoot');
    Sounds.shootSound.volume = 0.25;
    Sounds.explosionSound = game.add.audio('explosion');
    Sounds.explosionSound.volume = 0.4;
    Sounds.bigExplosionSound = game.add.audio('bigExplosion');
    Sounds.bigExplosionSound.volume = 1.0;
    Sounds.levelUpSound = game.add.audio('levelUp');
    Sounds.levelUpSound.volume = 2.0;


    // Music!
    Sounds.music = game.add.audio('journey');
    Sounds.music.volume = 0.35;
    Sounds.music.loop = true;
    Sounds.music.autoplay = true;
  }

  Callbacks.onGameLoaded();

};


GameCycle.disableGameControls = function() {
  game.input.disabled = true;
};


GameCycle.enableGameControls = function() {
  game.input.disabled = false;
};


GameCycle.showGameUI = function() {
  UI.progressBarHolder.style.display = 'block';
  UI.scoreTextHolder.style.display = 'block';
};

GameCycle.showDebugUI = function() {
  UI.fpsText.visible = true;
  UI.pingText.visible = true;
};
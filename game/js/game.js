"use strict";

var nowTime = new Date()*1;
var lastSimulationTime = nowTime;
var deltaTime = nowTime - lastSimulationTime;

GameCycle.update = function() {

  nowTime = new Date()*1;
  deltaTime = nowTime - lastSimulationTime;

  if( typeof Entities.player === 'object' ) {
    Player.handleMovement(deltaTime);
    Player.handleShooting(deltaTime);
  }

  moveEnemies(deltaTime);
  moveBombs(deltaTime);
  moveBullets(deltaTime);
  Teammates.moveTeammates(deltaTime);

  // Run collisions for animation (bombs and bullets)

  for( var type in Globals.enemyType ) {
    if( typeof Entities.enemies[type] === 'object' ) {
      game.physics.arcade.overlap(Entities.ownBullets, Entities.enemies[type], enemyGotShot, null, this);
      game.physics.arcade.overlap(Entities.bullets, Entities.enemies[type], enemyGotShot, null, this);
    }
  }

  // Scenery
  Scene.moveClouds(deltaTime);

  // Update the Player's Score
  Scene.updateScore();

  // Update FPS and Ping
  if( game.time.fps !== 0 ) {
    UI.fpsText.setText(game.time.fps + ' FPS');
  }
  UI.pingText.setText(latency + ' ms');


  lastSimulationTime = nowTime;
}

GameCycle.render = function() {

  Teammates.updateLabels();

}

GameCycle.resetBullet = function(bullet) {

  //  Called if the bullet goes out of the screen
  bullet.kill();

}


GameCycle.restart = function() {

  Entities.player.level = 1;
  Player.updateSprite();
  Entities.player.revive();

  // Hides the game over
  UI.stateTextHolder.style.display = 'none';

  Connection.emit('playerRevive', { at: Utils.getServerTime() })

  // Restore the volume back to normal
  game.sound.volume = 1.0;

}

window.initGame = function(serverUrl, assetsUrl) {

  Globals.serverUrl = serverUrl;
  Globals.assetsUrl = assetsUrl;

  var recalculateCanvasSize = function() {
    Globals.canvasWidth = Math.min(window.innerWidth, Globals.defaultCanvasWidth);
    Globals.canvasHeight = Math.min(window.innerHeight - 50, Globals.defaultCanvasHeight);
  };

  var handleResize = function() {
    recalculateCanvasSize();

    if( typeof game.camera === 'undefined' || game.camera === null ) { return; }
    if( typeof game.renderer === 'undefined' || game.renderer === null ) { return; }
      
    game.camera.width = Globals.canvasWidth;

    if( typeof Entities.player === 'undefined' || Entities.player === null ) {
      game.camera.x = Globals.worldSize.x / 2 + game.camera.width / 2;
      game.camera.y = Globals.worldSize.y - game.camera.height;
    }

    game.renderer.resize(Globals.canvasWidth, Globals.canvasHeight);
  };

  recalculateCanvasSize();

  window.game = new Phaser.Game(Globals.canvasWidth, Globals.canvasHeight,
    Phaser.AUTO,
    'invaders-game', {
      preload: GameCycle.preload,
      create: GameCycle.create,
      update: GameCycle.update,
      render: GameCycle.render
    },
    true,
    true);

  handleResize();
  window.onresize = handleResize;

};
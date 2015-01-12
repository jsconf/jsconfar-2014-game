"use strict";

// All users have a specific ID so we can keep track of them across sessions
Globals.userId = Utils.getCookie('invaders');
if( typeof Globals.userId !== 'string' || Globals.userId === null || Globals.userId === '' ) {
  Globals.userId = Utils.setCookie('invaders', Utils.makeId(32));
}
Globals.publicId = null;

// Connect to the Socket.IO server
var Connection = null;
var latency = 0;


function startGame(playerName, options) {

  if( typeof Connection === 'undefined' || Connection === null ) {
    return;
  }
  if( typeof options !== 'object' ) {
    options = {};
  }

  if( typeof options.onPlayerDead === 'function' ) {
    Callbacks.onPlayerDead = options.onPlayerDead;
  }
  if( typeof options.onEnemyDead === 'function' ) {
    Callbacks.onEnemyDead = options.onEnemyDead;
  }

  GameCycle.enableGameControls();
  GameCycle.showGameUI();
  GameCycle.showDebugUI();

  // Register the player
  Connection.emit('playerStart', {
    name: playerName
  });

  // Start the music
  if( ! game.sound.noAudio ) {
    game.sound.mute = false;
  }
  if( ! game.sound.noAudio && ! game.paused ) {
    Sounds.music.play();
  }

  // Periodically sync with the server
  setInterval(function(){
    if( typeof Entities.player !== 'undefined' && Entities.player.alive ) {
      Connection.emit('positionUpdate', {
        x: Entities.player.x,
        y: Entities.player.y,
        vx: Entities.player.body.velocity.x,
        vy: Entities.player.body.velocity.y,
        at: Utils.getServerTime()
      });
    }
  }, 50);
}



function connectToServer() {
  Connection = io.connect(Globals.serverUrl, { query: "userId=" + Globals.userId });

  Connection.on('connect', function () {
    // Todo: Add a better connection routine
    console.log("Welcome to Attack of the Drones!");

    // Update the server timing
    Connection.emit('gamePing', {clientTime: new Date()*1, version: 2});
  });

  // This syncs important game data
  Connection.on('globalSync', function(data) {
    // Todo: make sure the canvas is bigger than (or equal to) the world
    game.world.width = data.worldSize.x;
    game.world.height = data.worldSize.y;
    Enemies.enemySetup(data.enemyTypes);
    Player.levelSetup(data.playerLevels);
  });

  // This authorizes the player and starts the game
  Connection.on('playerStartOk', function(data){
    Globals.publicId = data.player.id;

    Player.playerSetup();
    Connection.emit('move', {
      x: Entities.player.x,
      y: Entities.player.y,
      vx: Entities.player.body.velocity.x,
      vy: Entities.player.body.velocity.y
    });

  });

  Connection.on('playerConnected', function(data){
    Teammates.teammateSetup(data.player, deltaTime);
  });

  Connection.on('playerDisconnected', function(data){
    Teammates.remove(data.player, deltaTime);
  });

  // Teammates
  Connection.on('syncPlayers', function(data){
    var deltaTime = (new Date()*1) - Utils.getLocalTime(data.at);

    // Todo: handle disconnected players (missing from the list)
    for( var ix in data.players ) {
      if( ! data.players.hasOwnProperty(ix) ){ continue; }
      Teammates.teammateSetup(data.players[ix], deltaTime);
    }
  });

  Connection.on('playerLevelUp', function(data){
    var deltaTime = (new Date()*1) - Utils.getLocalTime(data.at);

    Teammates.teammateSetup(data.player, deltaTime);
  });

  Connection.on('playerMove', function(data){
    var deltaTime = (new Date()*1) - Utils.getLocalTime(data.at);

    Teammates.teammateSetup(data.player, deltaTime);
  });

  Connection.on('playerFire', function(data){
    var deltaTime = (new Date()*1) - Utils.getLocalTime(data.at);

    for( var ix in data.bullets ) {
      Teammates.shootBullet(data.bullets[ix], deltaTime);
    }
  });

  Connection.on('playerDead', function(data){
    var deltaTime = (new Date()*1) - Utils.getLocalTime(data.at);

    if( data.player.id === Globals.publicId ) {
      Player.handlePlayerDamage(Entities.player.health);
    }
    else if( typeof Entities.teammates[data.player.id] !== 'undefined' ) {
      Teammates.teammateSetup(data.player, deltaTime);
    }
  });


  // Resync all Enemies
  Connection.on('syncEnemies', function(data){

    var deltaTime = (new Date()*1) - Utils.getLocalTime(data.at);

    for( var type in data.enemies ) {

      if( typeof Entities.enemies[type] === 'undefined' ){ continue; }

      // Kill all the enemies that aren't in the sync list
      var aliveIds = _.map(data.enemies[type], function(e){ return e.id; });
      Entities.enemies[type].forEachAlive(function(enemy){
        if( ! _.contains(aliveIds, enemy.id) ){
          enemyKill(enemy);
        }
      })

      for( var ix in data.enemies[type] ) {
        spawnEnemy(data.enemies[type][ix], deltaTime);
      }
    }

    // Move the bombs and bullets so the game looks like it's running at 5fps when "paused"
    moveBombs(200);
    moveBullets(200);
  });

  // Resync all Bullets
  /*
  Connection.on('syncBullets', function(data){
    // Todo: Fix the code (it creates huge artifacts)
    return;
    var deltaTime = (new Date()*1) - Utils.getLocalTime(data.at);

    Entities.bullets.forEachAlive(function(b){ b.kill(); })

    for( var ix in data.bullets ) {
      var bullet = Entities.bullets.getFirstDead();
      bullet.reset(data.bullets[ix].x, data.bullets[ix].y);
      bullet.st = Utils.getLocalTime( data.bullets[ix].st );
      bullet.x = data.bullets[ix].x + (deltaTime * data.bullets[ix].vx / 1000);
      bullet.y = data.bullets[ix].y + (deltaTime * data.bullets[ix].vy / 1000);
      bullet.w = data.bullets[ix].w;
      bullet.h = data.bullets[ix].h;
      bullet.rotation = data.bullets[ix].r;
      bullet.d = data.bullets[ix].d;
    }

    Entities.bombs.forEachAlive(function(b){ b.kill(); })

    for( var ix in data.enemyBullets ) {
      var bullet = Entities.bombs.getFirstDead();
      bullet.reset(data.enemyBullets[ix].x, data.enemyBullets[ix].y);
      bullet.st = Utils.getLocalTime( data.enemyBullets[ix].st );
      bullet.sx = data.enemyBullets[ix].sx;
      bullet.sy = data.enemyBullets[ix].sy;
      bullet.vx = data.enemyBullets[ix].vx;
      bullet.vy = data.enemyBullets[ix].vy;
      bullet.x = data.enemyBullets[ix].x;
      bullet.y = data.enemyBullets[ix].y;
      bullet.w = data.enemyBullets[ix].w;
      bullet.h = data.enemyBullets[ix].h;
      bullet.rotation = data.enemyBullets[ix].r;
      bullet.d = data.enemyBullets[ix].d;
    }
  });
  */

  // New/Updated Enemy
  Connection.on('enemySpawn', function(data){
    var deltaTime = (new Date()*1) - Utils.getLocalTime(data.at);

    spawnEnemy(data.enemy, deltaTime);
  });

  // New/Updated Enemy
  Connection.on('enemyUpdate', function(data){
    var deltaTime = (new Date()*1) - Utils.getLocalTime(data.at);

    var enemy = getEnemyById(data.enemy.type, data.enemy.id);
    if( enemy === null ){
      spawnEnemy(data.enemy, deltaTime);
    } else {
      updateEnemyFromServer(enemy, data.enemy, deltaTime);
    }
  });

  // Enemy Shoots
  Connection.on('enemyFire', function(data){
    var deltaTime = (new Date()*1) - Utils.getLocalTime(data.at);

    for( var ix in data.bullets ) {
      shootEnemyBomb(data.bullets[ix], deltaTime);
    }
  });


  // Enemy Damage
  // Todo: Add animations
  // Todo: Enemy hits are reported by every single user, so most of them will count multiple times. Add some sanitization here (a bullet>collision combo can only be reported once)
  // Todo: Add some verification for cheating.
  Connection.on('enemyHit', function(data){
    var enemy = getEnemyById(data.enemy.type, data.enemy.id);
    if( enemy !== null ) {
      enemy.health = data.enemy.health;
    }
  });

  Connection.on('enemyDead', function(data){
    var deltaTime = (new Date()*1) - Utils.getLocalTime(data.at);

    var enemy = getEnemyById(data.enemy.type, data.enemy.id);
    if( enemy !== null ) {
      enemyKill(enemy, deltaTime);
    }
  });


  // Ping!
  Connection.on('gamePong', function(data) {
    // Do a running average
    var now = Date.now()*1;
    latency = (now - data.clientTime);
    // The time difference between this client and the server
    Utils.serverTimeOffset = (data.serverTime - (now - latency / 2));

    setTimeout(function(){
      Connection.emit('gamePing', {clientTime: Date.now()*1, version: 2});
    }, 500);
  });
}

setInterval(Scene.cleanUpStage, 1000);
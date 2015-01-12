// Setup the Server + Socket.io
var SERVER_PORT = 4000;

var express = require('express');
var expressServer = express();

var server = require('http').Server(expressServer);
var io = require('socket.io')(server);

//CORS middleware
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
}

expressServer.use(allowCrossDomain);
//expressServer.use(express.compress());
expressServer.use(express.static(__dirname + '/game'));

server.listen(SERVER_PORT);


var allSockets = [];
var numSockets = 0;
var numPlayers = 0;


// Main Modules
var Entities = require('./server/entities.js');
var Players = require('./server/players.js');
var Enemies = require('./server/enemies.js');
var Simulation = require('./server/simulation.js');
var Collisions = require('./server/collisions.js');
var Utils = require('./server/utilities.js');


// Server Auth
io.set('authorization', function (handshakeData, cb) {
  cb(null, true);
});

io.sockets.on('connection', function(socket){

  // Todo: Handle incorrect handshakes
	if( typeof socket.handshake.query.userId === 'undefined' ) { return; }
	var userId = socket.handshake.query.userId;
  if( typeof userId !== 'string' || userId == '' ){ return; }

  console.log("Player "+ userId +" Connected")

  // Register the player
	var player = null;
  var lastShotAt = 0;
  allSockets.push(socket);

  // Sync the player's data
  socket.on('playerStart', function(data){

    if( typeof data.name !== 'string' ){ return; }

    if( typeof Entities.players[userId] === 'undefined' ) {
      Entities.players[userId] = {
        x: 0.0, y: 0.0,
        vx: 0.0, vy: 0.0,
        w: Entities.playerSize['level1'].w, h: Entities.playerSize['level1'].h,
        name: data.name,
        id: Entities.nextPlayerId,
        health: Entities.playerHealth,
        level: 1,
        score: 0,
        lifeScore: 0,
        updatedAt: (new Date()*1),
        alive: true
      };
      Entities.nextPlayerId++;

      console.log("Player "+ userId +" Started Playing");
    }
    else {
      console.log("Player "+ userId +" Restarted Playing");
    }

    player = Entities.players[userId];

    socket.emit('playerStartOk', {
      'player': player
    });

    // Notify other clients there's a new player
    socket.broadcast.emit('playerConnected', {
      player: player,
      at: (new Date()*1)
    });

  });

  socket.emit('globalSync', {
    'worldSize': Entities.worldSize,
    'enemyTypes': Enemies.enemyType,
    'playerLevels': Players.playerLevels
  });


  // Sync all data for this player
  // Todo: Sync enemies and bullets as well
  syncPlayers(socket);
  syncEnemies(socket);
  //syncBullets(socket);


  socket.on('disconnect', function (data) {

    clearInterval(syncPlayerInterval);
    clearInterval(syncEnemiesInterval);

    if( typeof player !== 'undefined' && player !== null ){ 

      if( typeof Entities.players[userId] !== 'undefined' ) {
        Entities.players[userId].alive = false;

        socket.broadcast.emit('playerDisconnected', { player: Entities.players[userId], at: (new Date()*1) });

        delete Entities.players[userId];
      }
    }

    console.log("Player "+ userId +" Disconnected");

    var index = allSockets.indexOf(socket);
    if( index >= 0 ) {
      allSockets.splice(index, 1);
    }

    syncPlayers(socket);
  });

  // Ping function
  socket.on('gamePing', function(data) {
    if( typeof data === 'undefined' ){ return; }
    if( typeof data.version === 'undefined' ){ return; }
    if( data.version < 2 ){ return; }
    data.serverTime = Date.now()*1;
    data.watching = numSockets;
    socket.emit('gamePong', data);
  });


  // Player Moves
	socket.on('move', function (data) {
    if( player === null ){ return; }
		if( typeof data.x !== 'number' || typeof data.y !== 'number' ){ return; }

		player.x = data.x;
		player.y = data.y;
		player.vx = data.vx;
		player.vy = data.vy;

    // Notify Other Players
    //socket.broadcast.volatile.emit('playerMove', {player: player, at: (new Date()*1)});
	});

  socket.on('positionUpdate', function (data) {
    if( player === null ){ return; }
    if( typeof data.x !== 'number' || typeof data.y !== 'number' ){ return; }

    player.x = data.x;
    player.y = data.y;
    player.vx = data.vx;
    player.vy = data.vy;
  });



  // Player fires
	socket.on('fire', function(data) {
    if( player === null ){ return; }
    if( typeof data.bullets !== 'object' ){ return; }
    // 5 bullets per shot is the maximum. The user is cheating.
    if( data.bullets.length > 5 ){ return; }
    // Prevent the user from firing too frequently. This is one shot every 300ms max. Give 30% or so of tolerance.
    if( (lastShotAt + 300 * 0.7) > Date.now()*1 ){ return; }

		// Bullets come in a list
		for( var ix = 0; ix < data.bullets.length; ix++ ) {
      var bullet = data.bullets[ix];
			Entities.bullets.push({
				x: bullet.x,
				y: bullet.y,
        w: Entities.bulletSize.w,
        h: Entities.bulletSize.h,
				vx: bullet.vx,
				vy: bullet.vy,
        r: bullet.r,
        d: 1,
        p: player.id
			});
		}

    // Notify Other Players
    socket.broadcast.volatile.emit('playerFire', { bullets: data.bullets, at: (Date.now()*1)});

    lastShotAt = Date.now()*1;
	});

  socket.on('playerRevive', function(data) {
    if( player === null ){ return; }
    // Todo: Sync Status better across all sessions
    player.health = Entities.playerHealth;
    player.alive = true;
    player.level = 1;
    player.lifeScore = 0;
    player.w = Entities.playerSize['level1'].w;
    player.h = Entities.playerSize['level1'].h;

    socket.broadcast.volatile.emit('playerRevive', { 'player': player, 'at': (new Date()*1) });
  });



  // Do a full player sync at 20fps
  // Do a state sync frequently to make sure the simulation goes as planned
  var syncPlayerInterval = setInterval(function(){
    if( typeof socket === 'undefined' || socket === null ){ return; }
    syncPlayers(socket);
  }, 50);

  // Do a full enemy sync at 5fps
  // Bullets are not really synced
  // Todo: Use an ArrayBuffer for this (it's much more compact)
  var syncEnemiesInterval = setInterval(function(){
    if( typeof socket === 'undefined' || socket === null ){ return; }
    syncEnemies(socket);
    //syncBullets();
  }, 200);


});



// Sync all players periodically. Optionally, we can only sync a specific socket
function syncPlayers(socket) {
  var at = new Date()*1;

  // Don't leak the session id to other players (prevents logging in as someone else)
  var playerList = [];
  for(var id in Entities.players) {
    playerList.push(Entities.players[id]);
  }

  if( typeof socket === 'undefined' ) {
    io.emit('syncPlayers', { 'players': playerList, 'at': at });
  } else {
    socket.volatile.emit('syncPlayers', { 'players': playerList, 'at': at });
  }
}

// Sync all enemies
function syncEnemies(socket) {
  var at = new Date()*1;

  if( typeof socket === 'undefined' ) {
    io.emit('syncEnemies', { 'enemies': Entities.enemies, 'at': at });
  } else {
    socket.volatile.emit('syncEnemies', { 'enemies': Entities.enemies, 'at': at });
  }
}

// Sync all player and enemy bullets
function syncBullets(socket) {
  var at = new Date()*1;

  if( typeof socket === 'undefined' ) {
    io.emit('syncBullets', { 'bullets': Entities.bullets, 'enemyBullets': Entities.enemyBullets, 'at': at });
  } else {
    socket.volatile.emit('syncBullets', { 'bullets': Entities.bullets, 'enemyBullets': Entities.enemyBullets, 'at': at });
  }
}


// Todo: Kill inactive users after some inactivity time

// Run the simulation loop at 66fps (every 15ms)
// This updates player and enemy positions even when no input has been received
var updateLoopId = null;
var nowTime = new Date()*1;
var lastUpdateTime = new Date()*1;


var volatileEmit = function(event, data){
  for( var i=0; i<allSockets.length; i++ ) {
    if( typeof allSockets[i].volatile === 'undefined' || typeof allSockets[i].volatile.emit !== 'function' ) {
      allSockets[i].volatile.emit(event, data);
    }
  }
};

var gameCycle = function(){

	nowTime = new Date()*1;
  var deltaTime = nowTime - lastUpdateTime;

  Enemies.spawnEnemies(function(data){
    volatileEmit('enemySpawn', {enemy: data, at: nowTime});
  });

  Simulation.simulatePlayerMovement(deltaTime);
  Simulation.simulateBulletMovement(deltaTime);

  Simulation.simulateEnemyMovement(deltaTime, function(enemy){
    if( enemy.alive ) {
      volatileEmit('enemyUpdate', {enemy: enemy, at: nowTime});
    } else {
      io.emit('enemyDead', {enemy: enemy, at: nowTime});
    }
  });

  Enemies.enemyFires(deltaTime, function(bullets){
    io.emit('enemyFire', {'bullets': bullets, 'at': nowTime});
  });


  Collisions.calculateCollisions(function(player, bullet) {
      if( player.alive ) {
      } else {
        io.emit('playerDead', {player: player, bullet: bullet, at: nowTime});
      }

    },
    function( enemy, bullet ){

      var score = Math.min(enemy.value, enemy.value * bullet.d / Enemies.enemyType[enemy.type].health);

      if( enemy.alive ) {
        // Removed, since it's pretty much useless for the client and uses a lot of network
        //volatileEmit('enemyHit', {enemy: enemy, bullet: bullet, score: score, at: nowTime });
      } else {
        // When killing the enemy, the score goes up by a lot
        score = enemy.value;
        io.emit('enemyDead', {enemy: enemy, bullet: bullet, score: score, at: nowTime });
      }

      // Find the owner of the bullet and add some points
      for( var i in Entities.players ) {
        if( Entities.players[i].id == bullet.p ) {
          Entities.players[i].score += score;
          Entities.players[i].lifeScore += score;
          break;
        }
      }
    }
  );

  Players.updatePlayerLevels(function(player){
    volatileEmit('playerLevelUp', {player: player, at: nowTime});
  });

  // Update the number of sockets and players
  numSockets = allSockets.length;
  numPlayers = Object.keys(Entities.players).length;

	lastUpdateTime = nowTime;

  updateLoopId = setTimeout(gameCycle, 15);
};

updateLoopId = setTimeout(gameCycle, 15);

"use strict";

// This keeps track of all enemies
var Entities = require('./entities.js');
var Utils = require('./utilities.js');
var Targeting = require('./targeting.js');
var Simulation = require('./simulation.js');

var enemyType = require('./enemies.types.js').enemyType;
exports.enemyType = enemyType;


exports.kill = function(type, ix) {
  delete Entities.enemies[type][ix];
};


exports.spawnEnemies = function(onSpawn) {

  exports.spawnDroneMini(onSpawn);

  exports.spawnDroneDouble(onSpawn);

  exports.spawnUfo(onSpawn);

};


exports.getDifficulty = function() {
  /**
   * The difficulty multiplier depends on the number of players and their current level. The higher, the harder the game gets
   */

  var averageLevel = 1;
  var sumLevel = 0;
  var numPlayers = 0;
  for( var i in Entities.players ) {
    if( Entities.players[i].alive ) {
      sumLevel += Entities.players[i].level;
      numPlayers++;
    }
  }

  if( sumLevel > 0 && numPlayers > 0 ) {
    averageLevel = sumLevel / numPlayers;
  }

  var numPlayers = numPlayers == 0 ? 1 : numPlayers;
  var multiplier = 1 + (numPlayers - 1) / 2;
  multiplier *= Math.pow(averageLevel, 0.8);

  return {
    numPlayers: numPlayers,
    multiplier: multiplier
  };
};


var basicSpawn = function(type, spawnPosition) {
  var now = new Date()*1;

  var difficulty = exports.getDifficulty();

  // The target count is based on an initial amount of players and two global limits (per player and per game).
  var targetCount = Math.floor(enemyType[type].baseCountPerPlayer * difficulty.multiplier);
  targetCount = Math.min(targetCount, enemyType[type].maxCountPerPlayer * difficulty.numPlayers);
  targetCount = Math.min(targetCount, enemyType[type].maxCount);

  var spawnInterval = enemyType[type].spawnInterval / Math.min(difficulty.multiplier, 5.0);

  // If the quota is full, move the next spawn point forward
  if( Object.keys(Entities.enemies[type]).length >= targetCount ){
    enemyType[type].nextSpawnTime = now + spawnInterval;
    return null;
  }

  if( now <= enemyType[type].nextSpawnTime ){ return null; }

  var enemy = {
    type: type,
    id: enemyType[type].nextId,
    x: spawnPosition.x,
    y: spawnPosition.y,
    w: enemyType[type].width,
    h: enemyType[type].height,
    vx: enemyType[type].initialSpeedX + enemyType[type].speedXVariation * (Math.random() - 0.5),
    vy: enemyType[type].initialSpeedY + enemyType[type].speedYVariation * (Math.random() - 0.5),
    r: - Math.PI / 2,
    health: enemyType[type].health,
    value: enemyType[type].value,
    target: null,
    alive: true
  };


  Entities.enemies[type][ enemyType[type].nextId ] = enemy;

  enemyType[type].nextId += 1;
  enemyType[type].nextSpawnTime = now + spawnInterval;

  return enemy;
};


exports.spawnDroneMini = function(onSpawn) {

  var spawnPosition = Utils.getRandomTopPosition();

  var drone = basicSpawn('droneMini', spawnPosition);
  if( drone === null ){ return; }

  onSpawn(drone);

};


exports.spawnDroneDouble = function(onSpawn) {

  var spawnPosition = Utils.getRandomTopPosition();

  var drone = basicSpawn('droneDouble', spawnPosition);
  if( drone === null ){ return; }

  onSpawn(drone);
};


exports.spawnUfo = function(onSpawn) {

  var spawnPosition = Utils.getOptimalTopPosition();

  var ufo = basicSpawn('ufo', spawnPosition);
  if( ufo === null ){ return; }

  ufo.target = Targeting.findBestPlayerTarget(Entities.players, {x:0, y:-110});

  onSpawn(ufo);
};



exports.enemyFires = function(deltaTime, onFire){

  var now = new Date()*1;

  var newBullets = [];

  for( var type in enemyType ) {

    if( typeof enemyType[type].fires === 'undefined' || ! enemyType[type].fires ){ continue; }

    for( var id in Entities.enemies[type] ) {
      var enemy = Entities.enemies[type][id];

      if( now < enemy.nextFireTime ) { continue; }

      // Shoot as many bullets as necessary
      var totalOffset = (enemyType[type].numBullets - 1) * enemyType[type].bulletOffset;

      for( var i = 0; i < enemyType[type].numBullets; i++ ) {

        // Shoot a bullet from the bottom of the ship
        // Todo: Use the correct sizes for the bombs
        var offset = -(totalOffset / 2) + i * enemyType[type].bulletOffset;

        var bomb = {
          x: enemy.x + offset,
          y: enemy.y + enemyType[type].height / 2 + 20,
          w: 17,
          h: 40,
          r: Math.PI / 2,
          d: 1
        };

        // Starting Position
        bomb.st = new Date() * 1;
        bomb.sx = bomb.x;
        bomb.sy = bomb.y;
        bomb.g = Simulation.gravity;

        // The bullets have a very slight angle based on the horizontal speed of the enemy
        bomb.vx = enemy.vx;
        bomb.vy = enemy.vy + enemyType[type].bulletSpeed;

        // We need a list of new bullets as well as updating the global list
        newBullets.push(bomb);
        Entities.enemyBullets.push(bomb);
      }

      enemy.nextFireTime = now + enemyType[type].firingInterval;
    }

  }

  if( typeof onFire === 'function' ) {
    onFire(newBullets);
  }

};


exports.handleDamage = function(enemy, damage) {

  enemy.health -= damage;
  if( enemy.health <= 0 ){
    enemy.health = 0;
    enemy.alive = false;
  }

};
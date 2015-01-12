"use strict";

exports.gravity = 250.0;

var Utils = require('./utilities.js');
var Entities = require('./entities.js');
var Enemies = require('./enemies.js');
var Targeting = require('./targeting.js');


exports.simulatePlayerMovement = function(deltaTime) {

  for(var id in Entities.players) {
    var player = Entities.players[id];
    player.x += player.vx * deltaTime / 1000.0;
    player.y += player.vy * deltaTime / 1000.0;

    if( typeof player.level !== "number" || typeof Entities.playerSize['level'+player.level] === 'undefined' ) {
      player.level = 1;
    }
    var size = Entities.playerSize['level'+player.level];

    // Stop the player if it goes outside the world bounds
    if( player.x <= size.x/2 ){ player.x = size.x/2; player.vx = 0; }
    if( player.x >= Entities.worldSize.x - size.x/2 ){ player.x = Entities.worldSize.x - size.x/2; player.vx = 0; }
    /*
    if( player.y <= Entities.playerSize.y/2 ){ player.y = Entities.playerSize.y/2; player.vy = 0; }
    if( player.y >= Entities.worldSize.y - Entities.playerSize.y/2 ){ player.y = Entities.worldSize.y - Entities.playerSize.y/2; player.vy = 0; }
    */
  }

};


exports.simulateEnemyMovement = function(deltaTime, onEnemyUpdate) {

  for(var type in Entities.enemies) {
    for( var ix in Entities.enemies[type] ) {

      var enemy = Entities.enemies[type][ix];

      var updated = updateEnemyTarget(enemy);

      if( updated ) {
        onEnemyUpdate( enemy );
      }

      // If the enemy is going to reach the target in this frame, make it jump straight to the target
      if( hasValidTarget(enemy) && distanceToTarget(enemy) <=  Entities.enemyTypes[enemy.type].speed * deltaTime / 1000.0 ){
        jumpToTarget(enemy);
      } else {
        enemy.x += enemy.vx * deltaTime / 1000.0;
        enemy.y += enemy.vy * deltaTime / 1000.0;
      }

      // Kill out of bounds enemies
      if( enemy.x < 0   || enemy.x > Entities.worldSize.x ||
          enemy.y < -20 || enemy.y > Entities.worldSize.y ) {

          enemy.health = 0;
          enemy.alive = false;
          onEnemyUpdate( enemy );

          Enemies.kill( type, ix );
      }

    }
  }

};


/**
 * Updates the enemies target or simply changes aim in case of moving targets (like players)
 */
var updateEnemyTarget = function(enemy) {

  // Most Drones have a specific point target (they move from side to side at a cruising altitude)
  if( enemy.type === 'droneMini' || enemy.type === 'droneDouble' ) {

    // If the enemy reached its target or doesn't have one, find a point at his cruising altitude
    // Todo: Add additional target checks if multiple frames get skipped
    if( hasValidTarget(enemy) ) {
      aimTowardsTarget(enemy);
      return false;
    }
    else {
      setCruisingTarget(enemy);
      aimTowardsTarget(enemy);
      return true;
    }
  }

  // Ufos just go straight towards a random player and try to abduct him
  // Or just cruise around if there's nobody to abduct
  else if( enemy.type === 'ufo' ) {

    // If the current target is an enemy, just reaim and quit
    if( hasValidTarget(enemy) && enemy.target.type === 'player' ) {
      aimTowardsTarget(enemy);
      return false;
    }

    // If not, try to find a better (player) target. If not (and there's no current active point target), make it cruise for a bit.
    // Todo: Use a better metric for this (like the highest scoring player)
    var playerTarget = Targeting.findBestPlayerTarget(Entities.players, {x:0, y:-110});
    if( playerTarget !== null && playerTarget.type !== null ) {
      enemy.target = playerTarget;
      aimTowardsTarget(enemy);
      return true;
    }
    else if( ! hasValidTarget(enemy) ) {
      setCruisingTarget(enemy);
      aimTowardsTarget(enemy);
      return true;
    }
    else {
      aimTowardsTarget(enemy);
      return false;
    }

  }

  return false;
};


exports.simulateBulletMovement = function( deltaTime ) {

  updateBulletList( Entities.bullets, deltaTime );

  updateBombList( Entities.enemyBullets, deltaTime );

};


var updateBulletList = function(bulletList, deltaTime) {

  for(var ix in bulletList) {
    var bullet = bulletList[ix];
    bullet.x += bullet.vx * deltaTime / 1000.0;
    bullet.y += bullet.vy * deltaTime / 1000.0;

    // Remove the bullet if it goes outside the world bounds
    if( bullet.x < 0   || bullet.x > Entities.worldSize.x ||
        bullet.y < -20 || bullet.y > Entities.worldSize.y + 20) {
      bulletList.splice(ix, 1);
    }
  }

};


var updateBombList = function(bombList, deltaTime) {

  var now = new Date()*1;

  for(var ix in bombList) {
    var bomb = bombList[ix];
    var timeSeconds = (now - bomb.st) / 1000.0;
    bomb.x = bomb.sx + bomb.vx * timeSeconds; // x distance is linear
    bomb.y = bomb.sy + 0.5 * bomb.g * (timeSeconds * timeSeconds); // y distance is gravity-based (startY + 0.5*gravity*time^2)

    // Remove the bomb if it goes outside the world bounds
    if( bomb.x < 0   || bomb.x > Entities.worldSize.x ||
        bomb.y < -20 || bomb.y > Entities.worldSize.y + 20) {
      bombList.splice(ix, 1);
    }
  }

};


function jumpToTarget(enemy) {
  if( ! hasValidTarget(enemy) ){ return; }

  var position = getTargetPosition(enemy.target);

  enemy.x = position.x;
  enemy.y = position.y;
  enemy.vx = 0.0;
  enemy.vy = 0.0;

}


function getTargetPosition(target) {
  return {
    x: target.entity.x + (( target.offset !== null ) ? target.offset.x : 0),
    y: target.entity.y + (( target.offset !== null ) ? target.offset.y : 0)
  };
}


function distanceToTarget(enemy) {
  if( ! hasValidTarget(enemy) ) { return null; }

  return Utils.distanceTo(enemy, getTargetPosition(enemy.target));
}


var aimTowardsTarget = function(enemy) {
  if( typeof enemy.target !== 'undefined' && enemy.target !== null ) {

    var target = getTargetPosition(enemy.target);

    var angleToTarget = Utils.angleTo(enemy, target);
    enemy.vx = Math.cos(angleToTarget) * Entities.enemyTypes[enemy.type].speed;
    enemy.vy = Math.sin(angleToTarget) * Entities.enemyTypes[enemy.type].speed;
  }
};


var setCruisingTarget = function(enemy) {

  enemy.target = {
    type: 'point',
    entity: {
      x: Utils.getRandomHorizontalPosition(),
      y: Utils.getRandomAltitudePosition( Entities.enemyTypes[enemy.type].cruisingAltitude,
                                          Entities.enemyTypes[enemy.type].cruisingAltitudeVariation)
    },
    offset: null
  };

  return enemy;
};


var hasValidTarget = function(enemy) {
  if( enemy.target === null || typeof enemy.target === 'undefined' || typeof enemy.target.type === 'undefined' || typeof enemy.target.entity === 'undefined' ) {
    return false;
  }

  if( enemy.target.type === 'player' ) {
    if( typeof enemy.target.entity !== 'undefined' && enemy.target.entity !== null ) {
      return ((typeof enemy.target.entity.alive !== 'undefined') && enemy.target.entity.alive);
    } else {
      return false;
    }
  }
  // If the target is a point, make sure it hasn't reached it yet
  if( enemy.target.type === 'point' ) {

    var distance = Utils.distanceTo(enemy, getTargetPosition(enemy.target));

    return (distance > 1.0);
  }
};
